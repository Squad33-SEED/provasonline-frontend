"use client";

export function ImprimirBotao() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print rounded-lg bg-amber-400 px-5 py-2 text-sm font-semibold text-[#0c1a33] hover:bg-amber-300"
    >
      Imprimir / Baixar PDF
    </button>
  );
}
