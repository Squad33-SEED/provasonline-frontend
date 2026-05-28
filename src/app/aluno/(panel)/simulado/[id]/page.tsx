"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

type Alternativa = { letra: string; texto: string };
type Questao = {
  id: string;
  enunciado: string;
  assunto: string;
  dificuldade: string;
  alternativas: Alternativa[];
};

const toneDif = (d: string) =>
  d === "FACIL" ? "emerald" : d === "MEDIO" ? "amber" : "rose";

export default function RealizarProva({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [provaId, setProvaId] = useState<string>("");
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atual, setAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [segundos, setSegundos] = useState(45 * 60);
  const [savedAt, setSavedAt] = useState<string>("—");

  useEffect(() => {
    params.then(async (p) => {
      setProvaId(p.id);
      try {
        const res = await fetch(`/api/simulados/${p.id}/questoes`, {
          credentials: "include",
          cache: "no-store",
        });
        const dados = await res.json();
        console.log("Questões recebidas:", dados);
        if (Array.isArray(dados)) {
          setQuestoes(dados);
        } else {
          setErro(`Erro: ${JSON.stringify(dados)}`);
          setQuestoes([]);
        }
      } catch (e) {
        console.error("Erro ao carregar questões:", e);
        setErro("Erro ao carregar questões.");
        setQuestoes([]);
      } finally {
        setCarregando(false);
      }
    });
  }, [params]);

  useEffect(() => {
    const i = setInterval(() => setSegundos((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(i);
  }, []);

  if (carregando) return (
    <div className="flex min-h-screen items-center justify-center bg-[#061024] text-white">
      Carregando questões...
    </div>
  );

  if (erro) return (
    <div className="flex min-h-screen items-center justify-center bg-[#061024] text-rose-400">
      {erro}
    </div>
  );

  if (questoes.length === 0) return (
    <div className="flex min-h-screen items-center justify-center bg-[#061024] text-white">
      Nenhuma questão encontrada.
    </div>
  );

  const q = questoes[atual];
  const mm = String(Math.floor(segundos / 60)).padStart(2, "0");
  const ss = String(segundos % 60).padStart(2, "0");
  const tempoBaixo = segundos < 5 * 60;

  function responder(alt: string) {
    setRespostas((r) => ({ ...r, [q.id]: alt }));
    const d = new Date();
    setSavedAt(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`);
  }

  function finalizar() {
    router.replace(`/aluno/resultados?last=${provaId}`);
  }

  return (
    <div className="dark relative flex min-h-screen flex-col bg-[#061024] text-foreground">
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 px-8 py-4">
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/50">Prova em andamento</span>
          <span className="font-mono text-xs text-white">{provaId}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Icon.Shield className="size-4 text-emerald-400" />
            Salvamento automático · {savedAt}
          </div>
          <div className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-sm ring-1",
            tempoBaixo ? "bg-rose-500/10 text-rose-300 ring-rose-400/30 animate-pulse" : "bg-amber-400/10 text-amber-200 ring-amber-400/20"
          )}>
            <Icon.Timer className="size-4" />
            <span className="font-semibold tabular-nums">{mm}:{ss}</span>
          </div>
          <Button onClick={finalizar} className="h-9 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300">
            Finalizar prova
          </Button>
        </div>
      </header>

      <div className="relative z-10 grid flex-1 grid-cols-[1fr_260px] gap-6 px-8 py-6">
        <section className="flex flex-col gap-5">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 pb-4">
              <span className="font-mono text-xs text-white/40">Questão {atual + 1} / {questoes.length}</span>
              <Tag tone={toneDif(q.dificuldade) as any}>{q.dificuldade}</Tag>
              <Tag tone="blue">{q.assunto}</Tag>
            </div>
            <p className="pb-6 text-base leading-relaxed text-white">{q.enunciado}</p>
            <ul className="flex flex-col gap-2.5">
              {q.alternativas.map((a) => {
                const selected = respostas[q.id] === a.letra;
                return (
                  <li key={a.letra}>
                    <button onClick={() => responder(a.letra)} className={cn(
                      "flex w-full items-center gap-4 rounded-lg border px-4 py-3 text-left transition-all",
                      selected ? "border-amber-400/40 bg-amber-400/10" : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    )}>
                      <span className={cn("flex size-7 items-center justify-center rounded-md font-mono text-xs font-semibold", selected ? "bg-amber-400 text-[#0c1a33]" : "bg-white/[0.04] text-white/60")}>
                        {a.letra}
                      </span>
                      <span className={cn("text-sm", selected ? "text-white" : "text-white/80")}>{a.texto}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setAtual((a) => Math.max(0, a - 1))} disabled={atual === 0} className="h-9 rounded-lg border-white/10 bg-white/[0.02] px-4 text-sm text-white/70">← Anterior</Button>
            <Button onClick={() => setAtual((a) => Math.min(questoes.length - 1, a + 1))} disabled={atual === questoes.length - 1} className="h-9 rounded-lg bg-white/[0.06] px-4 text-sm text-white">Próxima →</Button>
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="pb-3 text-[11px] uppercase tracking-[0.14em] text-white/40">Navegador</p>
            <div className="grid grid-cols-5 gap-1.5">
              {questoes.map((qq, i) => (
                <button key={qq.id} onClick={() => setAtual(i)} className={cn(
                  "flex h-9 items-center justify-center rounded-md font-mono text-xs font-semibold ring-1 transition-colors",
                  i === atual ? "bg-amber-400 text-[#0c1a33] ring-amber-300" : respostas[qq.id] ? "bg-emerald-400/15 text-emerald-200 ring-emerald-400/25" : "bg-white/[0.03] text-white/60 ring-white/10"
                )}>{i + 1}</button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="pb-3 text-[11px] uppercase tracking-[0.14em] text-white/40">Progresso</p>
            <div className="flex items-end justify-between pb-2">
              <span className="font-mono text-2xl font-semibold text-amber-300">{Object.keys(respostas).length}</span>
              <span className="font-mono text-xs text-white/50">/ {questoes.length}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${(Object.keys(respostas).length / questoes.length) * 100}%` }} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}