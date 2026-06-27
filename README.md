# 🛒 Mercado do Hamiltom (MVP)

Site institucional com catálogo de produtos e assistente de IA para o Mercado do Hamiltom.

## Stack

- **Next.js 14** (App Router + Edge Runtime)
- **TypeScript** + **Tailwind CSS**
- **NVIDIA NIM** , agente "Tom" com fallback entre 4 modelos gratuitos
- **Docker** para deploy sem dor de cabeça

## Modelos NVIDIA NIM (fallback em ordem)

| Modelo | Parâmetros | Especialidade |
|--------|-----------|---------------|
| `deepseek-ai/deepseek-v4-flash` | 284B MoE | Rápido, 1M contexto |
| `z-ai/glm-5.1` | 744B | Multilingual, agentic |
| `mistralai/devstral-2-123b-instruct-2512` | 123B | Código |
| `moonshotai/kimi-k2-5` | , | Contexto longo |

Se o primeiro modelo estiver indisponível, o próximo é tentado automaticamente.

## Obter API Key NVIDIA (gratuito)

1. Acesse **https://build.nvidia.com**
2. Crie uma conta gratuita (só email, sem cartão)
3. Vá em **Settings → API Keys → Generate**
4. Copie a chave (`nvapi-...`)

## Rodar localmente

```bash
# 1. Clone e entre na pasta
cd mercado-do-hamiltom

# 2. Instale as dependências
npm install

# 3. Configure a chave da API
cp .env.example .env.local
# edite .env.local e cole sua NVIDIA_API_KEY

# 4. Suba o servidor de desenvolvimento
npm run dev
# acesse http://localhost:3000
```

## Rodar com Docker Compose

```bash
export NVIDIA_API_KEY=nvapi-...

docker compose up --build
# acesse http://localhost:3000
```

## Estrutura

```
src/
  app/
    api/chat/route.ts   ← endpoint do Tom (Edge)
    layout.tsx
    page.tsx
  components/
    catalog/
      CatalogGrid.tsx   ← grid com busca e filtros por categoria
      ProductCard.tsx   ← card individual de produto
    chat/
      ChatWidget.tsx    ← chat flutuante
      TypingIndicator.tsx
    ui/
      Hero.tsx
      Navbar.tsx
      Footer.tsx
  lib/
    products.ts         ← catálogo de produtos (mock)
    chat.ts             ← sugestões e system prompt do Tom
  types/
    index.ts
```

## Próximos passos sugeridos

- [ ] Integrar API real do sistema de frente de caixa do Mercado do Hamiltom
- [ ] Adicionar carrinho de compras
- [ ] Página de admin para gestão de estoque
- [ ] WhatsApp click-to-chat
- [ ] SEO local (schema.org/LocalBusiness)
