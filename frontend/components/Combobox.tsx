import React, {useState} from "react";

interface ComboboxProps {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  emptyText?: string;
  placeholder?: string;
  filter?: string[];
}

export default function ComboboxComponent({
  items,
  value,
  onChange,
  emptyText = "No items found.",
  placeholder,
  filter,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const filteredItems = filter?.length
    ? items.filter((item) => !filter.includes(item))
    : items;

  return (
    <div className="relative">
      <button
        type="button"
        className="flex w-full min-w-18 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-900 shadow-sm transition hover:border-gray-400"
        onClick={() => setOpen((prev) => !prev)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder || "Select an option"}
        </span>
        <span className="text-gray-500">▾</span>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-md"
          role="listbox"
        >
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
