import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { PageHeader, Panel, Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import type { AproveitamentoNivel, CertificadoItem } from "@/lib/certificados";

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function rotuloTipo(tipo: CertificadoItem["tipo"]) {
  return tipo === "CONCLUSAO"
    ? "Certificado de Conclusão"
    : "Declaração Parcial de Proficiência";
}

export default async function CertificadosPage() {
  let certificados: CertificadoItem[] = [];
  let progresso: AproveitamentoNivel[] = [];
  let erro = false;

  try {
    [certificados, progresso] = await Promise.all([
      apiFetch<CertificadoItem[]>("/aluno/certificados"),
      apiFetch<AproveitamentoNivel[]>("/aluno/aproveitamento"),
    ]);
  } catch {
    erro = true;
  }

  return (
    <>
      <PageHeader
        title="Certificados"
        description="Emitidos automaticamente ao concluir um nível nas provas reais"
      />

      <section className="px-8 py-6">
        {erro ? (
          <Panel>
            <p className="py-4 text-center text-sm text-rose-300">
              Não foi possível carregar os certificados.
            </p>
          </Panel>
        ) : (
          <div className="flex flex-col gap-6">
            <Panel>
              <h2 className="pb-3 text-sm font-semibold text-white">
                Progresso por nível
              </h2>
              {progresso.length === 0 ? (
                <p className="py-2 text-sm text-white/40">
                  Nenhum nível de certificação disponível ainda.
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {progresso.map((nivel) => (
                    <li key={nivel.nivel} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">{nivel.nivel}</span>
                        <span className="font-mono text-xs text-white/50">
                          {nivel.aprovados}/{nivel.totalComponentes} componentes
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {nivel.componentes.map((c) => (
                          <span
                            key={c.componente}
                            className={
                              c.aprovado
                                ? "rounded-md bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300 ring-1 ring-emerald-400/20"
                                : "rounded-md bg-white/[0.03] px-2 py-1 text-xs text-white/40 ring-1 ring-white/10"
                            }
                          >
                            {c.componente}
                            {c.aprovado && c.nota !== null ? ` · ${c.nota.toFixed(1)}` : ""}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {certificados.length === 0 ? (
              <Panel>
                <p className="py-4 text-center text-sm text-white/40">
                  Você ainda não possui certificados. Conclua os componentes de um
                  nível para emitir automaticamente.
                </p>
              </Panel>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {certificados.map((c) => (
                  <Panel key={c.id}>
                    <div className="flex items-start gap-4">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20">
                        <Icon.Certificate className="size-6" />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-white">
                            {c.nivel}
                          </h3>
                          <Tag tone={c.tipo === "CONCLUSAO" ? "emerald" : "amber"}>
                            {c.tipo === "CONCLUSAO" ? "Conclusão" : "Parcial"}
                          </Tag>
                        </div>
                        <p className="text-xs text-white/50">{rotuloTipo(c.tipo)}</p>
                        <p className="font-mono text-xs text-white/40">
                          Emitido em {formatarData(c.emitidoEm)} · {c.anoReferencia}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                        {c.componentesAprovados.length} componentes
                      </span>
                      <Link
                        href={`/aluno/certificado/${c.id}`}
                        className="flex h-8 items-center rounded-lg bg-amber-400 px-4 text-xs font-semibold text-[#0c1a33] hover:bg-amber-300"
                      >
                        Ver certificado
                      </Link>
                    </div>
                  </Panel>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
