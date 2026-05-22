"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

export type IconName = keyof typeof Icon;

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
};

type Props = {
  role: "Administração" | "Professor" | "Aluno";
  roleTag: string;
  nav: NavItem[];
  children: React.ReactNode;
};

export function AppShell({ role, roleTag, nav, children }: Props) {
  const pathname = usePathname();

  return (
    <div className="dark relative flex min-h-screen w-full bg-[#061024] text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(148,163,184,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.3)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 size-[420px] rounded-full bg-blue-600/[0.10] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/4 size-[320px] rounded-full bg-amber-400/[0.05] blur-[120px]"
      />

      <aside className="relative z-10 flex w-64 shrink-0 flex-col gap-6 border-r border-white/10 bg-white/[0.01] px-4 py-6">
        <Link href="/perfil" title="Meu Perfil" className="flex items-center gap-3 px-2">
          <Image
            src="/logo.jpeg"
            alt="SEED-SE"
            width={40}
            height={40}
            className="size-10 rounded-full object-cover ring-1 ring-white/15"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/50">
              SEED · Sergipe
            </span>
            <span className="text-sm font-semibold text-white">{role}</span>
          </div>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {(() => {
            const matches = nav.filter(
              (item) =>
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href + "/"))
            );
            const activeHref = matches.sort(
              (a, b) => b.href.length - a.href.length
            )[0]?.href;
            return nav.map((item) => {
              const active = item.href === activeHref;
              const IconComp = Icon[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors",
                  active
                    ? "bg-amber-400/10 text-amber-200 ring-1 ring-amber-400/20"
                    : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                <IconComp
                  className={cn(
                    "size-5 shrink-0",
                    active ? "text-amber-300" : "text-white/40"
                  )}
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
            });
          })()}
        </nav>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
          <p className="px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
            {roleTag}
          </p>
          <LogoutButton />
        </div>
      </aside>

      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-white/10 px-8 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-white/50">{description}</p>
        )}
      </div>
      {action}
    </header>
  );
}

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/[0.02] p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "amber" | "blue" | "emerald" | "rose";
}) {
  const tone = {
    amber: "text-amber-300",
    blue: "text-blue-300",
    emerald: "text-emerald-300",
    rose: "text-rose-300",
  }[accent ?? "amber"];

  return (
    <Panel>
      <div className="flex flex-col gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
          {label}
        </p>
        <p className={cn("text-2xl font-semibold tabular-nums", tone)}>
          {value}
        </p>
        {hint && <p className="text-xs text-white/40">{hint}</p>}
      </div>
    </Panel>
  );
}

export function Tag({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "amber" | "blue" | "emerald" | "rose" | "slate";
}) {
  const styles = {
    amber: "bg-amber-400/10 text-amber-200 ring-amber-400/20",
    blue: "bg-blue-500/10 text-blue-200 ring-blue-400/20",
    emerald: "bg-emerald-500/10 text-emerald-200 ring-emerald-400/20",
    rose: "bg-rose-500/10 text-rose-200 ring-rose-400/20",
    slate: "bg-white/[0.04] text-white/60 ring-white/10",
  }[tone ?? "slate"];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] ring-1",
        styles
      )}
    >
      {children}
    </span>
  );
}
