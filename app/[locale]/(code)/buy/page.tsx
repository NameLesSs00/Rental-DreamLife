import type { Metadata } from "next";
import BuyPropertiesPageContent from "@/components/BuyPropertiesPageContent";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export async function generateMetadata({ params }: PageProps<"/[locale]/buy">): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getMessages(locale);

  return {
    title: messages.buy.metadataTitle,
    description: messages.buy.metadataDescription,
    alternates: {
      canonical: absoluteUrl(`/${locale}/buy`),
    },
    openGraph: {
      title: `${messages.buy.metadataTitle} | ${siteConfig.name}`,
      description: messages.buy.metadataDescription,
      url: absoluteUrl(`/${locale}/buy`),
    },
  };
}

export default async function BuyPage({ params }: PageProps<"/[locale]/buy">) {
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
        name: messages.buy.metadataTitle,
        item: absoluteUrl(`/${locale}/buy`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BuyPropertiesPageContent />
    </>
  );
}
