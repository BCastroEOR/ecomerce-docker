import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/app/actions/auth";
import { getSessionUser } from "@/lib/session";
import { CartLink } from "./cart-link";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/products" className="text-lg font-semibold tracking-tight">
          Kodigo<span className="text-indigo-600">Store</span>
        </Link>
        <nav className="flex flex-1 items-center gap-4 text-sm text-zinc-600">
          <Link href="/products" className="hover:text-zinc-900">
            Catálogo
          </Link>
          <Link href="/orders" className="hover:text-zinc-900">
            Mis compras
          </Link>
        </nav>
        <CartLink />
        {/* La sesión vive en cookies (dato de la petición), por eso se transmite tras un Suspense. */}
        <Suspense fallback={<div className="h-8 w-28 animate-pulse rounded-lg bg-zinc-100" />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}

async function UserMenu() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Link href="/login" className="rounded-lg px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-100">
          Ingresar
        </Link>
        <Link href="/register" className="hidden rounded-lg bg-zinc-900 px-3 py-1.5 font-medium text-white hover:bg-zinc-700 sm:block">
          Crear cuenta
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="hidden text-zinc-600 sm:inline" title={user.email}>
        Hola, <strong className="font-medium text-zinc-900">{user.name.split(" ")[0]}</strong>
      </span>
      <form action={logout}>
        <button type="submit" className="rounded-lg px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-100">
          Salir
        </button>
      </form>
    </div>
  );
}
