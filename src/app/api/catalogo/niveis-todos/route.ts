import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

export async function GET() {
  const t = (await cookies()).get("seed_token")?.value;
  if (!t) return NextResponse.json([], { status: 401 });

  const res = await fetch(`${API_URL}/catalogo/niveis/admin`, {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });
  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}
