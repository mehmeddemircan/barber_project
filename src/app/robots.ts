import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://mehmetirsadguder.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/randevu/iptal/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
