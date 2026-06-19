import { cookies, headers } from "next/headers";
import { TOKEN_COOKIE } from "@/lib/auth";

export const API_URL = process.env.API_URL ?? "http://localhost:3333";

// URL pública do próprio frontend — usada em links que saem do sistema
// (ex.: o QR Code do certificado, escaneado por instituições externas).
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Resolve a URL pública real do frontend para links que saem do sistema.
// Prioridade: NEXT_PUBLIC_APP_URL (domínio canônico) > host da própria
// requisição (proxy da Vercel) > localhost. Sem isso o QR do certificado
// apontava para http://localhost:3000, inacessível ao ser escaneado no celular.
export async function getAppUrl(): Promise<string> {
  const explicito = process.env.NEXT_PUBLIC_APP_URL;
  if (explicito) return explicito.replace(/\/+$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const proto =
      h.get("x-forwarded-proto") ??
      (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}

export type ApiError = {
  status: number;
  detail: string;
};

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;

  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {}
    const err: ApiError = { status: res.status, detail };
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
