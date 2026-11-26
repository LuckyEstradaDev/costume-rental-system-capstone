"use client";

import {EmptyState} from "@/components/ui/empty-state";
import Image from "next/image";
import {OutfitCard} from "@/features/user-dashboard/browse-tab/components/OutfitCard";
import {PackageCard} from "@/features/user-dashboard/browse-tab/components/PackageCard";
import {BrowseGridSkeleton} from "@/features/user-dashboard/browse-tab/components/Skeleton";
import {getOutfitArFit} from "@/features/user-dashboard/browse-tab/utils/outfitAr";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {
  type IOutfit,
  type OutfitBranch,
} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {fetchPackagesService} from "@/features/admin-dashboard/packages/services/PackageService";
import {useState, useMemo, useRef} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {sortArrayByLatestDate} from "@/lib/helper";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowRight,
  X,
  PackageSearch,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CATEGORIES,
  OUTFIT_BRANCHES,
  getOutfitBranchLabel,
} from "@/features/admin-dashboard/inventory-tab/constants/constants";
import {AnimatePresence, motion} from "framer-motion";
import {
  fadeInUp,
  scaleIn,
  staggerContainer,
  staggerItem,
} from "@/components/motion";
import {useQuery} from "@tanstack/react-query";

const SORT_OPTIONS = [
  {label: "Newest First", value: "newest"},
  {label: "Price: Low to High", value: "price-asc"},
  {label: "Price: High to Low", value: "price-desc"},
  {label: "Name: A to Z", value: "name-asc"},
];

const matchesOutfitCategory = (outfit: IOutfit, category: string) =>
  category === "all" ||
  (outfit.category ?? "").toLowerCase().includes(category.replace(/s$/, "").toLowerCase());

