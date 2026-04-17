import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ROLE_COOKIE, TOKEN_COOKIE } from "@/lib/auth";
import { API_URL } from "@/lib/api";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;

  if (token) {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => {});
  }

  jar.delete(TOKEN_COOKIE);
  jar.delete(ROLE_COOKIE);

  return NextResponse.json({ ok: true });
}
