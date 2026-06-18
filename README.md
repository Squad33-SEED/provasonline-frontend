# provasonline-frontend — SEED · Squad 33

Portais web (Admin, Professor, Aluno) do **Sistema de Gestão de Provas Online** da SEED-SE.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind 4 · shadcn/ui

| | |
|---|---|
| Frontend (prod) | https://provasonline-frontend-lksp.vercel.app |
| Backend (prod) | https://provasonline-backend.vercel.app |
| Backend (repo) | https://github.com/Squad33-SEED/provasonline-backend |
| Organização | https://github.com/Squad33-SEED |

> **Nota (MVP AI-Powered):** o produto **não consome um serviço de LLM em tempo de execução**. A IA
> (Claude/Claude Code, Gemini, GitHub Copilot) foi o **motor de desenvolvimento** do projeto.

---

## Requisitos

- Node.js 20+ e `npm`
- Backend rodando (local em `http://localhost:3333` ou a API de produção)

## Variáveis de ambiente (`.env.local`)

```env
API_URL="http://127.0.0.1:3333"            # URL do backend
NEXT_PUBLIC_APP_URL="http://localhost:3000" # usado no QR do certificado
```

Em produção, aponte `API_URL` para o backend publicado e `NEXT_PUBLIC_APP_URL` para a URL do frontend.

## Como rodar (local)

```bash
npm install

cp .env.example .env.local        # configure API_URL e NEXT_PUBLIC_APP_URL

npm run dev                       # http://localhost:3000
# build de produção:
npm run build && npm start
```

> O frontend conversa com o backend via **proxies server-side** (`src/app/api/.../route.ts`); o
> guard de autenticação fica em `src/proxy.ts` (middleware do Next 16). Por isso o navegador nunca
> chama o backend diretamente.

## Deploy (Vercel)

Deploy automático a cada push na `main`. Configurar `API_URL` (backend de produção) e
`NEXT_PUBLIC_APP_URL` (URL do frontend) nas *Environment Variables* do projeto.

## Login

Acesse `/login` com uma das contas de demonstração (senha `admin123`):

| Papel | CPF (só números) |
|---|---|
| ADMIN | `12345678909` |
| PROFESSOR | `98765432100` |
| ALUNO | `11122233396` |
