import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const t = (await cookies()).get("seed_token")?.value;
  if (!t) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 });
  const { id } = await params;
  const res = await fetch(`${API_URL}/catalogo/assuntos/${id}/toggle`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
}