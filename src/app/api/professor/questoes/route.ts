import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { API_URL } from "@/lib/api";

export async function GET(request: Request) {
  const store = await cookies();
  const token = store.get("seed_token")?.value;
  if (!token) {
    return NextResponse.json({ detail: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const componenteId = searchParams.get("componenteId");

  if (!componenteId) {
    return NextResponse.json(
      { detail: "Parâmetro componenteId obrigatório" },
      { status: 422 },
    );
  }

  try {
    const upstream = await fetch(
      `${API_URL}/professor/questoes?componenteId=${encodeURIComponent(componenteId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    const body = await upstream.json().catch(() => null);
    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { detail: "Falha ao consultar o servidor" },
      { status: 502 },
    );
  }
}
