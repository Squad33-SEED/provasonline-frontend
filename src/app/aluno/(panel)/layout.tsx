import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { href: "/aluno", label: "Dashboard", icon: "Dashboard" },
  { href: "/aluno/provas", label: "Provas reais", icon: "Exams" },
  { href: "/aluno/simulado", label: "Simulado livre", icon: "Play" },
  { href: "/aluno/resultados", label: "Resultados", icon: "Chart" },
  { href: "/aluno/certificados", label: "Certificados", icon: "Certificate" },
];

export default function AlunoPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell role="Aluno" roleTag="Aluno · SEED-SE" nav={nav}>
      {children}
    </AppShell>
  );
}
