import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { href: "/professor", label: "Dashboard", icon: "Dashboard" },
  { href: "/professor/questoes", label: "Banco de questões", icon: "Questions" },
  { href: "/professor/provas", label: "Resultados", icon: "Chart" },
  { href: "/professor/violacoes", label: "Violações", icon: "Alert" },
];

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell role="Professor" roleTag="Prof · SEED-SE" nav={nav}>
      {children}
    </AppShell>
  );
}
