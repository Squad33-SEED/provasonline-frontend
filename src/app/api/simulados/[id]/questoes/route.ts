import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  // Tenta pegar o token de qualquer cookie que tenha "token" no nome
  const token = cookieStore.get("seed_token")?.value 
    ?? cookieStore.get("token")?.value
    ?? allCookies.find(c => c.name.includes("token"))?.value;

  if (!token) {
    return NextResponse.json(
      { detail: "Not authenticated", cookies: allCookies.map(c => c.name) }, 
      { status: 401 }
    );
  }

  const resposta = await fetch(`${BACKEND}/simulados/${id}/questoes`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await resposta.json();
  return NextResponse.json(data, { status: resposta.status });
}