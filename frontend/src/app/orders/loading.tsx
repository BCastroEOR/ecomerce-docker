import { ListSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="h-9 w-72 animate-pulse rounded bg-zinc-200" />
        <div className="h-5 w-80 max-w-full animate-pulse rounded bg-zinc-100" />
      </div>
      <ListSkeleton />
    </div>
  );
}
