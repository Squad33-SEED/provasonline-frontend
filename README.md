# Seed Frontend

Portais web (Admin, Professor, Aluno) do sistema de provas online da SEED-SE.
Next.js 16 + Tailwind 4 + shadcn/ui.

## Requisitos

- Node.js 20+
- Backend rodando em `http://localhost:3333`

## Como rodar

```bash
npm install

cp .env.example .env.local
# API_URL=http://localhost:3333

npm run dev
```

App em `http://localhost:3000`.

## Login

Acesse `/login` e use uma das contas demo criadas pelo `seed.py` do backend
(senha `admin123`):

- ADMIN — CPF `123.456.789-09`
- PROFESSOR — CPF `987.654.321-00`
- ALUNO — CPF `111.222.333-96`
