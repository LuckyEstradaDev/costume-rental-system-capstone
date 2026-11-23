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
      className="min-w-0 space-y-4"
    >
      <h2 id={headingId} className="text-xl font-semibold text-primary md:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
