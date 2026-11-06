export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 mb-6 text-sm text-zinc-600">{subtitle}</p>
      {children}
    </div>
  );
}

export function FormSkeleton({ fields }: { fields: number }) {
  return (
    <div className="space-y-4" aria-busy="true">
      {Array.from({ length: fields + 1 }, (_, index) => (
        <div key={index} className="h-10 animate-pulse rounded-lg bg-zinc-100" />
      ))}
    </div>
  );
}

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
