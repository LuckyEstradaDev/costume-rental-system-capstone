import React, {useState} from "react";
import {Input} from "@/components/ui/input";

interface ComboboxProps {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  emptyText?: string;
  placeholder?: string;
}

export default function ComboboxComponent({
  items,
  value,
  onChange,
  emptyText = "No items found.",
  placeholder,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(value.toLowerCase()),
  );

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
      />

      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-md">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item}
                className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(item);
                  setOpen(false);
                }}
              >
                {item}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">{emptyText}</div>
          )}
        </div>
      )}
    </div>
  );
}
