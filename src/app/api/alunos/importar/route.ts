import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "@/lib/auth";
import { API_URL } from "@/lib/api";

async function getAuthHeader() {
  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;

  if (!token) return null;

  return `Bearer ${token}`;
}

export async function POST(request: Request) {
  const auth = await getAuthHeader();

  if (!auth) {
    return NextResponse.json(
      { detail: "Não autenticado" },
      { status: 401 },
    );
  }

  const formData = await request.formData();

  const res = await fetch(`${API_URL}/alunos/importar`, {
    method: "POST",
    headers: {
      Authorization: auth,
    },
    body: formData,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  return NextResponse.json(data, {
    status: res.status,
  });
}