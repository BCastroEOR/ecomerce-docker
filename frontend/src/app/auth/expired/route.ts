import { NextResponse, type NextRequest } from "next/server";
import { deleteSession } from "@/lib/session";

/**
 * Route Handler al que se redirige cuando la API responde 401: elimina las
 * cookies de sesión (los Server Components no pueden modificarlas) y envía al login.
 */
export async function GET(request: NextRequest) {
  await deleteSession();
  return NextResponse.redirect(new URL("/login?expired=1", request.url));
}
