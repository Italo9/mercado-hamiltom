/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    // White-label: as imagens dos produtos vêm do feed de cada mercado (host
    // variável) e do serviço de demonstração. unoptimized evita ter que
    // cadastrar cada host em remotePatterns e aceita qualquer URL https.
    unoptimized: true,
  },
  experimental: {
    // Libs do atendimento humano (Baileys) só rodam no host persistente (Docker).
    // Marcadas como externas para nunca serem empacotadas no build.
    serverComponentsExternalPackages: ["@whiskeysockets/baileys", "pino", "qrcode-terminal"],
  },
}

module.exports = nextConfig
