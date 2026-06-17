import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

async function token() {
  return (await cookies()).get("seed_token")?.value;
}

export async function GET(req: NextRequest) {
  const t = await token();
  if (!t) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 });
  const qs = req.nextUrl.search;
  const res = await fetch(`${API_URL}/catalogo/componentes/admin${qs}`, {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function POST(req: NextRequest) {
  const t = await token();
  if (!t) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 });
  const body = await req.json();
  const res = await fetch(`${API_URL}/catalogo/componentes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
}