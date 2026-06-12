import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { API_URL } from "@/lib/api";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

async function obterToken() {
  const store = await cookies();
  return store.get("seed_token")?.value;
}

export async function PATCH(_req: Request, { params }: Params) {
  const token = await obterToken();
  if (!token) {
    return NextResponse.json({ detail: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const upstream = await fetch(`${API_URL}/ips/${id}/toggle`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
