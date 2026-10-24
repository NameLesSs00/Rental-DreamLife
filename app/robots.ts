import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { locales } from "@/lib/i18n/config";

export default function robots(): MetadataRoute.Robots {
  const privatePublicRoutes = ["/payment/", "/booking-confirmation"];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/billing/",
        ...privatePublicRoutes.flatMap((path) => locales.map((locale) => `/${locale}${path}`)),
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
