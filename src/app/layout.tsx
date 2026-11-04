import type { Metadata } from "next";
import { DM_Sans, Oswald } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "KÖK. | Berber Kulübü",
  description: "Karaköy'de iyi kesim, iyi sohbet. KÖK. Berber Kulübü'nde yerini ayırt.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className={`${dmSans.variable} ${oswald.variable}`}>{children}</body>
    </html>
  );
}