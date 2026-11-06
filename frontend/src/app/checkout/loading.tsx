import { PanelSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="h-9 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="h-7 w-96 max-w-full animate-pulse rounded-full bg-zinc-100" />
      </div>
      <PanelSkeleton />
    </div>
  );
}
