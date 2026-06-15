import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { API_URL } from "@/lib/api"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const token = (await cookies()).get("seed_token")?.value
  if (!token) {
    return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
  }
  const res = await fetch(`${API_URL}/simulado-livre/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
