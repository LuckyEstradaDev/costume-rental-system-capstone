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
      className="min-w-0 space-y-[calc(var(--spacing)*6+2px)] md:space-y-[calc(var(--spacing)*8+2px)]"
    >
      <h2 id={headingId} className="text-xl font-semibold text-primary md:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
