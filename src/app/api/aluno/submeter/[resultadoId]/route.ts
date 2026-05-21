import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { API_URL } from "@/lib/api"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ resultadoId: string }> }
) {
  const { resultadoId } = await params
  const token = (await cookies()).get("seed_token")?.value
  const res = await fetch(`${API_URL}/aluno/submeter/${resultadoId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}