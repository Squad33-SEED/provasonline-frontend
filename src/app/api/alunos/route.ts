import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "@/lib/auth";
import { API_URL } from "@/lib/api";

async function getAuthHeader() {
  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  return `Bearer ${token}`;
}

export async function GET(request: Request) {
  const auth = await getAuthHeader();
  if (!auth) {
    return NextResponse.json({ detail: "Não autenticado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const target = new URL(`${API_URL}/alunos`);
  url.searchParams.forEach((value, key) => target.searchParams.append(key, value));

  const res = await fetch(target.toString(), {
    method: "GET",
    headers: { Authorization: auth },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: Request) {
  const auth = await getAuthHeader();
  if (!auth) {
    return NextResponse.json({ detail: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { detail: "Corpo da requisição inválido" },
      { status: 400 },
    );
  }

  const res = await fetch(`${API_URL}/alunos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}