"use client";

import {OutfitCard} from "@/features/user-dashboard/browse-tab/components/OutfitCard";
import {PackageCard} from "@/features/user-dashboard/browse-tab/components/PackageCard";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
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
  Sparkles,
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
import {CATEGORIES} from "@/features/admin-dashboard/inventory-tab/constants/constants";
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
            : "Check back later — new pieces are added regularly."}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState("newest");

  const {data} = useQuery({
    queryKey: ["outfits"],
    queryFn: fetchOutfitsService,
  });
  const outfits = data || [];
  const {data: packages = []} = useQuery({
    queryKey: ["packages"],
    queryFn: fetchPackagesService,
  });

  const hasActiveFilters =
    activeCategory !== "all" ||
    searchQuery.trim() !== "" ||
    sortValue !== "newest";

  const handleClearAll = () => {
    setActiveCategory("all");
    setSearchQuery("");
    setSortValue("newest");
  };

  const visibleItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const normalizedCategory = activeCategory.replace(/s$/, "").toLowerCase();

    const filteredOutfits = outfits?.filter((outfit) => {
      const category = outfit.category?.toLowerCase() || "";
      const searchableText = [
        outfit.name,
        outfit.category,
        outfit.description,
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
      const matchesSearch =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });

    const filteredPackages = packages.filter((packageItem) => {
      const searchableText = [
        packageItem.name,
        "package",
        ...(packageItem.items || []).map(
          (item) => `${item.name} ${item.category}`,
        ),
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
  }, [activeCategory, packages, data, outfits, searchQuery, sortValue]);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="size-4.5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Browse Collection
            </h1>
            <p className="text-sm text-muted-foreground">
              Shop or rent gowns, barongs, and suits for every occasion.
            </p>
          </div>
        </div>
      </div>

      {/* ── Search + Sort + Filter row ── */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, color, size…"
            className="h-10 rounded-xl border-border/60 bg-muted/40 pl-9 pr-9 text-sm placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:ring-1"
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
                activeCategory !== "all"
                  ? "border-primary/50 bg-primary/5 text-primary"
                  : ""
              }`}
            >
              <SlidersHorizontal className="size-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {activeCategory !== "all" && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  1
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

            {activeCategory !== "all" && (
              <>
                <DropdownMenuSeparator />
                <button
                  onClick={() => setActiveCategory("all")}
                  className="w-full px-2 py-1.5 text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear filters
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Outfit grid or empty state ── */}
      {visibleItems.length === 0 ? (
        <EmptyState hasFilters={hasActiveFilters} onClear={handleClearAll} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visibleItems.map((entry) =>
            entry.kind === "outfit" ? (
              <OutfitCard
                outfit={entry.item}
                key={`outfit-${entry.item._id}`}
              />
            ) : (
              <PackageCard
                packageItem={entry.item}
                key={`package-${entry.item._id}`}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}
