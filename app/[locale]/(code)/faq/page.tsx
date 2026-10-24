import type { Metadata } from "next";
import FaqPageContent from "@/components/FaqPageContent";
import { API_BASE_URL } from "@/lib/api/config";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import type { FaqItem, FaqApiResponse } from "@/lib/types/faq";
import type { PaginatedResponse } from "@/lib/types/contact";

const copy: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Frequently Asked Questions",
    description: "Find answers about Hurghada vacation rentals, booking, payments, Red Sea trips, and property support with Sea Key Property.",
  },
  fr: {
    title: "Questions fréquentes",
    description: "Trouvez des réponses sur les locations, réservations, paiements, excursions privées et services à Hurghada avec Sea Key Property.",
  },
  de: {
    title: "Häufig gestellte Fragen",
    description: "Antworten zu Ferienunterkünften, Buchungen, Zahlungen, Rotmeer-Ausflügen und Support in Hurghada von Sea Key Property.",
  },
  ru: {
    title: "Частые вопросы",
    description: "Ответы о бронировании жилья, оплате, морских поездках и поддержке в Хургаде от Sea Key Property.",
  },
  ar: {
    title: "الأسئلة الشائعة",
    description: "ابحث عن إجابات حول إيجارات العطلات، الحجوزات، المدفوعات، الرحلات البحرية، والدعم في الغردقة مع سي كي بروبرتي.",
  },
};

export async function generateMetadata({ params }: PageProps<"/[locale]/faq">): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const metadata = copy[locale];

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical: absoluteUrl(`/${locale}/faq`),
    },
    openGraph: {
      title: `${metadata.title} | ${siteConfig.name}`,
      description: metadata.description,
      url: absoluteUrl(`/${locale}/faq`),
    },
  };
}

export default async function FaqPage({ params }: PageProps<"/[locale]/faq">) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getMessages(locale);

  let faqJsonLd: Record<string, unknown> | null = null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/faqs?IsPublished=true&PageNumber=1&PageSize=50&SortBy=displayOrder&IsDescending=false`, {
      next: { revalidate: 300 },
      headers: { "Accept-Language": locale, "X-Locale": locale },
    });
    if (res.ok) {
      const json: FaqApiResponse<PaginatedResponse<FaqItem>> = await res.json();
      const items = json?.data?.items ?? [];
      if (items.length > 0) {
        faqJsonLd = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        };
      }
    }
  } catch {
    // Graceful fallback
  }

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
        item: absoluteUrl(`/${locale}/faq`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <FaqPageContent />
    </>
  );
}
