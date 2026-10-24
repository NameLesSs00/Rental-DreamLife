import type { Metadata } from "next";
import BlogsPageContent from "@/components/BlogsPageContent";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

const copy: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Hurghada Travel & Vacation Rental Guides",
    description: "Read Hurghada travel tips, vacation rental advice, neighbourhood guides, and trip recommendations from Sea Key Property.",
  },
  fr: {
    title: "Guides de voyage et locations de vacances à Hurghada",
    description: "Lisez des conseils de voyage, guides de quartier, recommandations de location et informations sur les excursions à Hurghada par Sea Key Property.",
  },
  de: {
    title: "Reise- und Ferienwohnungsführer für Hurghada",
    description: "Lesen Sie Reisetipps, Ratgeber zu Ferienunterkünften, Stadtteilführer und Ausflugsempfehlungen für Hurghada von Sea Key Property.",
  },
  ru: {
    title: "Гиды по путешествиям и аренде жилья в Хургаде",
    description: "Читайте советы о Хургаде, аренде жилья, районах города и морских поездках от Sea Key Property.",
  },
  ar: {
    title: "أدلة السفر والعطلات في الغردقة",
    description: "اقرأ نصائح السفر للغردقة، إرشادات الإيجار، أدلة الأحياء، ومعلومات الرحلات البحرية من سي كي بروبرتي.",
  },
};

export async function generateMetadata({ params }: PageProps<"/[locale]/blogs">): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const metadata = copy[locale];

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical: absoluteUrl(`/${locale}/blogs`),
    },
    openGraph: {
      title: `${metadata.title} | ${siteConfig.name}`,
      description: metadata.description,
      url: absoluteUrl(`/${locale}/blogs`),
    },
  };
}

export default async function BlogsPage({ params }: PageProps<"/[locale]/blogs">) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getMessages(locale);

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
        name: copy[locale].title,
        item: absoluteUrl(`/${locale}/blogs`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BlogsPageContent />
    </>
  );
}
