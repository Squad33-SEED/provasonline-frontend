import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

export async function GET() {
  const t = (await cookies()).get("seed_token")?.value;
  if (!t) return NextResponse.json([], { status: 401 });
  const res = await fetch(`${API_URL}/catalogo/assuntos/nomes-existentes`, {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
}