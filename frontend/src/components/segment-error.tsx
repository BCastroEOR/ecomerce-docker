"use client";

import { useEffect } from "react";

/** UI compartida por los error.tsx de cada segmento. */
export function SegmentError({ error, retry, title }: { error: unknown; retry: () => void; title: string }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <div role="alert" className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <h2 className="text-lg font-semibold text-red-800">{title}</h2>
      <p className="mt-2 text-sm text-red-700">
        Algo salió mal al cargar esta sección. Revisa tu conexión e inténtalo de nuevo en unos momentos.
      </p>
      {digest && (
        <p className="mt-2 text-xs text-red-500">
          Si el problema continúa, comparte este código con soporte: <span className="font-mono">{digest}</span>
        </p>
      )}
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
      >
        Reintentar
      </button>
    </div>
  );
}
