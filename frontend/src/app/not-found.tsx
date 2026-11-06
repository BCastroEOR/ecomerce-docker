import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-10 text-center">
      <h1 className="text-xl font-semibold">Página no encontrada</h1>
      <p className="mt-2 text-sm text-zinc-600">La ruta que intentas abrir no existe.</p>
      <Link href="/products" className="mt-6 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
        Ir al catálogo
      </Link>
    </div>
  );
}
