import type { Metadata } from "next";
import { DM_Sans, Oswald } from "next/font/google";
import "./tailwind.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--body" });
const oswald = Oswald({ subsets: ["latin"], variable: "--display" });

export const metadata: Metadata = {
  title: "Mehmet İrşad Güder Barber Shop | Talas, Kayseri",
  description: "Talas, Kayseri'de Mehmet İrşad Güder Barber Shop'ta profesyonel erkek saç kesimi ve sakal tasarımı için randevunuzu alın.",
  applicationName: "Mehmet İrşad Güder Barber Shop",
  keywords: [
    "Mehmet İrşad Güder Barber Shop",
    "Talas berber",
    "Kayseri berber",
    "Talas erkek kuaförü",
    "erkek saç kesimi",
    "sakal tasarımı",
    "Talas berber randevu",
  ],
  creator: "Mehmet İrşad Güder",
  publisher: "Mehmet İrşad Güder Barber Shop",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Mehmet İrşad Güder Barber Shop",
    title: "Mehmet İrşad Güder Barber Shop | Talas, Kayseri",
    description: "Talas'ta profesyonel erkek saç kesimi ve sakal tasarımı. Koltuğunuzu ayırtın.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mehmet İrşad Güder Barber Shop | Talas, Kayseri",
    description: "Talas'ta profesyonel erkek saç kesimi ve sakal tasarımı. Koltuğunuzu ayırtın.",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "BarberShop",
  name: "Mehmet İrşad Güder Barber Shop",
  description: "Talas, Kayseri'de profesyonel erkek saç kesimi ve sakal tasarımı.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Mevlana Mah. Mehmet Timuçin Cad., Özkan Sok. No: 1 D:C",
    addressLocality: "Talas",
    addressRegion: "Kayseri",
    postalCode: "38280",
    addressCountry: "TR",
  },
  areaServed: ["Talas", "Kayseri"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className={`${dmSans.variable} ${oswald.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}