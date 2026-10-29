import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { locales } from "@/lib/i18n/config";
import { getSlugItems } from "@/lib/api/propertyHelpers";
import { getPublishedBlogs } from "@/lib/api/blogHelpers";
import { getBlogSlug } from "@/lib/utils/blogSlug";
import { slugify } from "@/lib/utils/slugify";

const staticRoutes = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "/rent", priority: 0.95, changeFrequency: "daily" as const },
  { path: "/buy", priority: 0.90, changeFrequency: "daily" as const },
  { path: "/blogs", priority: 0.80, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.70, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.70, changeFrequency: "monthly" as const },
  { path: "/faq", priority: 0.65, changeFrequency: "monthly" as const },
  { path: "/house-rules", priority: 0.60, changeFrequency: "monthly" as const },
  { path: "/privacy-policy", priority: 0.50, changeFrequency: "monthly" as const },
  { path: "/refund-policy", priority: 0.50, changeFrequency: "monthly" as const },
  { path: "/cancellation-policy", priority: 0.50, changeFrequency: "monthly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    // 1. Static Pages
    for (const route of staticRoutes) {
      const localizedPath = route.path === "/" ? `/${locale}` : `/${locale}${route.path}`;
      sitemapEntries.push({
        url: absoluteUrl(localizedPath),
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }

    // 2. Dynamic Vacation Rental Listings (/[locale]/rent/[slug])
    try {
      const rentItems = await getSlugItems("rent", locale);
      for (const item of rentItems) {
        const slug = slugify(item.name || item.id);
        if (slug) {
          sitemapEntries.push({
            url: absoluteUrl(`/${locale}/rent/${slug}`),
            lastModified,
            changeFrequency: "daily",
            priority: 0.85,
          });
        }
      }
    } catch (error) {
      console.warn(`[sitemap] Failed to fetch rental properties for sitemap (${locale}):`, error);
    }

    // 3. Dynamic Properties for Sale Listings (/[locale]/buy/[slug])
    try {
      const buyItems = await getSlugItems("buy", locale);
      for (const item of buyItems) {
        const slug = slugify(item.title || item.id);
        if (slug) {
          sitemapEntries.push({
            url: absoluteUrl(`/${locale}/buy/${slug}`),
            lastModified,
            changeFrequency: "weekly",
            priority: 0.80,
          });
        }
      }
    } catch (error) {
      console.warn(`[sitemap] Failed to fetch buy properties for sitemap (${locale}):`, error);
    }

    // 4. Dynamic Blog Post Articles (/[locale]/blogs/[slug])
    try {
      const blogs = await getPublishedBlogs(locale);
      for (const blog of blogs) {
        const slug = getBlogSlug(blog);
        if (slug) {
          sitemapEntries.push({
            url: absoluteUrl(`/${locale}/blogs/${slug}`),
            lastModified: blog.updatedAtUtc ? new Date(blog.updatedAtUtc) : (blog.createdAtUtc ? new Date(blog.createdAtUtc) : lastModified),
            changeFrequency: "weekly",
            priority: 0.75,
          });
        }
      }
    } catch (error) {
      console.warn(`[sitemap] Failed to fetch blog articles for sitemap (${locale}):`, error);
    }
  }

  return sitemapEntries;
}
