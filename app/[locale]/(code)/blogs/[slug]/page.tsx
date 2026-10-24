import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import BlogSinglePageContent from "@/components/BlogSinglePageContent";
import { getBlogBySlug, getBlogStaticParams, getRelatedBlogs } from "@/lib/api/blogHelpers";
import { getBlogSlug } from "@/lib/utils/blogSlug";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

type BlogSinglePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: BlogSinglePageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const blog = await getBlogBySlug(slug, locale);

  if (!blog) {
    return {
      title: getNotFoundTitle(locale),
      robots: { index: false, follow: false },
    };
  }

  const description = blog.summary || blog.content?.slice(0, 160) || getFallbackDescription(locale);
  const imageUrl = blog.featuredImageUrl ? (blog.featuredImageUrl.startsWith("http") ? blog.featuredImageUrl : absoluteUrl(blog.featuredImageUrl)) : undefined;

  return {
    title: blog.title,
    description,
    alternates: {
      canonical: absoluteUrl(`/${locale}/blogs/${slug}`),
    },
    openGraph: {
      title: `${blog.title} | ${siteConfig.name}`,
      description,
      url: absoluteUrl(`/${locale}/blogs/${slug}`),
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
  };
}

export async function generateStaticParams() {
  return getBlogStaticParams();
}

export default async function BlogSinglePage({ params }: BlogSinglePageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getMessages(locale);
  const blog = await getBlogBySlug(slug, locale);

  if (!blog) {
    notFound();
  }

  const relatedBlogs = await getRelatedBlogs(blog.id, 3, locale);
  const description = blog.summary || blog.content?.slice(0, 160) || getFallbackDescription(locale);
  const imageUrl = blog.featuredImageUrl ? (blog.featuredImageUrl.startsWith("http") ? blog.featuredImageUrl : absoluteUrl(blog.featuredImageUrl)) : absoluteUrl(siteConfig.ogImage);

  const blogPostJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description,
    image: [imageUrl],
    datePublished: blog.createdAtUtc,
    dateModified: blog.updatedAtUtc || blog.createdAtUtc,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl(`/${locale}`),
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(siteConfig.logo),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/${locale}/blogs/${slug}`),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: messages.common.home,
        item: absoluteUrl(`/${locale}`),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: messages.common.blogs,
        item: absoluteUrl(`/${locale}/blogs`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog.title,
        item: absoluteUrl(`/${locale}/blogs/${slug}`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostJsonLd) }}
      />
      <BlogSinglePageContent blog={blog} relatedBlogs={relatedBlogs} />
    </>
  );
}

function getFallbackDescription(locale: Locale) {
  switch (locale) {
    case "ar":
      return "اقرأ نصائح السفر والإقامة في الغردقة.";
    case "fr":
      return "Lisez des conseils de voyage et de location à Hurghada.";
    case "de":
      return "Lesen Sie Reisetipps und Einblicke zu Ferienunterkünften in Hurghada.";
    case "ru":
      return "Читайте советы о путешествиях и жилье в Хургаде.";
    default:
      return "Read Hurghada travel, vacation rental, and property insights.";
  }
}

function getNotFoundTitle(locale: Locale) {
  switch (locale) {
    case "ar":
      return "المقال غير موجود";
    case "fr":
      return "Article introuvable";
    case "de":
      return "Blog nicht gefunden";
    case "ru":
      return "Статья не найдена";
    default:
      return "Blog Not Found";
  }
}
