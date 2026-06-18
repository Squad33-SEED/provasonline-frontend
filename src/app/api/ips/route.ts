import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/lib/api";

async function obterToken() {
  const store = await cookies();
  return store.get("seed_token")?.value;
}

export async function GET(req: NextRequest) {
  const token = await obterToken();
  if (!token) {
    return NextResponse.json({ detail: "Não autenticado" }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${API_URL}/ips${req.nextUrl.search}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const body = await upstream.json().catch(() => null);
    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { detail: "Falha ao consultar o servidor" },
      { status: 502 },
    );
  }
}

export async function POST(req: NextRequest) {
  const token = await obterToken();
  if (!token) {
    return NextResponse.json({ detail: "Não autenticado" }, { status: 401 });
  }

  const payload = await req.json().catch(() => null);

  try {
    const upstream = await fetch(`${API_URL}/ips`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const body = await upstream.json().catch(() => null);
    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { detail: "Falha ao consultar o servidor" },
      { status: 502 },
    );
  }
}
