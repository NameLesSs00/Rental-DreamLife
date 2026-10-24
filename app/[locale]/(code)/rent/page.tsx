import type { Metadata } from "next";
import PropertiesPageContent from "@/components/PropertiesPageContent";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export async function generateMetadata({ params }: PageProps<"/[locale]/rent">): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getMessages(locale);

  return {
    title: messages.rent.metadataTitle,
    description: messages.rent.metadataDescription,
    alternates: {
      canonical: absoluteUrl(`/${locale}/rent`),
    },
    openGraph: {
      title: `${messages.rent.metadataTitle} | ${siteConfig.name}`,
      description: messages.rent.metadataDescription,
      url: absoluteUrl(`/${locale}/rent`),
    },
  };
}

export default async function RentPage({ params }: PageProps<"/[locale]/rent">) {
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
        name: messages.rent.metadataTitle,
        item: absoluteUrl(`/${locale}/rent`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PropertiesPageContent />
    </>
  );
}
