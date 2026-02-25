import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DOMUS — Il conto economico della tua casa",
  description:
    "Gestisci le spese della tua casa in modo semplice e immediato. Bollette, manutenzioni, affitti: tutto sotto controllo.",
  keywords: ["spese casa", "gestione immobili", "bollette", "budget domestico"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.variable} antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
