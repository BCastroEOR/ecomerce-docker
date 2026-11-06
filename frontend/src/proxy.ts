import { NextResponse, type NextRequest } from "next/server";

const TOKEN_COOKIE = "auth_token";
const GUEST_ONLY = ["/login", "/register"];

/**
 * Protege las rutas privadas antes de renderizar. Es una verificación
 * optimista (solo revisa la cookie httpOnly); la API valida el JWT en cada llamada.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAuthenticated = request.cookies.has(TOKEN_COOKIE);

  if (GUEST_ONLY.includes(pathname)) {
    return isAuthenticated ? NextResponse.redirect(new URL("/products", request.url)) : NextResponse.next();
  }

  if (!isAuthenticated) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/orders/:path*", "/login", "/register"],
};
