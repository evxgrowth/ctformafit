// Assinatura da sessão do admin. Usado no middleware (edge) e no servidor.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ff_admin";
export const SESSION_DAYS = 7;

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) throw new Error("AUTH_SECRET ausente ou curto demais.");
  return new TextEncoder().encode(secret);
}

export type SessionPayload = { sub: string; email: string; name: string };

export async function signSession(p: SessionPayload) {
  return new SignJWT({ email: p.email, name: p.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return { sub: String(payload.sub), email: String(payload.email), name: String(payload.name) };
  } catch {
    return null;
  }
}
