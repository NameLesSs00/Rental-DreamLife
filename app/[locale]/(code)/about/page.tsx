import type { Metadata } from "next";
import AboutPageContent from "@/components/AboutPageContent";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

const copy: Record<Locale, { title: string; description: string; ogTitle: string; ogDescription: string }> = {
  en: {
    title: "About Sea Key Property",
    description:
      "Learn how Sea Key Property connects travelers with handpicked holiday apartments, luxury chalets, and private Red Sea trips in Hurghada.",
    ogTitle: `About ${siteConfig.name} | Vacation Rentals & Trips`,
    ogDescription: "Trusted local hosts for verified vacation rentals, beachside chalets, and Red Sea trips in Hurghada.",
  },
  fr: {
    title: "À propos de Sea Key Property",
    description:
      "Découvrez comment Sea Key Property aide les voyageurs à trouver des appartements, chalets et excursions privées en mer Rouge à Hurghada.",
    ogTitle: `À propos de ${siteConfig.name} | Locations & Excursions`,
    ogDescription: "Des hôtes locaux de confiance pour des locations vérifiées et des excursions privées en mer Rouge à Hurghada.",
  },
  de: {
    title: "Über Sea Key Property",
    description:
      "Erfahren Sie, wie Sea Key Property Reisende mit handverlesenen Ferienwohnungen, Chalets und privaten Rotmeer-Ausflügen in Hurghada verbindet.",
    ogTitle: `Über ${siteConfig.name} | Ferienunterkünfte & Ausflüge`,
    ogDescription: "Verlässliche lokale Gastgeber für geprüfte Ferienunterkünfte und private Rotes-Meer-Ausflüge in Hurghada.",
  },
  ru: {
    title: "О Sea Key Property",
    description:
      "Узнайте, как Sea Key Property помогает путешественникам находить проверенные апартаменты, шале и частные поездки по Красному морю в Хургаде.",
    ogTitle: `О ${siteConfig.name} | Аренда и Экскурсии`,
    ogDescription: "Надежные местные хозяева, проверенное жилье и частные поездки по Красному морю в Хургаде.",
  },
  ar: {
    title: "عن سي كي بروبرتي",
    description:
      "تعرف على كيفية مساعدة سي كي بروبرتي للمسافرين في العثور على شقق وشاليهات ورحلات بحرية خاصة في الغردقة.",
    ogTitle: `عن ${siteConfig.name} | إيجارات ورحلات`,
    ogDescription: "مضيفون محليون موثوقون لعقارات معتمدة ورحلات بحرية خاصة في الغردقة.",
  },
};

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const metadata = copy[locale];

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical: absoluteUrl(`/${locale}/about`),
    },
    openGraph: {
      title: metadata.ogTitle,
      description: metadata.ogDescription,
      url: absoluteUrl(`/${locale}/about`),
    },
  };
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
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
        item: absoluteUrl(`/${locale}/about`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <AboutPageContent />
    </>
  );
}
