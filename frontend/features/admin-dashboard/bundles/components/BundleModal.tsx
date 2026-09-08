"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {ImagePlus, PackagePlus, Search, Trash2, Upload, X} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import type {IOutfit} from "../../inventory-tab/types/IOutfit";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {fetchOutfitsService} from "../../inventory-tab/services/outfitService";
import {createBundleService} from "./services/BundleService";
import {useNotification} from "@/components/ui/alert";

type BundleModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ImageDraft = {
  id: string;
  file: File;
  previewUrl: string;
};

const createImageId = (file: File) =>
  `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;

export function BundleModal({open, onOpenChange}: BundleModalProps) {
  const client = useQueryClient();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [rentalPrice, setRentalPrice] = useState("");
  const [images, setImages] = useState<ImageDraft[]>([]);
  const [search, setSearch] = useState("");
  const [selectedOutfits, setSelectedOutfits] = useState<IOutfit[]>([]);
  const imagesRef = useRef(images);
  const {notify} = useNotification();

  const {data: outfits} = useQuery({
    queryKey: ["outfits"],
    queryFn: fetchOutfitsService,
    initialData: client.getQueryData<IOutfit[]>(["outfits"]) ?? [],
  });

  const createBundleMutation = useMutation({
    mutationFn: createBundleService,
    onSuccess: () => {
      client.invalidateQueries({queryKey: ["bundles"]});
      onOpenChange(false);
      notify({
        title: "Bundle created",
        description: "The bundle has been successfully created.",
        variant: "success",
      });
    },
  });

  const selectedIds = useMemo(
    () => new Set(selectedOutfits.map((outfit) => outfit._id)),
    [selectedOutfits],
  );

  const filteredOutfits = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return outfits.filter((outfit) => {
      if (selectedIds.has(outfit._id)) return false;
      if (!normalizedSearch) return true;

      return [outfit.name, outfit.category, outfit.fabricType]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(normalizedSearch));
    });
  }, [outfits, search, selectedIds]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(
    () => () => {
      imagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      );
    },
    [],
  );

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setImages((currentImages) => [
      ...currentImages,
      ...files.map((file) => ({
        id: createImageId(file),
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    event.target.value = "";
  };

  const removeImage = (imageId: string) => {
    setImages((currentImages) => {
      const image = currentImages.find((item) => item.id === imageId);
      if (image) URL.revokeObjectURL(image.previewUrl);
      return currentImages.filter((item) => item.id !== imageId);
    });
  };

  const addOutfit = (outfit: IOutfit) => {
    if (!selectedIds.has(outfit._id)) {
      setSelectedOutfits((currentOutfits) => [...currentOutfits, outfit]);
    }
  };

  const removeOutfit = (outfitId?: string) => {
    setSelectedOutfits((currentOutfits) =>
      currentOutfits.filter((outfit) => outfit._id !== outfitId),
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createBundleMutation.mutateAsync({
      name,
      price: parseFloat(price),
      rentalPrice: parseFloat(rentalPrice),
      imageURL: images.map((image) => image.previewUrl),
      items: selectedOutfits,
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setName("");
      setPrice("");
      setRentalPrice("");
      setImages([]);
      setSearch("");
      setSelectedOutfits([]);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-border/60 px-6 py-5">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PackagePlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Add bundle
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs">
                Create a bundle by combining existing outfits and bundle images.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form className="min-h-0 overflow-y-auto" onSubmit={handleSubmit}>
          <div className="grid gap-6 px-6 py-6">
            <div className="space-y-5">
              <section className="space-y-3">
                <div>
                  <Label
                    htmlFor="bundle-name"
                    className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground"
                  >
                    Bundle details
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Give this collection a clear name and pricing.
                  </p>
                </div>
                <Input
                  id="bundle-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Royal Court Collection"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="bundle-price">Purchase price</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                        ₱
                      </span>
                      <Input
                        id="bundle-price"
                        className="pl-7"
                        type="number"
                        min="0"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bundle-rental-price">Rental price</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                        ₱
                      </span>
                      <Input
                        id="bundle-rental-price"
                        className="pl-7"
                        type="number"
                        min="0"
                        value={rentalPrice}
                        onChange={(event) => setRentalPrice(event.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <Label className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                      Bundle images
                    </Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add one or more images for the bundle.
                    </p>
                  </div>
                  <label className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium transition hover:bg-muted">
                    <ImagePlus className="size-3.5" />
                    Add image
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                {images.length ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                      >
                        <img
                          src={image.previewUrl}
                          alt={image.file.name}
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/65 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                          aria-label={`Remove ${image.file.name}`}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-4 text-center transition hover:border-primary/50 hover:bg-muted/40">
                    <Upload className="size-5 text-muted-foreground" />
                    <span className="text-xs font-medium">
                      Choose bundle images
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      PNG, JPG, or WEBP
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </section>
            </div>

            <section className="min-w-0 space-y-3">
              <div>
                <Label className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  Bundle outfits
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Search inventory and select the outfits included in this
                  bundle.
                </p>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                  placeholder="Search by name, category, or fabric"
                  aria-label="Search outfits"
                />
              </div>

              <div className="max-h-52 space-y-1.5 overflow-y-auto rounded-lg border border-border/70 p-2">
                {filteredOutfits.length ? (
                  filteredOutfits.map((outfit) => (
                    <button
                      type="button"
                      key={outfit._id ?? outfit.name}
                      onClick={() => addOutfit(outfit)}
                      className="flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-muted"
                    >
                      <div className="size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        {typeof outfit.imageURL === "string" ? (
                          <img
                            src={outfit.imageURL}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : null}
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {outfit.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {outfit.category} · {outfit.fabricType}
                        </span>
                      </span>
                      <span className="text-xs font-medium text-primary">
                        Add
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-8 text-center text-xs text-muted-foreground">
                    {outfits.length
                      ? "No available outfits match your search."
                      : "No outfits are available yet."}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">
                    Selected outfits
                    <span className="ml-1 text-muted-foreground">
                      ({selectedOutfits.length})
                    </span>
                  </p>
                </div>
                {selectedOutfits.length ? (
                  <div className="space-y-2">
                    {selectedOutfits.map((outfit) => (
                      <div
                        key={outfit._id ?? outfit.name}
                        className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/20 p-2"
                      >
                        <div className="size-9 shrink-0 overflow-hidden rounded-md bg-muted">
                          {typeof outfit.imageURL === "string" ? (
                            <img
                              src={outfit.imageURL}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {outfit.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {outfit.category}
                            {outfit.price ? ` · ₱${outfit.price}` : ""}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeOutfit(outfit._id)}
                          aria-label={`Remove ${outfit.name}`}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border px-3 py-5 text-center text-xs text-muted-foreground">
                    Select outfits above to build this bundle.
                  </div>
                )}
              </div>
            </section>
          </div>

          <DialogFooter className="sticky bottom-0 mx-0 mb-0 shrink-0 border-t border-border/60 bg-background px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <PackagePlus />
              Add bundle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
