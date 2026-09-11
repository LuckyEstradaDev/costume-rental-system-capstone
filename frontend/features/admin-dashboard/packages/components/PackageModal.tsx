"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {
  ChevronDown,
  ChevronUp,
  ImagePlus,
  PackagePlus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
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
import {
  fetchOutfitsService,
  updateOutfit,
} from "../../inventory-tab/services/outfitService";
import {
  createPackageService,
  updatePackageService,
} from "../services/PackageService";
import {useNotification} from "@/components/ui/alert";
import type {IPackage} from "../types/IPackage";
import {imageUploadService} from "@/services/imageUploadService";

type PackageModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageItem?: IPackage | null;
};

type ImageDraft = {
  id: string;
  file: File;
  previewUrl: string;
};

const createImageId = (file: File) =>
  `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;

export function PackageModal({
  open,
  onOpenChange,
  packageItem,
}: PackageModalProps) {
  const client = useQueryClient();
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"rental" | "purchase" | "both">("both");
  const [images, setImages] = useState<ImageDraft[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedOutfits, setSelectedOutfits] = useState<IOutfit[]>([]);
  const [openOutfitSettings, setOpenOutfitSettings] = useState<
    Record<string, boolean>
  >({});
  const imagesRef = useRef(images);
  const {notify} = useNotification();

  const {data: outfits} = useQuery({
    queryKey: ["outfits"],
    queryFn: fetchOutfitsService,
    initialData: client.getQueryData<IOutfit[]>(["outfits"]) ?? [],
  });

  const createPackageMutation = useMutation({
    mutationFn: createPackageService,
    onSuccess: () => {
      client.invalidateQueries({queryKey: ["packages"]});
      onOpenChange(false);
      notify({
        title: "Package created",
        description: "The package has been successfully created.",
        variant: "success",
      });
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: updatePackageService,
    onSuccess: () => {
      client.invalidateQueries({queryKey: ["packages"]});
      onOpenChange(false);
      notify({
        title: "Package updated",
        description: "The package has been successfully updated.",
        variant: "success",
      });
    },
  });

  const updateOutfitMutation = useMutation({
    mutationFn: updateOutfit,
  });

  const isSubmitting =
    createPackageMutation.isPending ||
    updatePackageMutation.isPending ||
    updateOutfitMutation.isPending;

  useEffect(() => {
    if (!open) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(packageItem?.name ?? "");
    setMode(packageItem?.mode ?? "both");
    setExistingImageUrls(packageItem?.imageURL ?? []);
    const packageOutfitIds = new Set(packageItem?.items ?? []);
    setSelectedOutfits(
      outfits.filter(
        (outfit) => Boolean(outfit._id) && packageOutfitIds.has(outfit._id!),
      ),
    );
    setOpenOutfitSettings({});
  }, [packageItem, open, outfits]);

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

  const purchaseTotal = useMemo(
    () =>
      selectedOutfits.reduce(
        (total, outfit) => total + (outfit.purchasePackagePrice ?? 0),
        0,
      ),
    [selectedOutfits],
  );

  const rentalTotal = useMemo(
    () =>
      selectedOutfits.reduce(
        (total, outfit) => total + (outfit.rentalPackagePrice ?? 0),
        0,
      ),
    [selectedOutfits],
  );

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

  const removeExistingImage = (imageUrl: string) => {
    setExistingImageUrls((currentUrls) =>
      currentUrls.filter((url) => url !== imageUrl),
    );
  };

  const addOutfit = (outfit: IOutfit) => {
    if (!selectedIds.has(outfit._id)) {
      setSelectedOutfits((currentOutfits) => [...currentOutfits, outfit]);
    }
  };

  const updateOutfitPackagePrice = (
    outfitId: string | undefined,
    field: "purchasePackagePrice" | "rentalPackagePrice",
    value: string,
  ) => {
    const parsedValue = value === "" ? null : Number(value);
    setSelectedOutfits((currentOutfits) =>
      currentOutfits.map((outfit) =>
        outfit._id === outfitId ? {...outfit, [field]: parsedValue} : outfit,
      ),
    );
  };

  const removeOutfit = (outfitId?: string) => {
    setSelectedOutfits((currentOutfits) =>
      currentOutfits.filter((outfit) => outfit._id !== outfitId),
    );
    if (outfitId) {
      setOpenOutfitSettings((current) => {
        const next = {...current};
        delete next[outfitId];
        return next;
      });
    }
  };

  const validatePackagePrices = () => {
    const invalidOutfit = selectedOutfits.find((outfit) => {
      const prices = [
        mode === "rental" || mode === "both"
          ? outfit.rentalPackagePrice
          : undefined,
        mode === "purchase" || mode === "both"
          ? outfit.purchasePackagePrice
          : undefined,
      ];
      return (
        prices.some((value) => value == null) ||
        prices.some(
          (value) => value != null && (!Number.isFinite(value) || value < 0),
        )
      );
    });

    if (invalidOutfit) {
      notify({
        title: "Invalid package prices",
        description: `Enter all required non-negative package prices for ${invalidOutfit.name}.`,
        variant: "error",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validatePackagePrices()) return;

    let outfitPricesSaved = false;
    try {
      const uploadedImageUrls = await Promise.all(
        images.map(async (image) => {
          const {data} = await imageUploadService(image.file);
          return data.url as string;
        }),
      );
      const packageData = {
        name,
        mode,
        imageURL: [...existingImageUrls, ...uploadedImageUrls],
        items: selectedOutfits.flatMap((outfit) => (outfit._id ? [outfit._id] : [])),
      };

      await Promise.all(
        selectedOutfits.map((outfit) => {
          if (!outfit._id) return Promise.resolve();

          return updateOutfitMutation.mutateAsync({
            outfitId: outfit._id,
            updateData: {
              purchasePackagePrice: outfit.purchasePackagePrice,
              rentalPackagePrice: outfit.rentalPackagePrice,
            },
          });
        }),
      );
      outfitPricesSaved = true;

      if (packageItem?._id) {
        await updatePackageMutation.mutateAsync({
          packageId: packageItem._id,
          updateData: packageData,
        });
      } else {
        await createPackageMutation.mutateAsync(packageData);
      }
    } catch (error) {
      console.error(error);
      notify({
        title: outfitPricesSaved ? "Package save failed" : "Save failed",
        description: outfitPricesSaved
          ? "Outfit package prices were saved, but the package was not. Please try saving the package again."
          : "Unable to save the package or outfit package prices. Please try again.",
        variant: "error",
      });
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setName("");
      setMode("both");
      setImages([]);
      setExistingImageUrls([]);
      setSearch("");
      setSelectedOutfits([]);
      setOpenOutfitSettings({});
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
                {packageItem ? "Edit package" : "Add package"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs">
                Create a package by combining existing outfits and package
                images.
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
                    htmlFor="package-name"
                    className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground"
                  >
                    Package details
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Give this collection a clear name and pricing.
                  </p>
                </div>
                <Input
                  id="package-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Royal Court Collection"
                />
                <div className="space-y-2">
                  <Label htmlFor="package-mode">Package availability</Label>
                  <select
                    id="package-mode"
                    value={mode}
                    onChange={(event) =>
                      setMode(event.target.value as typeof mode)
                    }
                    className="flex h-10 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="rental">For rent</option>
                    <option value="purchase">For purchase</option>
                    <option value="both">For rent and purchase</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5 text-sm">
                  {(mode === "purchase" || mode === "both") && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Purchase total
                      </p>
                      <p className="font-semibold">
                        ₱{purchaseTotal.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {(mode === "rental" || mode === "both") && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Rental total
                      </p>
                      <p className="font-semibold">
                        ₱{rentalTotal.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <Label className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                      Package images
                    </Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add one or more images for the package.
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
                {existingImageUrls.length || images.length ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {existingImageUrls.map((imageUrl) => (
                      <div
                        key={imageUrl}
                        className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                      >
                        <img
                          src={imageUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(imageUrl)}
                          className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/65 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                          aria-label="Remove existing package image"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
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
                      Choose package images
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
                  Package outfits
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Search inventory and select the outfits included in this
                  package.
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
                      className="flex w-full cursor-pointer items-center gap-3 rounded-md p-2 text-left transition hover:bg-muted-foreground/15"
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
                        className="rounded-lg border border-border/70 bg-muted/20"
                      >
                        <div className="flex items-center gap-3 p-2">
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
                            onClick={() =>
                              setOpenOutfitSettings((current) => ({
                                ...current,
                                [outfit._id ?? outfit.name]:
                                  !current[outfit._id ?? outfit.name],
                              }))
                            }
                            aria-expanded={
                              openOutfitSettings[outfit._id ?? outfit.name] ??
                              false
                            }
                            aria-label={`Toggle package prices for ${outfit.name}`}
                          >
                            {openOutfitSettings[outfit._id ?? outfit.name] ? (
                              <ChevronUp />
                            ) : (
                              <ChevronDown />
                            )}
                          </Button>
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
                        {openOutfitSettings[outfit._id ?? outfit.name] ? (
                          <div className="grid gap-3 border-t border-border/70 px-3 py-3 sm:grid-cols-2">
                            {(mode === "purchase" || mode === "both") && (
                              <div className="space-y-1.5">
                                <Label
                                  htmlFor={`purchase-package-${outfit._id}`}
                                >
                                  Purchase package price
                                </Label>
                                <div className="relative">
                                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                                    ₱
                                  </span>
                                  <Input
                                    id={`purchase-package-${outfit._id}`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="pl-7"
                                    value={outfit.purchasePackagePrice ?? ""}
                                    onChange={(event) =>
                                      updateOutfitPackagePrice(
                                        outfit._id,
                                        "purchasePackagePrice",
                                        event.target.value,
                                      )
                                    }
                                    placeholder="Required"
                                  />
                                </div>
                              </div>
                            )}
                            {(mode === "rental" || mode === "both") && (
                              <div className="space-y-1.5">
                                <Label htmlFor={`rental-package-${outfit._id}`}>
                                  Rental package price
                                </Label>
                                <div className="relative">
                                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                                    ₱
                                  </span>
                                  <Input
                                    id={`rental-package-${outfit._id}`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="pl-7"
                                    value={outfit.rentalPackagePrice ?? ""}
                                    onChange={(event) =>
                                      updateOutfitPackagePrice(
                                        outfit._id,
                                        "rentalPackagePrice",
                                        event.target.value,
                                      )
                                    }
                                    placeholder="Required"
                                  />
                                </div>
                              </div>
                            )}
                            <p className="text-[11px] text-muted-foreground sm:col-span-2">
                              Enter every price required by the selected package
                              mode. Changes update this outfit in inventory.
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border px-3 py-5 text-center text-xs text-muted-foreground">
                    Select outfits above to build this package.
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
            <Button type="submit" className="gap-2" disabled={isSubmitting}>
              <PackagePlus />
              {isSubmitting
                ? "Saving..."
                : packageItem
                  ? "Save changes"
                  : "Add package"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
