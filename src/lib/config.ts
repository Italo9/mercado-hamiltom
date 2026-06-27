// Configuração white-label do site.
//
// Tudo que aparece na tela vem daqui, e cada valor pode ser sobrescrito por
// variável de ambiente, assim o mesmo código serve para vários mercados,
// bastando trocar as variáveis a cada deploy (na Vercel: Project → Settings →
// Environment Variables; depois Redeploy).
//
// Regras:
// - Variáveis exibidas no NAVEGADOR precisam do prefixo NEXT_PUBLIC_ (o Next
//   injeta esses valores no build do client).
// - Variáveis só de servidor (chaves de API, URL de integração) NÃO usam o
//   prefixo (ex.: NVIDIA_API_KEY, PRODUCTS_API_URL).
// - Os defaults abaixo são os dados do Mercado do Hamiltom, então o deploy
//   atual continua funcionando mesmo sem nenhuma variável setada. Um novo
//   mercado só precisa preencher as variáveis.

function readEnv(key: string, fallback: string): string {
  const value = process.env[key]
  if (value && value.trim() !== "") {
    return value.trim()
  }
  return fallback
}

function readList(key: string, fallback: string): string[] {
  return readEnv(key, fallback)
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "")
}

export const market = {
  name: readEnv("NEXT_PUBLIC_MARKET_NAME", "Mercado do Hamiltom"),
  shortName: readEnv("NEXT_PUBLIC_MARKET_SHORT_NAME", "Hamiltom"),
  tagline: readEnv("NEXT_PUBLIC_MARKET_TAGLINE", "Supermercado"),
  description: readEnv(
    "NEXT_PUBLIC_MARKET_DESCRIPTION",
    "produtos fresquinhos, mercearia completa e o melhor preço do bairro",
  ),
  city: readEnv("NEXT_PUBLIC_MARKET_CITY", "Stella Maris, Salvador, BA"),
  address: readEnv(
    "NEXT_PUBLIC_MARKET_ADDRESS",
    "Rua Missionário Otto Nelson, 25, Stella Maris, Salvador, BA",
  ),
  cep: readEnv("NEXT_PUBLIC_MARKET_CEP", "41600-650"),
  hours: readEnv("NEXT_PUBLIC_MARKET_HOURS", "Aberto · fecha às 22h"),
  // Opcionais: quando vazios, o componente correspondente é ocultado.
  rating: readEnv("NEXT_PUBLIC_MARKET_RATING", "4,4 ★ no Google"),
  whatsapp: readEnv("NEXT_PUBLIC_MARKET_WHATSAPP", "5571992032950"), // só dígitos
  phoneDisplay: readEnv("NEXT_PUBLIC_MARKET_PHONE", "(71) 99203-2950"),
  payments: readList("NEXT_PUBLIC_MARKET_PAYMENTS", "Visa,Mastercard,Elo,Hipercard,Pix"),
  developerName: readEnv("NEXT_PUBLIC_DEVELOPER_NAME", "Ítalo Lima"),
  developerUrl: readEnv("NEXT_PUBLIC_DEVELOPER_URL", "https://italolima.com.br"),
}

export const assistant = {
  name: readEnv("NEXT_PUBLIC_ASSISTANT_NAME", "Tom"),
  role: readEnv("NEXT_PUBLIC_ASSISTANT_ROLE", "seu assistente virtual"),
  availability: readEnv("NEXT_PUBLIC_ASSISTANT_AVAILABILITY", "Atendimento 24 horas"),
}

export function whatsappUrl(): string | null {
  if (!market.whatsapp) {
    return null
  }
  return `https://wa.me/${market.whatsapp}`
}
