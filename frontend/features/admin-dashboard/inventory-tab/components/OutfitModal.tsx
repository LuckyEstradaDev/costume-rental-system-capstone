"use client";

import {useState} from "react";
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
import {addOutfitService} from "../services/outfitService";
import {IOutfit, Variant} from "../types/IOutfit";
import {imageUploadService} from "@/services/imageUploadService";
import {useOutfit} from "../hooks/useOutfit";
import ComboboxComponent from "@/components/Combobox";

export function OutfitModal() {
  const categories = ["Barong", "Gown"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = ["Red", "Blue", "Green"];
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sizeOpenIndex, setSizeOpenIndex] = useState<number | null>(null);
  const [colorOpenIndex, setColorOpenIndex] = useState<number | null>(null);
  const {setModalOpen, isModalOpen} = useOutfit();

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
              <Label>Categoryy</Label>

              <div className="relative">
                <Input
                  placeholder="Category"
                  value={outfitFormData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  onFocus={() => setCategoryOpen(true)}
                  onBlur={() => setTimeout(() => setCategoryOpen(false), 150)}
                  autoComplete="off"
                />

                {categoryOpen && (
                  <ComboboxComponent
                    items={categories}
                    value={outfitFormData.category}
                    onChange={(val) => {
                      setFormData((prev) => ({
                        ...prev,
                        category: val,
                      }));
                    }}
                    onClose={() => setCategoryOpen(false)}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Variants</Label>

              <div className="space-y-3">
                {outfitFormData.variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3">
                    <div className="relative">
                      <Input
                        placeholder="Size"
                        value={variant.size}
                        onChange={(e) =>
                          handleVariantChange(index, "size", e.target.value)
                        }
                        onFocus={() => setSizeOpenIndex(index)}
                        onBlur={() =>
                          setTimeout(() => {
                            setSizeOpenIndex((prev) =>
                              prev === index ? null : prev,
                            );
                          }, 150)
                        }
                        autoComplete="off"
                      />

                      {sizeOpenIndex === index && (
                        <ComboboxComponent
                          items={sizes}
                          value={variant.size}
                          onChange={(val) =>
                            handleVariantChange(index, "size", val)
                          }
                          onClose={() => setSizeOpenIndex(null)}
                        />
                      )}
                    </div>

                    <div className="relative">
                      <Input
                        placeholder="Color"
                        value={variant.color}
                        onChange={(e) =>
                          handleVariantChange(index, "color", e.target.value)
                        }
                        onFocus={() => setColorOpenIndex(index)}
                        onBlur={() =>
                          setTimeout(() => {
                            setColorOpenIndex((prev) =>
                              prev === index ? null : prev,
                            );
                          }, 150)
                        }
                        autoComplete="off"
                      />

                      {colorOpenIndex === index && (
                        <ComboboxComponent
                          items={colors}
                          value={variant.color}
                          onChange={(val) =>
                            handleVariantChange(index, "color", val)
                          }
                          onClose={() => setColorOpenIndex(null)}
                        />
                      )}
                    </div>

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
