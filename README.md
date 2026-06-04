# 🛒 DINIZ — Comercial e Frios (MVP)

Site institucional mobile-first com catálogo de produtos e assistente de IA ("Dininho") para a DINIZ Comercial e Frios — Irecê/BA.

## Stack

- **Next.js 14** (App Router + Edge Runtime)
- **TypeScript** + **Tailwind CSS**
- **NVIDIA NIM** — agente "Dininho" com fallback entre modelos gratuitos
- **Docker** para deploy

## Modelos NVIDIA NIM (fallback, primeiro que responder vence)

| Modelo | Especialidade |
|--------|---------------|
| `deepseek-ai/deepseek-v4-flash` | Rápido, contexto longo |
| `z-ai/glm-5.1` | Multilingual / agentic |
| `meta/llama-3.3-70b-instruct` | Generalista (fallback estável) |

## Obter API Key NVIDIA (gratuito)

1. Acesse **https://build.nvidia.com**
2. Crie uma conta gratuita (só email, sem cartão)
3. Vá em **Settings → API Keys → Generate**
4. Copie a chave (`nvapi-...`)

## Rodar localmente

```bash
cd diniz-comercial-e-frios
npm install
cp .env.example .env.local   # cole sua NVIDIA_API_KEY
npm run dev                  # http://localhost:3000
```

## Deploy na Vercel

1. Importe o repositório em vercel.com (Add New Project)
2. Adicione a variável de ambiente `NVIDIA_API_KEY`
3. Deploy — cada `git push` redeploya automaticamente

## Estrutura

```
src/
  app/
    api/chat/route.ts   ← endpoint do Dininho (Edge)
    layout.tsx          ← metadata + viewport (teclado mobile)
    page.tsx
  components/
    catalog/            ← grid, busca, filtros, card de produto
    chat/               ← ChatWidget (mobile-first) + TypingIndicator
    ui/                 ← Navbar, Hero, Footer, Logo
  lib/
    products.ts         ← catálogo (mock)
    chat.ts             ← sugestões e system prompt do Dininho
  types/
    index.ts
```

## Próximos passos sugeridos

- [ ] Integrar API real do sistema de frente de caixa da DINIZ
- [ ] Carrinho de compras + checkout via WhatsApp
- [ ] Painel admin para gestão de estoque
- [ ] SEO local (schema.org/LocalBusiness)
