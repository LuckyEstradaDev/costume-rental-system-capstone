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

  const [variants, setVariants] = useState([{size: "", color: "", stock: ""}]);
  const [outfitFormData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    variants: [],
    price: 0,
    imageUrl: "",
  });

  const handleValueChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({...prev, [e.target.name]: e.target.value}));
  };

  const handleVariantChange = (
    index: number,
    field: keyof (typeof variants)[0],
    value: string | null,
  ) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value ?? "",
      };
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            alert(outfitFormData.category);
          }}
          className="space-y-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="outfit-name">Outfit Name</Label>
              <Input
                name="name"
                value={outfitFormData.name}
                onChange={handleValueChange}
                id="outfit-name"
                placeholder="Royal Barong Set"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Combobox
                items={categories}
                value={outfitFormData.category ?? ""}
                onValueChange={(value) => {
                  console.log("selected:", value);
                }}
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
                {variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3">
                    <Combobox
                      value={variant.size}
                      onValueChange={(value) =>
                        handleVariantChange(index, "size", value)
                      }
                      items={sizes}
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
                      value={variant.color}
                      onValueChange={(value) =>
                        handleVariantChange(index, "color", value)
                      }
                      items={colors}
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
                onClick={() =>
                  setVariants((prev) => [
                    ...prev,
                    {size: "", color: "", stock: ""},
                  ])
                }
              >
                + Add Variant
              </Button>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="rental-price">Rental Price</Label>
              <Input id="rental-price" type="number" placeholder="1200" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the outfit details, inclusions, and condition..."
              className="min-h-28"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-upload">Outfit Image</Label>
            <Input id="image-upload" type="file" accept="image/*" />
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
