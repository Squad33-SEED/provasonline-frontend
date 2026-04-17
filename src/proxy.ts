import { NextResponse, type NextRequest } from "next/server";
import { ROLE_COOKIE, TOKEN_COOKIE, type Role } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];

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

  if (!token || !role) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (pathname !== "/") url.searchParams.set("next", pathname);
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
