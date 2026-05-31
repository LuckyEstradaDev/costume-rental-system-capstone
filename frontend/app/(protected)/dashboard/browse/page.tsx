"use client";

import {useRouter} from "next/navigation";
import {UserSidebar} from "@/features/user-dashboard/sidebar/UserSidebar";
import {OutfitCard} from "@/features/user-dashboard/browse-tab/components/OutfitCard";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {useState, useEffect} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Search, SlidersHorizontal, ArrowUpDown, Sparkles} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  {label: "Most Popular", value: "popular"},
  {label: "Best Rated", value: "rated"},
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();
  const [outfits, setOutfits] = useState<IOutfit[]>([]);

  // Static UI state (visual only — no filtering logic changed)
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortValue, setSortValue] = useState("newest");

  useEffect(() => {
    const fetchOufits = async () => {
      const {data} = await fetchOutfitsService();
      setOutfits(data);
    };

    fetchOufits();
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
            placeholder="Search by name, color, size…"
            className="h-10 rounded-xl border-border/60 bg-muted/40 pl-9 pr-4 text-sm placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:ring-1"
          />
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

        {/* Filters */}
        <Button
          variant="outline"
          size="sm"
          className="h-10 gap-2 rounded-xl border-border/60 px-3.5 text-sm font-medium"
        >
          <SlidersHorizontal className="size-3.5" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </div>

      {/* ── Category links ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        {CATEGORIES.map(({label, value}) => {
          const isActive = activeCategory === value;
          return (
            <button
              key={value}
              onClick={() => setActiveCategory(value)}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Occasion tag pills ── */}
      <div className="flex flex-wrap gap-2">
        <span className="self-center text-xs font-medium text-muted-foreground/70">
          Occasion:
        </span>
        {OCCASION_TAGS.map((tag) => {
          const isActive = activeTag === tag;
          return (
            <Badge
              key={tag}
              variant={isActive ? "default" : "outline"}
              onClick={() => setActiveTag(isActive ? null : tag)}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 ${
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

      <Separator className="opacity-50" />

      {/* ── Results count ── */}
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{outfits.length}</span>{" "}
        items found
      </p>

      {/* ── Outfit grid ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {outfits.map((item, index) => (
          <OutfitCard outfit={item} key={index} />
        ))}
      </div>
    </div>
  );
}
