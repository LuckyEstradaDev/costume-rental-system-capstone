import {useId, type ReactNode} from "react";

export function CheckoutSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="min-w-0 space-y-5 rounded-lg border border-border/50 bg-background p-5 md:p-6"
    >
      <h2 id={headingId} className="text-xl font-semibold text-primary md:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
