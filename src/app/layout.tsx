import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DINIZ – Comercial e Frios | Qualidade e preço justo",
  description:
    "Comercial e Frios DINIZ em Irecê – BA: frios selecionados, produtos frescos e o melhor preço do bairro. Aceitamos todos os cartões e Pix.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d4111c",
  // Faz o teclado encolher o layout (input e mensagens continuam visíveis no mobile)
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
