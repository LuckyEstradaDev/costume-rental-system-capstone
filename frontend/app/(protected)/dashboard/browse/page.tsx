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
import {Badge} from "@/components/ui/badge";

// ─── Static UI data ──────────────────────────────────────────────────────────

const CATEGORIES = [
  {label: "All", value: "all"},
  {label: "Gowns", value: "gowns"},
  {label: "Barongs", value: "barongs"},
  {label: "Suits", value: "suits"},
];

const OCCASION_TAGS = [
  "Wedding",
  "Debut",
  "Prom",
  "Formal",
  "Semi-Formal",
  "Cocktail",
  "Ball",
  "Graduation",
];

const SORT_OPTIONS = [
  {label: "Newest First", value: "newest"},
  {label: "Price: Low to High", value: "price-asc"},
  {label: "Price: High to Low", value: "price-desc"},
  {label: "Name: A to Z", value: "name-asc"},
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [outfits, setOutfits] = useState<IOutfit[]>([]);

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState("newest");

  const hasActiveFilters = activeCategory !== "all" || activeTag !== null;

  const visibleOutfits = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const normalizedCategory = activeCategory.replace(/s$/, "").toLowerCase();
    const normalizedOccasion = activeTag?.toLowerCase() || "";

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
      const matchesOccasion =
        !normalizedOccasion || searchableText.includes(normalizedOccasion);

      return matchesCategory && matchesSearch && matchesOccasion;
    });

    return [...filteredOutfits].sort((a, b) => {
      if (sortValue === "price-asc") {
        return Number(a.price || 0) - Number(b.price || 0);
      }
      if (sortValue === "price-desc") {
        return Number(b.price || 0) - Number(a.price || 0);
      }
      if (sortValue === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });
  }, [activeCategory, activeTag, outfits, searchQuery, sortValue]);

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
                hasActiveFilters
                  ? "border-primary/50 bg-primary/5 text-primary"
                  : ""
              }`}
            >
              <SlidersHorizontal className="size-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {(activeCategory !== "all" ? 1 : 0) + (activeTag ? 1 : 0)}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Category section */}
            <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Category
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={activeCategory}
              onValueChange={setActiveCategory}
            >
              {CATEGORIES.map(({label, value}) => (
                <DropdownMenuRadioItem
                  key={value}
                  value={value}
                  className="text-sm"
                >
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />

            {/* Occasion section */}
            <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Occasion
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex flex-wrap gap-1.5 px-2 py-1.5">
              {OCCASION_TAGS.map((tag) => {
                const isActive = activeTag === tag;
                return (
                  <Badge
                    key={tag}
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setActiveTag(isActive ? null : tag)}
                    className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {tag}
                  </Badge>
                );
              })}
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <>
                <DropdownMenuSeparator />
                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setActiveTag(null);
                  }}
                  className="w-full px-2 py-1.5 text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear filters
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator className="opacity-50" />

      {/* ── Results count ── */}
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {visibleOutfits.length}
        </span>{" "}
        {visibleOutfits.length === outfits.length
          ? "items found"
          : `of ${outfits.length} items`}
      </p>

      {/* ── Outfit grid ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {visibleOutfits.map((item, index) => (
          <OutfitCard outfit={item} key={index} />
        ))}
      </div>
    </div>
  );
}
