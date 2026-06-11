"use client";

import {useState, type FormEvent} from "react";
import {Layers, Plus, Settings2, Tag} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";

const initialCategories = [
  "Wedding Gown",
  "Barong Tagalog",
  "Formal Wear",
  "Costume",
  "Kids Collection",
];

export default function SettingsPage() {
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [categoryName, setCategoryName] = useState("");

  const handleAddCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = categoryName.trim();
    if (!trimmed) return;

    setCategories((current) =>
      current.includes(trimmed) ? current : [...current, trimmed],
    );
    setCategoryName("");
  };

  const handleRemoveCategory = (category: string) => {
    setCategories((current) => current.filter((item) => item !== category));
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Settings2 className="size-4.5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure dropdown categories that staff use when creating or
              updating outfits and rentals.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Category dropdown settings</CardTitle>
            <CardDescription>
              Update the categories shown in the admin inventory and rental
              workflows.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form
              onSubmit={handleAddCategory}
              className="grid gap-3 sm:grid-cols-[1fr_auto]"
            >
              <div>
                <Label htmlFor="category-name">New category</Label>
                <Input
                  id="category-name"
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  placeholder="Enter category name"
                />
              </div>
              <Button type="submit" disabled={!categoryName.trim()}>
                <Plus className="size-4" />
                Add category
              </Button>
            </form>

            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Active categories</p>
                  <p className="text-sm text-muted-foreground">
                    Categories are shown on admin dropdown menus.
                  </p>
                </div>
                <Badge variant="secondary">{categories.length} items</Badge>
              </div>

              <Separator className="my-4" />

              <div className="grid gap-3">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="size-4 text-primary" />
                      <span className="font-medium">{category}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCategory(category)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Dropdown preview</CardTitle>
            <CardDescription>
              View how categories will appear to admins when selecting options.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-border bg-background p-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge key={category} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Layers className="size-4" />
                <span>New categories appear instantly in the preview.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
