"use client";

import {OutfitCard} from "@/features/user-dashboard/browse-tab/components/OutfitCard";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {useState, useEffect, useMemo} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
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
          {hasFilters ? "No outfits match your search" : "No outfits available"}
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
  const [outfits, setOutfits] = useState<IOutfit[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState("newest");

  const hasActiveFilters =
    activeCategory !== "all" ||
    searchQuery.trim() !== "" ||
    sortValue !== "newest";

  const handleClearAll = () => {
    setActiveCategory("all");
    setSearchQuery("");
    setSortValue("newest");
  };

  const visibleOutfits = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const normalizedCategory = activeCategory.replace(/s$/, "").toLowerCase();

    const filteredOutfits = outfits.filter((outfit) => {
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

    return [...filteredOutfits].sort((a, b) => {
      if (sortValue === "price-asc")
        return Number(a.price || 0) - Number(b.price || 0);
      if (sortValue === "price-desc")
        return Number(b.price || 0) - Number(a.price || 0);
      if (sortValue === "name-asc") return a.name.localeCompare(b.name);
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });
  }, [activeCategory, outfits, searchQuery, sortValue]);

  useEffect(() => {
    const fetchOutfits = async () => {
      const {data} = await fetchOutfitsService();
      setOutfits(data);
    };
    fetchOutfits();
  }, []);

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
      {visibleOutfits.length === 0 ? (
        <EmptyState hasFilters={hasActiveFilters} onClear={handleClearAll} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visibleOutfits.map((item, index) => (
            <OutfitCard outfit={item} key={index} />
          ))}
        </div>
      )}
    </div>
  );
}
