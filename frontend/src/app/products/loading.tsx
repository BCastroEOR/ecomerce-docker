import { ProductGridSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="h-9 w-48 animate-pulse rounded bg-zinc-200" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded bg-zinc-100" />
      </div>
      <ProductGridSkeleton />
    </div>
  );
}
