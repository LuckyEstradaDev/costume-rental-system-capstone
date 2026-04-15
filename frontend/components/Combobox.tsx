import React from "react";

interface ComboboxProps {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
  emptyText?: string;
}

export default function ComboboxComponent({
  items,
  value,
  onChange,
  onClose,
  emptyText = "No items found.",
}: ComboboxProps) {
  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(value.toLowerCase()),
  );

  return (
    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-md">
      {filteredItems.length > 0 ? (
        filteredItems.map((item) => (
          <div
            key={item}
            className="cursor-pointer px-3 py-2 hover:bg-gray-100"
            onMouseDown={(e) => {
              e.preventDefault(); // prevent input blur
              onChange(item);
              onClose?.();
            }}
          >
            {item}
          </div>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-gray-500">{emptyText}</div>
      )}
    </div>
  );
}
