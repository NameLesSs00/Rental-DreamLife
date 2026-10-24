import type { Metadata } from "next";
import ContactPageContent from "@/components/ContactPageContent";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getMessages(locale);

  return {
    title: messages.contact.metadataTitle,
    description: messages.contact.metadataDescription,
    alternates: {
      canonical: absoluteUrl(`/${locale}/contact`),
    },
    openGraph: {
      title: `${messages.common.contact} ${siteConfig.name}`,
      description: messages.contact.metadataDescription,
      url: absoluteUrl(`/${locale}/contact`),
    },
  };
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
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
        name: messages.common.contact,
        item: absoluteUrl(`/${locale}/contact`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ContactPageContent />
    </>
  );
}
