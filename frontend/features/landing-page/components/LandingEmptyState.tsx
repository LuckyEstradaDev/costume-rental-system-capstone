import type {LucideIcon} from "lucide-react";

type LandingEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  tone?: "default" | "gray";
};

export default function LandingEmptyState({
  icon: Icon,
  title,
  description,
  className = "",
  tone = "default",
}: LandingEmptyStateProps) {
  const isGray = tone === "gray";

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl px-6 py-16 text-center ${className}`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full ${
          isGray
            ? "bg-muted text-muted-foreground"
            : "bg-primary/10 text-secondary/40"
        }`}
      >
        <Icon size={26} strokeWidth={2} />
      </div>
      <h3
        className={`mt-5 text-xl font-semibold ${
          isGray ? "text-muted-foreground" : "text-secondary/40"
        }`}
      >
        {title}
      </h3>
      <p
        className={`mt-2 max-w-md text-sm leading-relaxed ${
          isGray ? "text-muted-foreground" : "text-secondary/40"
        }`}
      >
        {description}
      </p>
    </div>
  );
}
