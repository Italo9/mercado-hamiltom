import type { Metadata, Viewport } from "next";
import "./globals.css";
import { market, assistant } from "@/lib/config";

export const metadata: Metadata = {
  title: market.name,
  description: `Site oficial do ${market.name}. Consulte os preços e a disponibilidade dos produtos e fale com o ${assistant.name}, ${assistant.availability.toLowerCase()}.`,
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
