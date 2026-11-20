"use client";

import {OutfitCard} from "@/features/user-dashboard/browse-tab/components/OutfitCard";
import {PackageCard} from "@/features/user-dashboard/browse-tab/components/PackageCard";
import {BrowseGridSkeleton} from "@/features/user-dashboard/browse-tab/components/Skeleton";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {
  IOutfit,
  type OutfitBranch,
} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {fetchPackagesService} from "@/features/admin-dashboard/packages/services/PackageService";
import {useState, useEffect, useMemo} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {sortArrayByLatestDate} from "@/lib/helper";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  PackageSearch,
} from "lucide-react";
import {
  DropdownMenu,
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

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
        <PackageSearch className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {hasFilters ? "No items match your search" : "No items available"}
        </p>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          {hasFilters
            ? "Try adjusting your filters, sort, or search term to find what you're looking for."
            : "Check back later. New pieces are added regularly."}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeBranch, setActiveBranch] = useState<OutfitBranch | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState("newest");

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
    (activeCategory !== "all" ? 1 : 0) + (activeBranch !== "all" ? 1 : 0);
  const hasActiveFilters =
    activeFilterCount > 0 ||
    searchQuery.trim() !== "" ||
    sortValue !== "newest";

  const handleClearAll = () => {
    setActiveCategory("all");
    setActiveBranch("all");
    setSearchQuery("");
    setSortValue("newest");
  };

  const visibleItems = useMemo(() => {
    const outfits = outfitsQuery.data ?? [];
    const packages = packagesQuery.data ?? [];
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const normalizedCategory = activeCategory.replace(/s$/, "").toLowerCase();

    const filteredOutfits = outfits?.filter((outfit) => {
      const category = outfit.category?.toLowerCase() || "";
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

      const matchesCategory =
        activeCategory === "all" || category.includes(normalizedCategory);
      const matchesBranch =
        activeBranch === "all" || outfit.branch === activeBranch;
      const matchesSearch =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesCategory && matchesBranch && matchesSearch;
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
        matchesCategory &&
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
    outfitsQuery.data,
    packagesQuery.data,
    searchQuery,
    sortValue,
  ]);

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* ── Page Header ── */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col gap-2 pb-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Browse Collection
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
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

            {activeFilterCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setActiveBranch("all");
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

      {/* ── Outfit grid, skeleton, or empty state ── */}
      {isInitialLoading || (isFetching && visibleItems.length === 0) ? (
        <BrowseGridSkeleton />
      ) : visibleItems.length === 0 ? (
        <motion.div variants={scaleIn}>
          <EmptyState hasFilters={hasActiveFilters} onClear={handleClearAll} />
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
                  <OutfitCard outfit={entry.item} />
                ) : (
                  <PackageCard packageItem={entry.item} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
