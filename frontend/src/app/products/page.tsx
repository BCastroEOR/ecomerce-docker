import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AddToCart } from "@/components/add-to-cart";
import { Pagination, parsePage } from "@/components/pagination";
import { ProductArt } from "@/components/product-art";
import { ProductGridSkeleton } from "@/components/skeletons";
import { getProducts } from "@/lib/data";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = {
  title: "Catálogo",
};

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Catálogo</h1>
        <p className="mt-2 text-zinc-600">Explora los productos disponibles. No necesitas una cuenta para ver el catálogo.</p>
      </section>

      {/* La lista depende de ?page y de la API: se transmite en streaming mientras el encabezado ya es visible. */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ProductList({ searchParams }: Pick<PageProps<"/products">, "searchParams">) {
  const page = parsePage((await searchParams).page);
  const { data: products, meta } = await getProducts(page);

  if (products.length === 0) {
    return <p className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500">No hay productos disponibles.</p>;
  }

  return (
    <>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <li key={product.id} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:shadow-md">
            <Link href={`/products/${product.id}`} className="block" aria-label={`Ver ${product.name}`}>
              <ProductArt id={product.id} name={product.name} className="aspect-[4/3]" />
            </Link>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex-1">
                <h2 className="font-semibold">
                  <Link href={`/products/${product.id}`} className="hover:text-indigo-600">
                    {product.name}
                  </Link>
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{product.description}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{formatMoney(product.price)}</p>
                  <p className="text-xs text-zinc-500">{product.stock > 0 ? `${product.stock} en stock` : "Agotado"}</p>
                </div>
                <AddToCart product={product} compact />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Pagination meta={meta} basePath="/products" />
    </>
  );
}
