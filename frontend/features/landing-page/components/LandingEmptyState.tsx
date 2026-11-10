import type {LucideIcon} from "lucide-react";

type LandingEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
};

export default function LandingEmptyState({
  icon: Icon,
  title,
  description,
  className = "",
}: LandingEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-[#d8c8e4] bg-white px-6 py-16 text-center ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4edf8] text-[#6d3c8e]">
        <Icon size={26} strokeWidth={2} />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-[#2b2b2b]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#6b6b6b]">
        {description}
      </p>
    </div>
  );
}
