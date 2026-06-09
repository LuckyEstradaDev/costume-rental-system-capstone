import {Input} from "@/components/ui/input";

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ColorPickerComponent({value, onChange}: ComboboxProps) {
  return (
    <div className="relative">
      <Input
        type="color"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        autoComplete="off"
      />
    </div>
  );
}
