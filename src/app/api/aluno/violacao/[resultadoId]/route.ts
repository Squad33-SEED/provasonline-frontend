import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "@/lib/auth";
import { API_URL } from "@/lib/api";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ resultadoId: string }> },
) {
  const { resultadoId } = await params;
  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ detail: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  const res = await fetch(`${API_URL}/aluno/violacao/${resultadoId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
