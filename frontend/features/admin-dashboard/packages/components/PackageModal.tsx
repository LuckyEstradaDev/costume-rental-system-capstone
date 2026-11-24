"use client";

import {Shirt as EmptyIcon} from "lucide-react";
import {EmptyState} from "@/components/ui/empty-state";
import Image from "next/image";
import {motion, useReducedMotion} from "framer-motion";
import {useEffect, useMemo, useRef, useState} from "react";
import {
  ChevronDown,
  ChevronUp,
  ImagePlus,
  PackagePlus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {AdminSearchInput} from "@/features/admin-dashboard/components/AdminSearchInput";
import {
  AdminDialogBody,
  AdminDialogContent,
  AdminDialogFooter,
  AdminDialogHeader,
} from "@/features/admin-dashboard/components/AdminDialog";
import {Dialog} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import ComboboxComponent from "@/components/Combobox";
import type {IOutfit} from "../../inventory-tab/types/IOutfit";
import {getOutfitBranchLabel} from "../../inventory-tab/constants/constants";
import {OutfitBranchBadge} from "@/features/reusable/OutfitBranchBadge";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  fetchOutfitsService,
} from "../../inventory-tab/services/outfitService";
import {
  createPackageService,
  updatePackageService,
} from "../services/PackageService";
import {useNotification} from "@/components/ui/alert";
import {DiscardChangesDialog} from "@/components/DiscardChangesDialog";
import {isFormDirty} from "@/lib/form-dirty";
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

type PackageItemDraft = {
  _id: string;
  // null = field cleared in the UI; saved packages fall back to 1 via `?? 1`.
  minimumQuantity: number | null;
  purchasePackagePrice: number | null;
  rentalPackagePrice: number | null;
};

