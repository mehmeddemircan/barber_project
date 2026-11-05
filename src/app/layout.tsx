import type { Metadata } from "next";
import { DM_Sans, Oswald } from "next/font/google";
import "./tailwind.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--body" });
const oswald = Oswald({ subsets: ["latin"], variable: "--display" });

export const metadata: Metadata = {
  title: "KÖK. | Berber Kulübü",
  description: "Talas, Kayseri'de iyi kesim, iyi sohbet. KÖK. Berber Kulübü'nde yerini ayırt.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className={`${dmSans.variable} ${oswald.variable}`}>{children}</body>
    </html>
  );
}