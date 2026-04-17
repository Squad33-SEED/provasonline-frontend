import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ROLE_COOKIE, roleHomePath, type Role } from "@/lib/auth";

export default async function Home() {
  const jar = await cookies();
  const role = jar.get(ROLE_COOKIE)?.value as Role | undefined;
  if (!role) redirect("/login");
  redirect(roleHomePath(role));
}
