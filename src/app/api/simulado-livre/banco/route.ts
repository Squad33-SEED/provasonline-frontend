import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { API_URL } from "@/lib/api"

export async function GET(req: NextRequest) {
  const token = (await cookies()).get("seed_token")?.value
  if (!token) {
    return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
  }
  const qs = req.nextUrl.searchParams.toString()
  const res = await fetch(`${API_URL}/simulado-livre/banco?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
