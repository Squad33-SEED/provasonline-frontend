export type Role = "ADMIN" | "PROFESSOR" | "ALUNO";

export const TOKEN_COOKIE = "seed_token";
export const ROLE_COOKIE = "seed_role";
export const PWD_CHANGE_COOKIE = "seed_pwd_change";
export const TROCA_SENHA_PATH = "/troca-senha-obrigatoria";

export type JwtPayload = {
  sub: string;
  role: Role;
  exp: number;
};

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isExpired(payload: JwtPayload | null): boolean {
  if (!payload) return true;
  return Date.now() >= payload.exp * 1000;
}

export function roleHomePath(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "PROFESSOR":
      return "/professor";
    case "ALUNO":
      return "/aluno";
  }
}