export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando productos">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="aspect-[4/3] animate-pulse bg-zinc-100" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
            <div className="h-9 w-1/3 animate-pulse rounded bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-2xl border border-zinc-200 bg-white" />
      ))}
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2" aria-busy="true" aria-label="Cargando">
      <div className="aspect-square animate-pulse rounded-2xl bg-zinc-100" />
      <div className="space-y-4">
        <div className="h-8 w-2/3 animate-pulse rounded bg-zinc-100" />
        <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-100" />
        <div className="h-10 w-1/2 animate-pulse rounded bg-zinc-100" />
      </div>
    </div>
  );
}
