import { NextResponse, type NextRequest } from "next/server";
import {
  PWD_CHANGE_COOKIE,
  ROLE_COOKIE,
  TOKEN_COOKIE,
  TROCA_SENHA_PATH,
  type Role,
} from "@/lib/auth";

// "/verificar" é a validação pública de certificado (QR) — sem autenticação,
// para qualquer instituição conferir a autenticidade sem login.
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/verificar"];

const ROLE_PREFIXES: Record<Role, string> = {
  ADMIN: "/admin",
  PROFESSOR: "/professor",
  ALUNO: "/aluno",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value as Role | undefined;
  const requerTrocaSenha =
    request.cookies.get(PWD_CHANGE_COOKIE)?.value === "true";

  if (!token || !role) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const ehRotaTrocaSenha =
    pathname === TROCA_SENHA_PATH ||
    pathname.startsWith(`${TROCA_SENHA_PATH}/`) ||
    pathname === "/api/auth/trocar-senha" ||
    pathname === "/api/auth/logout";

  if (requerTrocaSenha && !ehRotaTrocaSenha) {
    const url = request.nextUrl.clone();
    url.pathname = TROCA_SENHA_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!requerTrocaSenha && pathname === TROCA_SENHA_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = ROLE_PREFIXES[role];
    url.search = "";
    return NextResponse.redirect(url);
  }

  for (const [r, prefix] of Object.entries(ROLE_PREFIXES) as [Role, string][]) {
    if (pathname.startsWith(prefix) && role !== r) {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_PREFIXES[role];
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};