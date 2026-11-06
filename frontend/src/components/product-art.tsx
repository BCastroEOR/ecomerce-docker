const PALETTES = [
  "from-indigo-500 to-sky-400",
  "from-rose-500 to-orange-400",
  "from-emerald-500 to-teal-400",
  "from-violet-500 to-fuchsia-400",
  "from-amber-500 to-yellow-300",
  "from-slate-700 to-slate-500",
];

/** La API no expone imágenes: se genera una ilustración liviana (sin peticiones extra). */
export function ProductArt({ id, name, className = "" }: { id: number; name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <div
      aria-hidden
      className={`flex items-center justify-center bg-gradient-to-br ${PALETTES[id % PALETTES.length]} ${className}`}
    >
      <span className="text-4xl font-semibold tracking-tight text-white/90 drop-shadow-sm">{initials}</span>
    </div>
  );
}
