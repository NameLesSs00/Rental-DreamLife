import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { getMessages } from "@/lib/i18n/messages";
import { isLocale, type Locale } from "@/lib/i18n/config";
import RefundPolicyContent from "@/components/RefundPolicyContent";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getMessages(locale);

  return {
    title: `${messages.refundPolicy.metadataTitle} | ${siteConfig.name}`,
    description: messages.refundPolicy.metadataDescription,
    alternates: {
      canonical: absoluteUrl(`/${locale}/refund-policy`),
    },
    openGraph: {
      title: `${messages.refundPolicy.metadataTitle} | ${siteConfig.name}`,
      description: messages.refundPolicy.metadataDescription,
      url: absoluteUrl(`/${locale}/refund-policy`),
    },
  };
}

export default async function RefundPolicyPage({ params }: Props) {
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
        name: messages.refundPolicy.metadataTitle,
        item: absoluteUrl(`/${locale}/refund-policy`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <RefundPolicyContent locale={locale} messages={messages} />
    </>
  );
}
