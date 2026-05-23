import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  PWD_CHANGE_COOKIE,
  ROLE_COOKIE,
  TOKEN_COOKIE,
  decodeJwt,
} from "@/lib/auth";
import { API_URL } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.cpf || !body?.senha) {
    return NextResponse.json(
      { detail: "CPF e senha são obrigatórios" },
      { status: 400 },
    );
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cpf: body.cpf, senha: body.senha }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(
      { detail: data?.detail ?? "Falha no login" },
      { status: res.status },
    );
  }

  const token = data?.access_token as string | undefined;
  const requerTrocaSenha = Boolean(data?.requer_troca_senha);

  if (!token) {
    return NextResponse.json(
      { detail: "Token inválido" },
      { status: 502 },
    );
  }

  const payload = decodeJwt(token);
  if (!payload) {
    return NextResponse.json(
      { detail: "Token inválido" },
      { status: 502 },
    );
  }

  const jar = await cookies();
  const expires = new Date(payload.exp * 1000);
  const isProd = process.env.NODE_ENV === "production";

  jar.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    expires,
  });

  jar.set(ROLE_COOKIE, payload.role, {
    httpOnly: false,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    expires,
  });

  if (requerTrocaSenha) {
    jar.set(PWD_CHANGE_COOKIE, "true", {
      httpOnly: false,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      expires,
    });
  } else {
    jar.delete(PWD_CHANGE_COOKIE);
  }

  return NextResponse.json({
    role: payload.role,
    requerTrocaSenha,
  });
}