import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { API_URL } from "@/lib/api"

export async function GET() {
  const token = (await cookies()).get("seed_token")?.value
  if (!token) {
    return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
  }
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
