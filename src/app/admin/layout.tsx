import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "Dashboard" },
  { href: "/admin/provas", label: "Agendar Provas", icon: "Exams" },
  { href: "/admin/turmas", label: "Turmas", icon: "Class" },
  { href: "/admin/alunos", label: "Alunos", icon: "Students" },
  { href: "/admin/componentes", label: "Componentes", icon: "Book" },
  { href: "/admin/questoes", label: "Banco de questões", icon: "Questions" },
  { href: "/admin/niveis", label: "Níveis & Modalidades", icon: "Layers" },
  { href: "/admin/ips", label: "IPs autorizados", icon: "Shield" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell role="Administração" roleTag="Admin · SEED-SE" nav={nav}>
      {children}
    </AppShell>
  );
}
