import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

async function token() {
  return (await cookies()).get("seed_token")?.value;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const t = await token();
  if (!t) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${API_URL}/catalogo/componentes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const t = await token();
  if (!t) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 });
  const { id } = await params;
  const res = await fetch(`${API_URL}/catalogo/componentes/${id}/toggle`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
}