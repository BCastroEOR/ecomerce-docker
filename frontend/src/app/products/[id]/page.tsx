import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCart } from "@/components/add-to-cart";
import { ProductArt } from "@/components/product-art";
import { PanelSkeleton } from "@/components/skeletons";
import { getProduct } from "@/lib/data";
import { formatMoney } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/products/[id]">) {
  const product = await getProduct((await params).id);
  return {
    title: product?.name ?? "Producto no encontrado",
    description: product?.description ?? "Detalle de producto en Kodigo Store.",
  };
}

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <div className="space-y-6">
      <Link href="/products" className="text-sm text-zinc-600 hover:text-zinc-900">
        ← Volver al catálogo
      </Link>
      <Suspense fallback={<PanelSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ProductDetail({ params }: Pick<PageProps<"/products/[id]">, "params">) {
  const product = await getProduct((await params).id);
  if (!product) notFound();

  return (
    <article className="grid gap-8 md:grid-cols-2">
      <ProductArt id={product.id} name={product.name} className="aspect-square rounded-2xl" />
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-3 text-2xl font-semibold text-indigo-600">{formatMoney(product.price)}</p>
        </div>
        <p className="leading-relaxed text-zinc-700">{product.description}</p>
        <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-zinc-200 bg-white p-4 text-sm">
          <div>
            <dt className="text-zinc-500">Disponibilidad</dt>
            <dd className="font-medium">{product.stock > 0 ? `${product.stock} unidades` : "Agotado"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Código</dt>
            <dd className="font-mono font-medium">SKU-{String(product.id).padStart(4, "0")}</dd>
          </div>
        </dl>
        <AddToCart product={product} />
      </div>
    </article>
  );
}
