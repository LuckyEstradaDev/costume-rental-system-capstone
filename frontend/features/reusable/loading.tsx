interface FullScreenLoaderProps {
  label?: string;
}

export default function Loading({label = "Loading"}: FullScreenLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white"
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#6d3c8e]/20 motion-reduce:animate-none" />
        <span className="absolute inset-2 animate-pulse rounded-full bg-[#6d3c8e]/30 motion-reduce:animate-none" />
        <span className="relative h-4 w-4 rounded-full bg-[#6d3c8e]" />
      </div>

      <p className="text-sm font-medium tracking-wide text-[#8d8d8d]">
        {label}
      </p>

      <span className="sr-only">Content is loading, please wait.</span>
    </div>
  );
}
