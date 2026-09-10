import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "O REI — Sua carreira no futebol",
  description: "Crie seu atleta, escolha seu caminho e construa um legado no futebol.",
  manifest: "/manifest.webmanifest",
  applicationName: "O REI",
  appleWebApp: { capable: true, title: "O REI", statusBarStyle: "black-translucent" },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/o-rei-logo.png",
    shortcut: "/o-rei-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
