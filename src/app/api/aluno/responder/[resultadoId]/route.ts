import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { API_URL } from "@/lib/api"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ resultadoId: string }> }
) {
  const { resultadoId } = await params
  const token = (await cookies()).get("seed_token")?.value
  const body = await req.json()
  const res = await fetch(`${API_URL}/aluno/responder/${resultadoId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}