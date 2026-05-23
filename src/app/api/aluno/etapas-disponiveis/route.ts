import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:3333";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("seed_token")?.value;

  if (!token) {
    return NextResponse.json({ detail: "Não autenticado" }, { status: 401 });
  }

  const res = await fetch(`${BACKEND}/aluno/etapas-disponiveis`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}