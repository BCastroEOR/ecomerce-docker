import "server-only";
import { cookies } from "next/headers";
import type { AuthData, User } from "./types";

export const TOKEN_COOKIE = "auth_token";
const USER_COOKIE = "auth_user";

export type SessionUser = Pick<User, "id" | "name" | "email">;

/**
 * Guarda el JWT en una cookie httpOnly: el JavaScript del navegador no puede
 * leerla, lo que la protege frente a XSS. La cookie expira junto con el token.
 */
export async function createSession({ token, expires_in, user }: AuthData) {
  const store = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: expires_in,
  };

  store.set(TOKEN_COOKIE, token, options);
  store.set(USER_COOKIE, JSON.stringify({ id: user.id, name: user.name, email: user.email }), options);
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
  store.delete(USER_COOKIE);
}

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(TOKEN_COOKIE)?.value;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const raw = (await cookies()).get(USER_COOKIE)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}