const availabilityOptions = [
  {value: "rental", label: "For rent"},
  {value: "purchase", label: "For purchase"},
  {value: "both", label: "For rent and purchase"},
] as const;

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
  const [packageItems, setPackageItems] = useState<PackageItemDraft[]>([]);
  const [openOutfitSettings, setOpenOutfitSettings] = useState<
    Record<string, boolean>
  >({});
  const imagesRef = useRef(images);
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscardPromptOpen, setIsDiscardPromptOpen] = useState(false);
  // Ref guard closes the window before the first re-render, so a double
  // submit can never start two upload + create sequences.
  const submittingRef = useRef(false);
  const {notify} = useNotification();
  const reduceMotion = useReducedMotion();

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

  // isSaving covers the image-upload phase, which runs before any mutation
  // starts and therefore before either mutation reports isPending.
  const isSubmitting =
    isSaving ||
    createPackageMutation.isPending ||
    updatePackageMutation.isPending;

  useEffect(() => {
    if (!open) return;

    setName(packageItem?.name ?? "");
    setMode(packageItem?.mode ?? "both");
    setExistingImageUrls(packageItem?.imageURL ?? []);
    setPackageItems(
      (packageItem?.items ?? []).map((item) => ({
        _id: item._id,
        minimumQuantity: item.minimumQuantity ?? 1,
        purchasePackagePrice: item.purchasePackagePrice ?? null,
        rentalPackagePrice: item.rentalPackagePrice ?? null,
      })),
    );
    setOpenOutfitSettings({});
  }, [packageItem, open]);

  // The draft as it stands, next to the draft the form was seeded with. The
  // search box and the expanded outfit settings are left out on purpose: they
  // are not part of the saved package.
  const currentDraft = useMemo(
    () => ({
      name,
      mode,
      imageIds: images.map((image) => image.id),
      existingImageUrls,
      items: packageItems.map((item) => ({
        _id: item._id,
        minimumQuantity: item.minimumQuantity,
        purchasePackagePrice: item.purchasePackagePrice,
        rentalPackagePrice: item.rentalPackagePrice,
      })),
    }),
    [
      name,
      mode,
      images,
      existingImageUrls,
      packageItems,
    ],
  );

  const baselineDraft = useMemo(
    () => ({
      name: packageItem?.name ?? "",
      mode: packageItem?.mode ?? ("both" as const),
      imageIds: [] as string[],
      existingImageUrls: packageItem?.imageURL ?? [],
      items: (packageItem?.items ?? []).map((item) => ({
        _id: item._id,
        minimumQuantity: item.minimumQuantity ?? 1,
        purchasePackagePrice: item.purchasePackagePrice ?? null,
        rentalPackagePrice: item.rentalPackagePrice ?? null,
      })),
    }),
    [packageItem],
  );

  const isDirty = isFormDirty(currentDraft, baselineDraft);

  const selectedIds = useMemo(
    () => new Set(packageItems.map((item) => item._id)),
    [packageItems],
  );

  const outfitsById = useMemo(
    () => new Map(outfits.map((outfit) => [outfit._id, outfit])),
    [outfits],
  );

  const filteredOutfits = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return outfits.filter((outfit) => {
      if (!outfit._id || selectedIds.has(outfit._id)) return false;
      if (!normalizedSearch) return true;

      return [
        outfit.name,
        outfit.category,
        outfit.fabricType,
        getOutfitBranchLabel(outfit.branch),
      ]
        .filter((field): field is string => Boolean(field))
        .some((field) => field.toLowerCase().includes(normalizedSearch));
    });
  }, [outfits, search, selectedIds]);

  const purchaseTotal = useMemo(
    () =>
      packageItems.reduce(
        (total, item) =>
          total +
          (item.purchasePackagePrice ?? 0) * (item.minimumQuantity ?? 1),
        0,
      ),
    [packageItems],
  );

  const rentalTotal = useMemo(
    () =>
      packageItems.reduce(
        (total, item) =>
          total + (item.rentalPackagePrice ?? 0) * (item.minimumQuantity ?? 1),
        0,
      ),
    [packageItems],
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

    const newImages = files.map((file) => ({
      id: createImageId(file),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((currentImages) => [...currentImages, ...newImages]);
    event.target.value = "";
  };

  const removeImage = (imageId: string) => {
    const image = images.find((item) => item.id === imageId);
    if (image) URL.revokeObjectURL(image.previewUrl);
    setImages((currentImages) => currentImages.filter((item) => item.id !== imageId));
  };

  const removeExistingImage = (imageUrl: string) => {
    setExistingImageUrls((currentUrls) =>
      currentUrls.filter((url) => url !== imageUrl),
    );
  };

  const addOutfit = (outfit: IOutfit) => {
    const outfitId = outfit._id;
    if (!outfitId) return;
    setPackageItems((currentItems) =>
      currentItems.some((item) => item._id === outfitId)
        ? currentItems
        : [...currentItems, {
            _id: outfitId,
            minimumQuantity: 1,
            purchasePackagePrice: null,
            rentalPackagePrice: null,
          }],
    );
  };

  const updateOutfitPackagePrice = (
    outfitId: string,
    field: "purchasePackagePrice" | "rentalPackagePrice",
    value: string,
  ) => {
    const parsedValue = value === "" ? null : Number(value);
    setPackageItems((currentItems) =>
      currentItems.map((item) =>
        item._id === outfitId ? {...item, [field]: parsedValue} : item,
      ),
    );
  };

  const updateOutfitMinimumQuantity = (
    outfitId: string,
    value: string,
  ) => {
    // Keep the cleared state as null so the input can actually be emptied;
    // coercing "" to 0 here is what made backspacing the 0 impossible.
    const parsedValue =
      value === "" || Number.isNaN(Number(value)) ? null : Number(value);
    setPackageItems((currentItems) =>
      currentItems.map((item) =>
        item._id === outfitId ? {...item, minimumQuantity: parsedValue} : item,
      ),
    );
  };

  const removeOutfit = (outfitId: string) => {
    setPackageItems((currentItems) =>
      currentItems.filter((item) => item._id !== outfitId),
    );
    setOpenOutfitSettings((current) => {
      const next = {...current};
      delete next[outfitId];
      return next;
    });
  };

  const validatePackagePrices = () => {
    const invalidItem = packageItems.find((item) => {
      const prices = [
        mode === "rental" || mode === "both"
          ? item.rentalPackagePrice
          : undefined,
        mode === "purchase" || mode === "both"
          ? item.purchasePackagePrice
          : undefined,
      ].filter((price) => price !== undefined);
      return (
        prices.some((value) => value == null) ||
        prices.some(
          (value) => value != null && (!Number.isFinite(value) || value < 0),
        )
      );
    });

    if (invalidItem) {
      const outfitName = outfitsById.get(invalidItem._id)?.name ?? "the unavailable outfit";
      notify({
        title: "Invalid package prices",
        description: `Enter all required non-negative package prices for ${outfitName}.`,
        variant: "error",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current || isSubmitting) return;

    submittingRef.current = true;
    setIsSaving(true);

    try {
      if (!validatePackagePrices()) return;

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
        items: packageItems.map((item) => ({
          ...item,
          minimumQuantity: item.minimumQuantity ?? 1,
        })),
      };

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
        title: "Save failed",
        description: "Unable to save the package. Please try again.",
        variant: "error",
      });
    } finally {
      submittingRef.current = false;
      setIsSaving(false);
    }
  };

  const closeNow = () => {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setName("");
    setMode("both");
    setImages([]);
    setExistingImageUrls([]);
    setSearch("");
    setPackageItems([]);
    setOpenOutfitSettings({});
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (isSubmitting || submittingRef.current) return;
    if (isDirty) {
      setIsDiscardPromptOpen(true);
      return;
    }
    closeNow();
  };

  const handleDiscardChanges = () => {
    setIsDiscardPromptOpen(false);
    closeNow();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen && !isDiscardPromptOpen) handleCancel();
    }}>
      <AdminDialogContent width="3xl">
        <AdminDialogHeader
          icon={PackagePlus}
          title={packageItem ? "Edit package" : "Add package"}
          description="Create a package by combining existing outfits and package images."
        />

        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <AdminDialogBody className="grid gap-8">
            <div className="space-y-8">
              <section className="space-y-3">
                <div>
                  <Label
                    htmlFor="package-name"
                    className="text-sm font-semibold text-foreground"
                  >
                    Package details
                  </Label>
                  <p className="mt-1 text-base text-secondary leading-relaxed">
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
                  <ComboboxComponent
                    id="package-mode"
                    items={availabilityOptions.map((option) => option.label)}
                    value={availabilityOptions.find((option) => option.value === mode)?.label ?? ""}
                    onChange={(label) => {
                      const selected = availabilityOptions.find((option) => option.label === label);
                      if (selected) setMode(selected.value);
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5 text-sm">
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
                    <Label className="text-sm font-semibold text-foreground">
                      Package images
                    </Label>
                    <p className="mt-1 text-base text-secondary leading-relaxed">
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
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {existingImageUrls.map((imageUrl) => (
                      <div
                        key={imageUrl}
                        className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/30"
                      >
                        <Image
                          unoptimized
                          fill
                          src={imageUrl}
                          alt=""
                          className="object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(imageUrl)}
                          className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/65 text-white transition-colors hover:bg-black/80"
                          aria-label="Remove existing package image"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/30"
                      >
                        <Image
                          unoptimized
                          fill
                          src={image.previewUrl}
                          alt={image.file.name}
                          className="object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/65 text-white transition-colors hover:bg-black/80"
                          aria-label={`Remove ${image.file.name}`}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center transition hover:border-primary/50 hover:bg-muted/40">
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
                <Label className="text-sm font-semibold text-foreground">
                  Package outfits
                </Label>
                <p className="mt-1 text-base text-secondary leading-relaxed">
                  Search inventory and select the outfits included in this
                  package.
                </p>
              </div>
              <AdminSearchInput
                value={search}
                onValueChange={setSearch}
                placeholder="Search"
                aria-label="Search outfits"
                wrapperClassName="w-full sm:w-64"
              />

              <div className="max-h-52 space-y-1.5 overflow-y-auto rounded-xl border border-border/70 p-2">
                {filteredOutfits.length ? (
                  filteredOutfits.map((outfit) => (
                    <button
                      type="button"
                      key={outfit._id ?? outfit.name}
                      onClick={() => addOutfit(outfit)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-md p-2 text-left transition hover:bg-muted-foreground/15"
                    >
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {typeof outfit.imageURL === "string" ? (
                          <Image
                            unoptimized
                            fill
                            src={outfit.imageURL}
                            alt=""
                            className="object-contain"
                          />
                        ) : null}
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {outfit.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {outfit.category} {outfit.fabricType}
                        </span>
                      </span>
                    </button>
                  ))
                ) : (
                  <EmptyState
                    icon={EmptyIcon}
                    title={outfits.length ? "No available outfits match your search" : "No outfits are available yet"}
                    className="min-h-0 py-6"
                  />
                )}
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">
                    Selected outfits
                    <span className="ml-1 text-muted-foreground">
                      ({packageItems.length})
                    </span>
                  </p>
                </div>
                {packageItems.length ? (
                  <div className="space-y-2">
                    {packageItems.map((item) => {
                      const outfit = outfitsById.get(item._id);
                      const outfitName = outfit?.name ?? "Unavailable outfit";
                      const isExpanded = openOutfitSettings[item._id] ?? false;
                      return (
                        <motion.div
                          key={item._id}
                          layout={reduceMotion === false ? "position" : false}
                          transition={{duration: 0.25, ease: "easeInOut"}}
                          className="rounded-lg border border-border bg-background"
                        >
                          <div className="flex items-center gap-3 p-2">
                            <div className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                              {typeof outfit?.imageURL === "string" ? (
                                <Image
                                  unoptimized
                                  fill
                                  src={outfit.imageURL}
                                  alt=""
                                  className="object-contain"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {outfitName}
                              </p>
                              <OutfitBranchBadge
                                branch={outfit?.branch}
                                className="mt-0.5"
                              />
                              <p className="truncate text-xs text-muted-foreground">
                                {outfit?.category}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() =>
                                setOpenOutfitSettings((current) => ({
                                  ...current,
                                  [item._id]:
                                    !current[item._id],
                                }))
                              }
                              aria-expanded={isExpanded}
                              aria-label={`Toggle package prices for ${outfitName}`}
                            >
                              {isExpanded ? (
                                <ChevronUp />
                              ) : (
                                <ChevronDown />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => removeOutfit(item._id)}
                              aria-label={`Remove ${outfitName}`}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                          {isExpanded ? (
                            <div className="grid gap-3 border-t border-border/70 px-3 py-3 sm:grid-cols-2">
                              {(mode === "purchase" || mode === "both") && (
                                <div className="space-y-1.5">
                                  <Label
                                    htmlFor={`purchase-package-${item._id}`}
                                  >
                                    Purchase price
                                  </Label>
                                  <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                                      ₱
                                    </span>
                                    <Input
                                      id={`purchase-package-${item._id}`}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      className="pl-7"
                                      value={
                                        item.purchasePackagePrice ?? ""
                                      }
                                      onChange={(event) =>
                                        updateOutfitPackagePrice(
                                          item._id,
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
                                  <Label htmlFor={`rental-package-${item._id}`}>
                                    Rental price
                                  </Label>
                                  <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                                      ₱
                                    </span>
                                    <Input
                                      id={`rental-package-${item._id}`}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      className="pl-7"
                                      value={
                                        item.rentalPackagePrice ?? ""
                                      }
                                      onChange={(event) =>
                                        updateOutfitPackagePrice(
                                          item._id,
                                          "rentalPackagePrice",
                                          event.target.value,
                                        )
                                      }
                                      placeholder="Required"
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="space-y-1.5">
                                <Label htmlFor={`minimum-package-${item._id}`}>
                                  Minimum quantity
                                </Label>
                                <div className="relative">
                                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                                    #
                                  </span>
                                  <Input
                                    id={`minimum-package-${item._id}`}
                                    type="number"
                                    min="1"
                                    step="1"
                                    className="pl-7"
                                    value={
                                      item.minimumQuantity ?? ""
                                    }
                                    onChange={(event) =>
                                      updateOutfitMinimumQuantity(
                                        item._id,
                                        event.target.value,
                                      )
                                    }
                                    placeholder="Required"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border px-3 py-5 text-center text-xs text-muted-foreground">
                    Select outfits above to build this package.
                  </div>
                )}
              </div>
            </section>
          </AdminDialogBody>

          <AdminDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-2" loading={isSubmitting}>
              {!isSubmitting && <PackagePlus className="size-4" />}
              {isSubmitting
                ? "Saving…"
                : packageItem
                  ? "Save changes"
                  : "Add package"}
            </Button>
          </AdminDialogFooter>
        </form>
      </AdminDialogContent>

      <DiscardChangesDialog
        open={isDiscardPromptOpen}
        onOpenChange={setIsDiscardPromptOpen}
        onDiscard={handleDiscardChanges}
        subject="package"
      />
    </Dialog>
  );
}
