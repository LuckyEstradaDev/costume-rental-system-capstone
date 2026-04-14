"use client";

import {useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {addOutfitService} from "../services/outfitService";
import {IOutfit, Variant} from "../types/IOutfit";
import {imageUploadService} from "@/services/imageUploadService";

export function AddOutfitModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const categories = ["Barong", "Gown"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = ["Red", "Blue", "Green"];

  const [outfitFormData, setFormData] = useState<IOutfit>({
    name: "",
    description: "",
    category: "",
    variants: [{size: "", color: "", stock: ""}],
    price: "",
    imageURL: undefined,
  });

  const handleValueChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({...prev, [e.target.name]: value}));
  };

  const handleVariantChange = (
    index: number,
    field: keyof Variant,
    value: string,
  ) => {
    setFormData((prev) => {
      const updated = [...prev.variants];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        variants: updated,
      };
    });
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, {size: "", color: "", stock: ""}],
      }));
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
      const {data} = await imageUploadService(outfitFormData.imageURL);
      const imageURLString = data.url;
      await addOutfitService({
        ...outfitFormData,
        imageURL: imageURLString,
      });
      alert("success");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogTrigger asChild>
        <Button>Add Outfit</Button>
      </DialogTrigger>

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
            handleSubmit();
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
              <Label>Category</Label>
              <Combobox
                items={categories}
                value={outfitFormData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: value ?? "",
                  }))
                }
              >
                <ComboboxInput placeholder="Category" />
                <ComboboxContent>
                  <ComboboxEmpty>No items found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Variants</Label>

              <div className="space-y-3">
                {outfitFormData.variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3">
                    <Combobox
                      items={sizes}
                      value={variant.size}
                      onValueChange={(value) =>
                        handleVariantChange(index, "size", value ?? "")
                      }
                    >
                      <ComboboxInput placeholder="Size" />
                      <ComboboxContent>
                        <ComboboxList>
                          {(item) => (
                            <ComboboxItem key={item} value={item}>
                              {item}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>

                    <Combobox
                      items={colors}
                      value={variant.color}
                      onValueChange={(value) =>
                        handleVariantChange(index, "color", value ?? "")
                      }
                    >
                      <ComboboxInput placeholder="Color" />
                      <ComboboxContent>
                        <ComboboxList>
                          {(item) => (
                            <ComboboxItem key={item} value={item}>
                              {item}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>

                    <Input
                      type="number"
                      placeholder="Stock"
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantChange(index, "stock", e.target.value)
                      }
                    />
                  </div>
                ))}
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
