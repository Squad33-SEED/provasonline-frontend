import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";

const registros = [
  { aluno: "Lucas Silva", matricula: "2026001", escola: "CEAS", ip: "200.131.10.12", status: "ativo" },
  { aluno: "Marina Costa", matricula: "2026002", escola: "CEAS", ip: "200.131.10.12", status: "ativo" },
  { aluno: "Rafael Lima", matricula: "2026005", escola: "CEAS", ip: "—", status: "pendente" },
  { aluno: "João Pereira", matricula: "2026003", escola: "E.E. Murilo Braga", ip: "200.131.44.8", status: "ativo" },
  { aluno: "Carla Santos", matricula: "2026004", escola: "CESAJ", ip: "200.131.77.2", status: "bloqueado" },
];

const tone = (s: string) =>
  s === "ativo" ? "emerald" : s === "bloqueado" ? "rose" : "amber";

export default function IPs() {
  return (
    <>
      <PageHeader
        title="IPs autorizados"
        description="Restrição de acesso por IP conforme persona Ricardo Menezes — validação por escola"
        action={
          <Button className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300">
            <Icon.Plus />
            Vincular IP
          </Button>
        }
      />

      <section className="grid grid-cols-3 gap-4 px-8 py-6">
        <Panel>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Alunos com IP ativo</p>
          <p className="pt-2 text-2xl font-semibold text-emerald-300 tabular-nums">1.112</p>
        </Panel>
        <Panel>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Pendentes</p>
          <p className="pt-2 text-2xl font-semibold text-amber-300 tabular-nums">172</p>
        </Panel>
        <Panel>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Bloqueios hoje</p>
          <p className="pt-2 text-2xl font-semibold text-rose-300 tabular-nums">2</p>
        </Panel>
      </section>

      <section className="px-8 pb-8">
        <Panel>
          <h2 className="pb-4 text-sm font-semibold text-white">Registros</h2>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.1em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Aluno</th>
                  <th className="px-4 py-3 font-medium">Matrícula</th>
                  <th className="px-4 py-3 font-medium">Escola</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {registros.map((r) => (
                  <tr key={r.matricula} className="text-white/80">
                    <td className="px-4 py-3 font-medium text-white">{r.aluno}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/60">{r.matricula}</td>
                    <td className="px-4 py-3 text-white/70">{r.escola}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/70">{r.ip}</td>
                    <td className="px-4 py-3">
                      <Tag tone={tone(r.status)}>{r.status}</Tag>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </>
  );
}
