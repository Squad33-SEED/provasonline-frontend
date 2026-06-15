import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { API_URL } from "@/lib/api"

export async function POST(req: NextRequest) {
  const token = (await cookies()).get("seed_token")?.value
  if (!token) {
    return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const res = await fetch(`${API_URL}/simulado-livre/selecionar`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
