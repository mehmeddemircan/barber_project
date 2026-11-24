import type { Metadata } from "next";
import { DM_Sans, Oswald } from "next/font/google";
import "./tailwind.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--body" });
const oswald = Oswald({ subsets: ["latin"], variable: "--display" });
const siteUrl = new URL("https://mehmetirsadguder.vercel.app");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Mehmet İrşad Güder Barber Shop | Talas Berber",
    template: "%s | Mehmet İrşad Güder Barber Shop",
  },
  description: "Talas, Kayseri'de Mehmet İrşad Güder Barber Shop'ta profesyonel erkek saç kesimi ve sakal tasarımı için randevunuzu alın.",
  applicationName: "Mehmet İrşad Güder Barber Shop",
  authors: [{ name: "Mehmet İrşad Güder" }],
  creator: "Mehmet İrşad Güder",
  publisher: "Mehmet İrşad Güder Barber Shop",
  category: "Barber Shop",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  keywords: [
    "Talas berber",
    "Kayseri berber",
    "Talas erkek kuaförü",
    "erkek saç kesimi Talas",
    "sakal tasarımı Kayseri",
    "profesyonel berber Talas",
    "Talas berber randevu",
    "Mehmet İrşad Güder Barber Shop",
  ],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    siteName: "Mehmet İrşad Güder Barber Shop",
    title: "Mehmet İrşad Güder Barber Shop | Talas Berber",
    description: "Talas'ta profesyonel erkek saç kesimi ve sakal tasarımı. Koltuğunuzu ayırtın.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Mehmet İrşad Güder Barber Shop — Talas, Kayseri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mehmet İrşad Güder Barber Shop | Talas Berber",
    description: "Talas'ta profesyonel erkek saç kesimi ve sakal tasarımı. Koltuğunuzu ayırtın.",
    images: ["/twitter-image"],
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl.toString()}#website`,
      url: siteUrl.toString(),
      name: "Mehmet İrşad Güder Barber Shop",
      inLanguage: "tr-TR",
      publisher: { "@id": `${siteUrl.toString()}#organization` },
    },
    {
      "@type": ["BarberShop", "HairSalon"],
      "@id": `${siteUrl.toString()}#organization`,
      name: "Mehmet İrşad Güder Barber Shop",
      description: "Talas, Kayseri'de profesyonel erkek saç kesimi, sakal tasarımı ve kişisel bakım.",
      url: siteUrl.toString(),
      image: new URL("/opengraph-image", siteUrl).toString(),
      logo: new URL("/icon.svg", siteUrl).toString(),
      priceRange: "₺₺",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Mevlana Mah. Mehmet Timuçin Cad., Özkan Sok. No: 1 D:C",
        addressLocality: "Talas",
        addressRegion: "Kayseri",
        postalCode: "38280",
        addressCountry: "TR",
      },
      areaServed: [
        { "@type": "City", name: "Talas" },
        { "@type": "City", name: "Kayseri" },
      ],
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "10:00",
          closes: "23:00",
        },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Berber Hizmetleri",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: "Klasik Kesim" },
            price: "500",
            priceCurrency: "TRY",
          },
          {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: "Saç + Sakal" },
            price: "500",
            priceCurrency: "TRY",
          },
          {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: "Sakal Tasarımı" },
            price: "500",
            priceCurrency: "TRY",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Evde Kesim",
              description: "Talas içinde adreste erkek saç kesimi.",
              areaServed: { "@type": "City", name: "Talas" },
            },
            price: "500",
            priceCurrency: "TRY",
          },
        ],
      },
      sameAs: [],
    },
  ],
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