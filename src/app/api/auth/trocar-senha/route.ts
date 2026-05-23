import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  PWD_CHANGE_COOKIE,
  ROLE_COOKIE,
  TOKEN_COOKIE,
} from "@/lib/auth";
import { API_URL } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.senha_atual || !body?.senha_nova) {
    return NextResponse.json(
      { detail: "Senha atual e nova senha são obrigatórias" },
      { status: 400 },
    );
  }

  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { detail: "Sessão expirada" },
      { status: 401 },
    );
  }

  const res = await fetch(`${API_URL}/auth/trocar-senha`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      senha_atual: body.senha_atual,
      senha_nova: body.senha_nova,
    }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(
      { detail: data?.detail ?? "Falha ao trocar senha" },
      { status: res.status },
    );
  }

  jar.delete(TOKEN_COOKIE);
  jar.delete(ROLE_COOKIE);
  jar.delete(PWD_CHANGE_COOKIE);

  return NextResponse.json({ sucesso: true });
}