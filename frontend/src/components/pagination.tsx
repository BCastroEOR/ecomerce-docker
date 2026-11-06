import Link from "next/link";
import type { PaginationMeta } from "@/lib/types";

export function Pagination({ meta, basePath }: { meta: PaginationMeta; basePath: string }) {
  if (meta.last_page <= 1) return null;

  const page = meta.current_page;
  const link = "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-white";

  return (
    <nav aria-label="Paginación" className="mt-8 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link href={`${basePath}?page=${page - 1}`} className={link}>
          ← Anterior
        </Link>
      ) : (
        <span className={`${link} pointer-events-none opacity-40`}>← Anterior</span>
      )}
      <span className="text-sm text-zinc-600">
        Página {page} de {meta.last_page}
      </span>
      {page < meta.last_page ? (
        <Link href={`${basePath}?page=${page + 1}`} className={link}>
          Siguiente →
        </Link>
      ) : (
        <span className={`${link} pointer-events-none opacity-40`}>Siguiente →</span>
      )}
    </nav>
  );
}

export function parsePage(value: string | string[] | undefined) {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
