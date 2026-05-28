import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

export async function GET(
  _req: Request,
  context: { params: Promise<{ componenteId: string }> }
) {
  const { componenteId } = await context.params;

  try {
    const data = await apiFetch(`/catalogo/assuntos/${componenteId}`);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.detail ?? "Erro" },
      { status: err.status ?? 502 }
    );
  }
}