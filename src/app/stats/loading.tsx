export default function StatsLoading() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading stats">
      <div className="h-12 max-w-xs bg-ink-soft" />
      <div className="h-9 max-w-lg bg-surface-muted" />
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-16 bg-ink-soft sm:h-20" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="h-72 bg-surface-muted" />
        <div className="h-72 bg-surface-muted" />
      </div>
      <div className="h-48 bg-surface-muted" />
    </div>
  );
}
