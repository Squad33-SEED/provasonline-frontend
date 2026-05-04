import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "@/lib/auth";
import { API_URL } from "@/lib/api";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ detail: "Não autenticado" }, { status: 401 });
  }

  const headers = { Authorization: `Bearer ${token}` };

  const [escolasRes, modalidadesRes] = await Promise.all([
    fetch(`${API_URL}/catalogo/escolas`, { headers, cache: "no-store" }),
    fetch(`${API_URL}/catalogo/modalidades`, { headers, cache: "no-store" }),
  ]);

  if (!escolasRes.ok || !modalidadesRes.ok) {
    return NextResponse.json(
      {
        detail: "Falha ao carregar catálogo",
        escolas_status: escolasRes.status,
        modalidades_status: modalidadesRes.status,
      },
      { status: 502 },
    );
  }

  const escolas = await escolasRes.json();
  const modalidades = await modalidadesRes.json();

  return NextResponse.json({ escolas, modalidades });
}