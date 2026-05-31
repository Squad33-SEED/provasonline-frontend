"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { registrarViolacao, type TipoViolacao } from "@/lib/aluno"

interface ModoSeguroOptions {
  resultadoId: string
  ativo: boolean
}

interface ModoSeguroEstado {
  totalViolacoes: number
  emTelaCheia: boolean
  alertaVisivel: boolean
  mensagemAlerta: string
  entrarTelaCheia: () => Promise<void>
  dispensarAlerta: () => void
}

const TECLAS_BLOQUEADAS = new Set(["c", "v", "x", "p", "u", "s"])

export function useModoSeguro({ resultadoId, ativo }: ModoSeguroOptions): ModoSeguroEstado {
  const [totalViolacoes, setTotalViolacoes] = useState(0)
  const [emTelaCheia, setEmTelaCheia] = useState(false)
  const [alertaVisivel, setAlertaVisivel] = useState(false)
  const [mensagemAlerta, setMensagemAlerta] = useState("")

  const ativoRef = useRef(ativo)
  const ultimaViolacaoRef = useRef(0)

  useEffect(() => {
    ativoRef.current = ativo
  }, [ativo])

  const reportar = useCallback(
    (tipo: TipoViolacao, mensagem: string) => {
      if (!ativoRef.current || !resultadoId) return

      const agora = Date.now()
      if (agora - ultimaViolacaoRef.current < 1200) return
      ultimaViolacaoRef.current = agora

      setMensagemAlerta(mensagem)
      setAlertaVisivel(true)

      void registrarViolacao(resultadoId, tipo).then((r) => {
        if (r.registrada) setTotalViolacoes(r.totalViolacoes)
      })
    },
    [resultadoId],
  )

  const entrarTelaCheia = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen()
    } catch {
      // navegador pode recusar sem gesto do usuario
    }
  }, [])

  const dispensarAlerta = useCallback(() => setAlertaVisivel(false), [])

  useEffect(() => {
    if (!ativo) return

    function aoMudarVisibilidade() {
      if (document.hidden) {
        reportar("trocou_aba", "Você saiu da aba da prova. Esta ação foi registrada e o professor foi notificado.")
      }
    }

    function aoPerderFoco() {
      reportar("perdeu_foco", "A janela da prova perdeu o foco. Esta ação foi registrada.")
    }

    function aoMudarTelaCheia() {
      const ativa = Boolean(document.fullscreenElement)
      setEmTelaCheia(ativa)
      if (!ativa) {
        reportar("saiu_tela_cheia", "Você saiu do modo tela cheia. Retorne para continuar a prova com segurança.")
      }
    }

    function aoCopiarColar(e: ClipboardEvent) {
      e.preventDefault()
      reportar("copiar_colar", "Copiar e colar está desativado durante a prova.")
    }

    function aoMenuContexto(e: MouseEvent) {
      e.preventDefault()
      reportar("menu_contexto", "O menu do botão direito está desativado durante a prova.")
    }

    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "F12") {
        e.preventDefault()
        reportar("atalho_proibido", "Atalho bloqueado durante a prova.")
        return
      }
      if ((e.ctrlKey || e.metaKey) && TECLAS_BLOQUEADAS.has(e.key.toLowerCase())) {
        e.preventDefault()
        reportar("atalho_proibido", "Atalho bloqueado durante a prova.")
      }
    }

    document.addEventListener("visibilitychange", aoMudarVisibilidade)
    window.addEventListener("blur", aoPerderFoco)
    document.addEventListener("fullscreenchange", aoMudarTelaCheia)
    document.addEventListener("copy", aoCopiarColar)
    document.addEventListener("paste", aoCopiarColar)
    document.addEventListener("cut", aoCopiarColar)
    document.addEventListener("contextmenu", aoMenuContexto)
    document.addEventListener("keydown", aoTeclar)

    return () => {
      document.removeEventListener("visibilitychange", aoMudarVisibilidade)
      window.removeEventListener("blur", aoPerderFoco)
      document.removeEventListener("fullscreenchange", aoMudarTelaCheia)
      document.removeEventListener("copy", aoCopiarColar)
      document.removeEventListener("paste", aoCopiarColar)
      document.removeEventListener("cut", aoCopiarColar)
      document.removeEventListener("contextmenu", aoMenuContexto)
      document.removeEventListener("keydown", aoTeclar)
    }
  }, [ativo, reportar])

  return {
    totalViolacoes,
    emTelaCheia,
    alertaVisivel,
    mensagemAlerta,
    entrarTelaCheia,
    dispensarAlerta,
  }
}
