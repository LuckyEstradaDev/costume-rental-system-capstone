"use client";

import {useEffect, useState} from "react";
import {useNotification} from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";
import {addOutfitService, updateOutfit} from "../services/outfitService";
import {IOutfit} from "../types/IOutfit";
import {imageUploadService} from "@/services/imageUploadService";
import {useOutfit} from "../hooks/useOutfit";
import ComboboxComponent from "@/components/Combobox";
import {
  Plus,
  Trash2,
  Palette,
  Ruler,
  PackagePlus,
  ImagePlus,
  X,
} from "lucide-react";

const defaultOutfit: IOutfit = {
  name: "",
  description: "",
  category: "",
  variants: [],
  price: "",
  rentalPrice: "",
  imageURL: undefined,
};

export function OutfitModal() {
  const categories = ["Barong", "Gown", "Suit"];
  const colors = ["Red", "Blue", "Green", "White", "Black", "Ivory", "Gold"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
  const [imageChangedDetected, setImageChangedDetected] =
    useState<boolean>(false);
  const {setModalOpen, isModalOpen, isEdit, outfit, refreshOutfits} =
    useOutfit();

  const [outfitFormData, setFormData] = useState<IOutfit>(defaultOutfit);
  const {notify} = useNotification();

  useEffect(() => {
    if (isEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(outfit!);
    } else {
      setFormData(defaultOutfit);
    }
  }, [isEdit, isModalOpen, outfit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImageChangedDetected(true);
  }, [outfitFormData.imageURL]);

  const handleValueChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({...prev, [e.target.name]: value}));
  };

  const handleVariantChange = (
    variantIndex: number,
    sizeIndex: number | null,
    field: string,
    value: string | number,
  ) => {
    setFormData((prev) => {
      const updated = [...prev.variants];
      if (field === "color") {
        updated[variantIndex] = {
          ...updated[variantIndex],
          color: value as string,
        };
      } else if (field === "size" && sizeIndex !== null) {
        updated[variantIndex].sizes[sizeIndex] = {
          ...updated[variantIndex].sizes[sizeIndex],
          size: value as string,
        };
      } else if (field === "stock" && sizeIndex !== null) {
        updated[variantIndex].sizes[sizeIndex] = {
          ...updated[variantIndex].sizes[sizeIndex],
          stock: Number(value),
        };
      }
      return {...prev, variants: updated};
    });
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, {color: "", sizes: [{size: "", stock: 0}]}],
    }));
  };

  const handleAddSize = (variantIndex: number) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      variants[variantIndex] = {
        ...variants[variantIndex],
        sizes: [...variants[variantIndex].sizes, {size: "", stock: 0}],
      };
      return {...prev, variants};
    });
  };

  const handleFilePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFormData((prev) => ({...prev, imageURL: selectedFile}));
  };

  const handleSubmit = async () => {
    try {
      let imageURLString: string;
      if (outfitFormData.imageURL instanceof File) {
        const {data} = await imageUploadService(outfitFormData.imageURL);
        imageURLString = data.url;
      } else {
        imageURLString = outfitFormData.imageURL as string;
      }
      await addOutfitService({...outfitFormData, imageURL: imageURLString});
      await refreshOutfits();
      setModalOpen(false);
      notify({
        title: "Outfit added",
        description: "The outfit was added to inventory.",
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      notify({
        title: "Save failed",
        description: "Unable to add outfit. Please try again.",
        variant: "error",
      });
    }
  };

  const handleEdit = async () => {
    try {
      if (
        isEdit &&
        imageChangedDetected &&
        outfitFormData.imageURL instanceof File
      ) {
        const {data: imagedata} = await imageUploadService(
          outfitFormData.imageURL,
        );
        await updateOutfit(outfitFormData._id!, {
          ...outfitFormData,
          imageURL: imagedata.url,
        });
      } else {
        await updateOutfit(outfitFormData._id!, outfitFormData);
      }

      await refreshOutfits();
      setModalOpen(false);
      notify({
        title: "Outfit updated",
        description: "The outfit was successfully updated.",
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      notify({
        title: "Update failed",
        description: "Unable to update outfit. Please try again.",
        variant: "error",
      });
    }
  };

  const handleDeleteVariant = (variantIndex: number) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      variants.splice(variantIndex, 1);
      return {...prev, variants};
    });
  };

  const handleDeleteSize = (variantIndex: number, sizeIndex: number) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      variants[variantIndex].sizes.splice(sizeIndex, 1);
      return {...prev, variants};
    });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl pb-4">
        {/* ── Header ── */}
        <DialogHeader className="shrink-0 border-b border-border/60 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <PackagePlus className="size-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {isEdit ? "Edit Outfit" : "Add New Outfit"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isEdit
                  ? "Update the outfit details in your inventory."
                  : "Fill in the details to add a new outfit to inventory."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Scrollable body ── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isEdit) {
              handleEdit();
            } else {
              handleSubmit();
            }
          }}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-6">
              {/* Basic info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Outfit Name
                  </Label>
                  <Input
                    name="name"
                    value={outfitFormData.name}
                    onChange={handleValueChange}
                    placeholder="e.g. Royal Barong Set"
                    className="rounded-lg border-border/60 bg-muted/30 focus-visible:bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Category
                  </Label>
                  <ComboboxComponent
                    items={categories}
                    value={outfitFormData.category}
                    placeholder="Select category"
                    onChange={(val) =>
                      setFormData((prev) => ({...prev, category: val}))
                    }
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Buying Price (₱)
                  </Label>
                  <Input
                    name="price"
                    type="number"
                    value={outfitFormData.price}
                    onChange={handleValueChange}
                    placeholder="0"
                    className="rounded-lg border-border/60 bg-muted/30 focus-visible:bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Rental Price(₱)
                  </Label>
                  <Input
                    name="rentalPrice"
                    type="number"
                    value={outfitFormData.rentalPrice}
                    onChange={handleValueChange}
                    placeholder="0"
                    className="rounded-lg border-border/60 bg-muted/30 focus-visible:bg-background"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Description
                </Label>
                <Textarea
                  name="description"
                  value={outfitFormData.description}
                  onChange={handleValueChange}
                  placeholder="Describe the outfit style, material, occasion…"
                  className="min-h-24 resize-none rounded-lg border-border/60 bg-muted/30 text-sm focus-visible:bg-background"
                />
              </div>

              {/* Image upload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Outfit Image
                </Label>

                {/* Preview — shown when a file or existing URL is present */}
                {outfitFormData.imageURL && (
                  <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                    <img
                      src={
                        outfitFormData.imageURL instanceof File
                          ? URL.createObjectURL(outfitFormData.imageURL)
                          : outfitFormData.imageURL.toString()
                      }
                      alt="Outfit preview"
                      className="h-48 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({...prev, imageURL: undefined}))
                      }
                      className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                )}

                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center transition-colors hover:bg-muted/40">
                  <ImagePlus className="size-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {outfitFormData.imageURL instanceof File
                        ? outfitFormData.imageURL.name
                        : outfitFormData.imageURL
                          ? "Click to replace image"
                          : "Click to upload image"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP up to 10MB
                    </p>
                  </div>
                  <Input
                    onChange={handleFilePicker}
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>

              {/* Variants */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Variants
                  </Label>
                  <Badge variant="secondary" className="text-[11px]">
                    {outfitFormData.variants.length}{" "}
                    {outfitFormData.variants.length === 1
                      ? "variant"
                      : "variants"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {outfitFormData.variants.map((variant, variantIndex) => (
                    <div
                      key={variantIndex}
                      className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3"
                    >
                      {/* Variant header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Palette className="size-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold text-muted-foreground">
                            Variant {variantIndex + 1}
                          </span>
                          {variant.color && (
                            <span
                              className="size-3 rounded-full border border-border/50 shadow-sm"
                              style={{
                                backgroundColor: variant.color.toLowerCase(),
                              }}
                            />
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteVariant(variantIndex)}
                          className="size-7 rounded-lg text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                      {/* Color picker */}
                      <ComboboxComponent
                        items={colors}
                        value={variant.color}
                        placeholder="Select color"
                        onChange={(val) =>
                          handleVariantChange(variantIndex, null, "color", val)
                        }
                      />

                      {/* Sizes */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Ruler className="size-3 text-muted-foreground" />
                          <span className="text-[11px] font-medium text-muted-foreground">
                            Sizes & Stock
                          </span>
                        </div>

                        {variant.sizes.map((size, sizeIndex) => (
                          <div
                            key={sizeIndex}
                            className="flex items-center gap-2"
                          >
                            <ComboboxComponent
                              items={sizes}
                              value={size.size}
                              placeholder="Size"
                              onChange={(val) =>
                                handleVariantChange(
                                  variantIndex,
                                  sizeIndex,
                                  "size",
                                  val,
                                )
                              }
                            />
                            <Input
                              placeholder="Stock"
                              type="number"
                              min={0}
                              value={
                                size.stock === 0 && document.activeElement
                                  ? ""
                                  : size.stock
                              }
                              onChange={(e) =>
                                handleVariantChange(
                                  variantIndex,
                                  sizeIndex,
                                  "stock",
                                  e.target.value === "" ? 0 : e.target.value,
                                )
                              }
                              onFocus={(e) => e.target.select()} // ← selects "0" on click so typing replaces it instantly
                              className="w-24 rounded-lg border-border/60 bg-background text-sm"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDeleteSize(variantIndex, sizeIndex)
                              }
                              className="size-9 shrink-0 rounded-lg text-muted-foreground hover:text-destructive"
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddSize(variantIndex)}
                          className="h-8 gap-1.5 rounded-lg border-dashed text-xs"
                        >
                          <Plus className="size-3" />
                          Add Size
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 rounded-xl border-dashed text-sm font-medium"
                  onClick={addVariant}
                >
                  <Plus className="size-4" />
                  Add Variant
                </Button>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <DialogFooter className="shrink-0 border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-2 rounded-xl">
              <PackagePlus className="size-4" />
              {isEdit ? "Save Changes" : "Add Outfit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
