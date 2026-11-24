"use client";

import {SearchX as EmptyIcon} from "lucide-react";
import {EmptyState} from "@/components/ui/empty-state";
import {useState} from "react";
import {Check, ChevronDown} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";

interface ComboboxProps {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  emptyText?: string;
  placeholder?: string;
  filter?: string[];
  id?: string;
}

export default function ComboboxComponent({
  items,
  value,
  onChange,
  emptyText = "No items found.",
  placeholder = "Select an option",
  filter,
  id,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const options = items.filter(
    (item) => !filter?.includes(item) && item.toLowerCase().includes(query),
  );

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className="w-full min-w-0 justify-between border-border bg-background px-3 text-left font-normal text-foreground"
        >
          <span className="min-w-0 truncate">{value || placeholder}</span>
          <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-40 max-w-[var(--radix-popover-content-available-width)] space-y-2 p-2">
        <Input
          type="search"
          aria-label="Search options"
          placeholder="Search options"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <EmptyState icon={EmptyIcon} title={emptyText} className="min-h-0 py-5" />
          ) : (
            options.map((item) => (
              <Button
                key={item}
                type="button"
                variant="ghost"
                aria-pressed={item === value}
                className="h-auto w-full justify-between whitespace-normal px-2 py-2 text-left font-normal text-foreground"
                onClick={() => {
                  onChange(item);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {item}
                {item === value && <Check aria-hidden="true" className="size-4 shrink-0" />}
              </Button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
