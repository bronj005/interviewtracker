export default function Loading() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
      <div className="mx-auto h-10 max-w-xs bg-ink-soft" />
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-16 bg-ink-soft sm:h-20" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: 35 }, (_, i) => (
          <div key={i} className="h-[68px] bg-surface-muted sm:h-[118px]" />
        ))}
      </div>
    </div>
  );
}
