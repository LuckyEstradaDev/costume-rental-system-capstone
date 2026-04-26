"use client";

import {useEffect, useState} from "react";
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
import {addOutfitService, updateOutfit} from "../services/outfitService";
import {IOutfit} from "../types/IOutfit";
import {imageUploadService} from "@/services/imageUploadService";
import {useOutfit} from "../hooks/useOutfit";
import ComboboxComponent from "@/components/Combobox";
export function OutfitModal() {
  const categories = ["Barong", "Gown"];
  const colors = ["Red", "Blue", "Green"];
  const [imageChangedDetected, setImageChangedDetected] =
    useState<boolean>(false);
  const {setModalOpen, isModalOpen, isEdit, outfit} = useOutfit();
  const defaultOutfit: IOutfit = {
    name: "",
    description: "",
    category: "",
    variants: [],
    price: "",
    imageURL: undefined,
  };

  const [outfitFormData, setFormData] = useState<IOutfit>(defaultOutfit);

  useEffect(() => {
    if (isEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(outfit!);
      console.log(outfit);
    } else {
      setFormData(defaultOutfit);
    }
  }, [isModalOpen]);

  //detect if image has changed
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

      return {
        ...prev,
        variants: updated,
      };
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
      const variant = variants[variantIndex];

      variants[variantIndex] = {
        ...variant,
        sizes: [...variant.sizes, {size: "", stock: 0}],
      };

      return {...prev, variants};
    });
  };

  const handleFilePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFormData((prev) => ({
      ...prev,
      imageURL: selectedFile,
    }));
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
      await addOutfitService({
        ...outfitFormData,
        imageURL: imageURLString,
      });
      alert("success");
    } catch (error) {
      console.error(error);
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
        const imageURLString = imagedata.url;
        const {data} = await updateOutfit(outfitFormData._id!, {
          ...outfitFormData,
          imageURL: imageURLString,
        });
        alert("update success");
      } else {
        const {data} = await updateOutfit(outfitFormData._id!, outfitFormData);
        alert("update success");
      }
    } catch (error) {
      console.error(error);
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
      const variant = variants[variantIndex];
      variant.sizes.splice(sizeIndex, 1);
      variants[variantIndex] = variant;
      return {...prev, variants};
    });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Outfit</DialogTitle>
          <DialogDescription>
            Fill in the outfit details for your inventory.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            isEdit ? handleEdit() : handleSubmit();
          }}
          className="space-y-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Outfit Name</Label>
              <Input
                name="name"
                value={outfitFormData.name}
                onChange={handleValueChange}
                placeholder="Royal Barong Set"
              />
            </div>

            <div className="space-y-2">
              <Label>Categoryy</Label>

              <ComboboxComponent
                items={categories}
                value={outfitFormData.category}
                placeholder="Category"
                onChange={(val) => {
                  setFormData((prev) => ({
                    ...prev,
                    category: val,
                  }));
                }}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Variants</Label>

              <div className="space-y-3">
                {outfitFormData.variants.map((variant, variantIndex) => {
                  return (
                    <div key={variantIndex} className="space-y-2">
                      <ComboboxComponent
                        items={colors}
                        value={variant.color}
                        placeholder="Color"
                        onChange={(val) =>
                          handleVariantChange(variantIndex, null, "color", val)
                        }
                      />

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDeleteVariant(variantIndex)}
                      >
                        Delete Variant
                      </Button>

                      {variant.sizes.map((size, sizeIndex) => {
                        return (
                          <div
                            key={sizeIndex}
                            className="flex items-center gap-2"
                          >
                            <Input
                              placeholder="Size"
                              value={size.size}
                              onChange={(e) =>
                                handleVariantChange(
                                  variantIndex,
                                  sizeIndex,
                                  "size",
                                  e.target.value,
                                )
                              }
                            />
                            <Input
                              placeholder="Stock"
                              type="number"
                              value={size.stock}
                              onChange={(e) =>
                                handleVariantChange(
                                  variantIndex,
                                  sizeIndex,
                                  "stock",
                                  e.target.value,
                                )
                              }
                            />

                            <Button
                              type="button"
                              onClick={() =>
                                handleDeleteSize(variantIndex, sizeIndex)
                              }
                            >
                              Delete Size
                            </Button>
                          </div>
                        );
                      })}
                      <Button
                        type="button"
                        onClick={() => handleAddSize(variantIndex)}
                      >
                        + Add Size
                      </Button>
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full"
                onClick={addVariant}
              >
                + Add Variant
              </Button>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Rental Price</Label>
              <Input
                name="price"
                type="number"
                value={outfitFormData.price}
                onChange={handleValueChange}
                placeholder="1200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Description"
              name="description"
              value={outfitFormData.description}
              onChange={handleValueChange}
              className="min-h-28"
            />
          </div>

          <div className="space-y-2">
            <Label>Outfit Image</Label>
            <Input onChange={handleFilePicker} type="file" accept="image/*" />
          </div>

          <DialogFooter>
            <Button type="submit">Save Outfit</Button>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
