import React from "react";

type SectionHeaderProps = {
  title: string;
  description: string;
  className?: string;
};

export default function SectionHeader({
  title,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <header className={`mx-auto max-w-3xl text-center ${className}`}>
      <h2 className="text-5xl font-semibold text-[#7d3e98]">{title}</h2>
      <p className="mt-5 text-xl leading-relaxed text-[#5e5e5e]">{description}</p>
    </header>
  );
}