export default function Dashboard() {
  const [priceMode, setPriceMode] = useState<"rent" | "purchase">("rent");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeBranch, setActiveBranch] = useState<OutfitBranch | "all">("all");
  const [onlyAr, setOnlyAr] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState("newest");
  const catalogHeadingRef = useRef<HTMLHeadingElement>(null);

  const outfitsQuery = useQuery({
    queryKey: ["outfits"],
    queryFn: fetchOutfitsService,
  });
  const packagesQuery = useQuery({
    queryKey: ["packages"],
    queryFn: fetchPackagesService,
  });

  const isInitialLoading = outfitsQuery.isPending || packagesQuery.isPending;
  const isFetching = outfitsQuery.isFetching || packagesQuery.isFetching;

  const activeFilterCount =
    Number(activeCategory !== "all") + Number(activeBranch !== "all") + Number(onlyAr);
  const hasActiveFilters =
    activeFilterCount > 0 ||
    searchQuery.trim() !== "" ||
    sortValue !== "newest";

  const discovery = useMemo(() => {
    const outfits = sortArrayByLatestDate(outfitsQuery.data ?? []);
    const categories = CATEGORIES.flatMap((category) => {
      const matching = outfits.filter((outfit) => matchesOutfitCategory(outfit, category));
      const featured = matching.find(
        (outfit) => outfit.category?.toLowerCase() === category.toLowerCase() &&
          typeof outfit.imageURL === "string" && outfit.imageURL,
      ) ?? matching.find((outfit) => typeof outfit.imageURL === "string" && outfit.imageURL);
      return matching.length ? [{
        category,
        image: typeof featured?.imageURL === "string" ? featured.imageURL : null,
      }] : [];
    });
    return {
      categories,
      arOutfits: outfits.filter((outfit) => getOutfitArFit(outfit).canTryInAR),
    };
  }, [outfitsQuery.data]);

  const focusCatalog = () => {
    requestAnimationFrame(() => catalogHeadingRef.current?.focus());
  };

  const visibleItems = useMemo(() => {
    const outfits = outfitsQuery.data ?? [];
    const packages = packagesQuery.data ?? [];
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const arOutfits = onlyAr ? new Set(discovery.arOutfits) : null;

    const filteredOutfits = outfits?.filter((outfit) => {
      const searchableText = [
        outfit.name,
        outfit.category,
        outfit.description,
        getOutfitBranchLabel(outfit.branch),
        ...(outfit.variants || []).flatMap((variant) => [
          variant.color,
          ...variant.sizes.map((size) => size.size),
        ]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesCategory = matchesOutfitCategory(outfit, activeCategory);
      const matchesBranch =
        activeBranch === "all" || outfit.branch === activeBranch;
      const matchesSearch =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesCategory && matchesBranch && matchesSearch &&
        (!arOutfits || arOutfits.has(outfit));
    });

    const filteredPackages = packages.filter((packageItem) => {
      const searchableText = [
        packageItem.name,
        "package",
        `${packageItem.items?.length ?? 0} outfits`,
      ]
        .join(" ")
        .toLowerCase();

      const matchesCategory =
        activeCategory === "all" || activeCategory.toLowerCase() === "packages";
      return (
        !onlyAr && matchesCategory &&
        (!normalizedQuery || searchableText.includes(normalizedQuery))
      );
    });

    const sortedOutfits = filteredOutfits.map((outfit) => ({
      kind: "outfit" as const,
      item: outfit,
      date: outfit.createdAt,
      createdAt: outfit.createdAt,
      price: Number(outfit.price || 0),
      name: outfit.name,
    }));
    const sortedPackages = filteredPackages.map((packageItem) => ({
      kind: "package" as const,
      item: packageItem,
      date: packageItem.createdAt,
      createdAt: packageItem.createdAt,
      price: Number(packageItem.purchaseTotal || 0),
      name: packageItem.name,
    }));
    const sortedItems = [...sortedOutfits, ...sortedPackages];

    if (sortValue === "price-asc") {
      return sortedItems.sort((a, b) => a.price - b.price);
    }

    if (sortValue === "price-desc") {
      return sortedItems.sort((a, b) => b.price - a.price);
    }

    if (sortValue === "name-asc") {
      return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sortArrayByLatestDate(sortedItems);
  }, [
    activeBranch,
    activeCategory,
    discovery.arOutfits,
    onlyAr,
    outfitsQuery.data,
    packagesQuery.data,
    searchQuery,
    sortValue,
  ]);

  return (
    <motion.div
      className="space-y-8 md:space-y-12"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <fieldset className="fixed right-[calc(1.5rem+env(safe-area-inset-right))] top-[calc(5.25rem+env(safe-area-inset-top))] sm:right-[calc(2rem+env(safe-area-inset-right))] z-40 grid grid-cols-2 rounded-lg border border-primary/25 bg-background p-1 text-primary">
        <legend className="sr-only">Browse prices</legend>
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-primary transition-transform duration-300 ease-out motion-reduce:transition-none ${
            priceMode === "purchase" ? "translate-x-full" : ""
          }`}
        />
        {(["rent", "purchase"] as const).map((mode) => (
          <label key={mode} className="relative cursor-pointer">
            <input
              type="radio"
              name="browse-price-mode"
              value={mode}
              checked={priceMode === mode}
              onChange={() => setPriceMode(mode)}
              className="peer sr-only"
            />
            <span className="block rounded-md px-3 py-2 text-center text-sm font-bold transition-colors duration-200 peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring motion-reduce:transition-none">
              {mode === "rent" ? "Rent" : "Purchase"}
            </span>
          </label>
        ))}
      </fieldset>

      {/* ── Page Header ── */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col gap-2 pt-17 pb-6 sm:flex-row sm:items-end sm:justify-between sm:pt-0 sm:pr-44"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Browse Collection
          </h1>
          <p className="mt-1.5 text-base text-muted-foreground leading-relaxed">
            Shop or rent gowns, barongs, and suits for every occasion.
          </p>
        </div>
      </motion.div>

      {/* ── Search + Sort + Filter row ── */}
      <motion.div variants={fadeInUp} className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="h-10 rounded-xl border-border/60 pl-9 pr-9 text-sm placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:ring-1"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-2 rounded-xl border-border/60 px-3.5 text-sm font-medium"
            >
              <ArrowUpDown className="size-3.5" />
              <span className="hidden sm:inline">Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Sort by
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={sortValue}
              onValueChange={setSortValue}
            >
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuRadioItem
                  key={opt.value}
                  value={opt.value}
                  className="text-sm"
                >
                  {opt.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filters dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-10 gap-2 rounded-xl border-border/60 px-3.5 text-sm font-medium ${
                activeFilterCount > 0
                  ? "border-primary text-primary"
                  : ""
              }`}
            >
              <SlidersHorizontal className="size-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Category
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={activeCategory}
              onValueChange={setActiveCategory}
            >
              <DropdownMenuRadioItem value="all" className="text-sm">
                All categories
              </DropdownMenuRadioItem>
              {CATEGORIES.map((cat) => (
                <DropdownMenuRadioItem
                  key={cat}
                  value={cat}
                  className="text-sm"
                >
                  {cat}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Branch
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={activeBranch}
              onValueChange={(value) => setActiveBranch(value as OutfitBranch | "all")}
            >
              <DropdownMenuRadioItem value="all" className="text-sm">
                All branches
              </DropdownMenuRadioItem>
              {OUTFIT_BRANCHES.map((branch) => (
                <DropdownMenuRadioItem
                  key={branch.value}
                  value={branch.value}
                  className="text-sm"
                >
                  {branch.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={onlyAr} onCheckedChange={setOnlyAr}>
              AR try-on available
            </DropdownMenuCheckboxItem>

            {activeFilterCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setActiveBranch("all");
                    setOnlyAr(false);
                  }}
                  className="w-full px-2 py-1.5 text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear filters
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {!hasActiveFilters && discovery.categories.length > 0 && (
        <section aria-labelledby="browse-categories" className="space-y-4">
          <h2 id="browse-categories" className="text-xl font-semibold text-primary md:text-2xl">
            Shop by category
          </h2>
          <ul className="flex snap-x gap-3 overflow-x-auto pb-2 sm:gap-4">
            {discovery.categories.map(({category, image}) => (
              <li key={category} className="w-32 shrink-0 snap-start sm:w-40">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    focusCatalog();
                  }}
                  className="group block w-full overflow-hidden rounded-lg border border-border/60 bg-background text-left hover:border-primary focus-visible:border-primary focus-visible:underline"
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    {image ? (
                      <Image
                        src={image}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 160px, 128px"
                        className="object-cover transition-transform group-hover:scale-105 motion-reduce:transition-none"
                      />
                    ) : (
                      <PackageSearch aria-hidden="true" className="absolute inset-0 m-auto size-7 text-muted-foreground" />
                    )}
                  </div>
                  <span className="flex min-h-12 items-center px-3 py-2 text-sm font-semibold text-primary">
                    {category}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasActiveFilters && discovery.arOutfits.length > 0 && (
        <section aria-labelledby="browse-ar" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="browse-ar" className="text-xl font-semibold text-primary md:text-2xl">
                Try on with AR
              </h2>
              <p className="mt-1 text-base text-secondary leading-relaxed">Preview a look with your camera before you rent or buy.</p>
            </div>
            <Button variant="outline" onClick={() => {
              setOnlyAr(true);
              focusCatalog();
            }}>
              View all AR outfits <ArrowRight aria-hidden="true" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {discovery.arOutfits.slice(0, 4).map((outfit) => (
              <OutfitCard priceMode={priceMode} key={outfit._id ?? outfit.referenceID ?? outfit.name} outfit={outfit} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="browse-catalog" className="space-y-4">
        <h2
          id="browse-catalog"
          ref={catalogHeadingRef}
          tabIndex={-1}
          className="scroll-mt-24 text-xl font-semibold text-primary outline-none md:text-2xl"
        >
          {onlyAr ? "Outfits with AR try-on" : activeCategory === "all" ? "Full collection" : activeCategory}
        </h2>
        {/* ── Outfit grid, skeleton, or empty state ── */}
        {isInitialLoading || (isFetching && visibleItems.length === 0) ? (
          <BrowseGridSkeleton />
        ) : visibleItems.length === 0 ? (
          <motion.div variants={scaleIn}>
            <EmptyState icon={PackageSearch} title={hasActiveFilters ? "No items match your search" : "No items available"} />
          </motion.div>
        ) : (
          <div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            <AnimatePresence mode="popLayout">
              {visibleItems.map((entry) => (
                <motion.div
                  layout
                  key={
                    entry.kind === "outfit"
                      ? `outfit-${entry.item._id}`
                      : `package-${entry.item._id}`
                  }
                  variants={staggerItem}
                  exit="exit"
                  whileHover={{y: -6}}
                  whileTap={{scale: 0.98}}
                >
                  {entry.kind === "outfit" ? (
                    <OutfitCard priceMode={priceMode} outfit={entry.item} />
                  ) : (
                    <PackageCard priceMode={priceMode} packageItem={entry.item} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </motion.div>
  );
}
