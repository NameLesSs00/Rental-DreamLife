import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SingleBuyPropertyPageContent from "@/components/SingleBuyPropertyPageContent";
import { API_BASE_URL } from "@/lib/api/config";
import { getPropertyIdBySlug } from "@/lib/api/propertyHelpers";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

type PropertyImage = {
  isCover?: boolean;
  imageUrl?: string;
};

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: PageSearchParams;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const query = await searchParams;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getMessages(locale);
  const id = await getPropertyIdBySlug(slug, "buy", locale, query.id);
  
  if (!id) {
    return {
      title: messages.buy.metaNotFoundTitle,
      robots: { index: false, follow: false },
    };
  }

  try {
    // We use fetch here directly for server-side metadata generation to avoid axios instance issues on server
    const res = await fetch(`${API_BASE_URL}/api/public/property-buyings/${id}`, {
      next: { revalidate: 60 },
      headers: { "Accept-Language": locale, "X-Locale": locale },
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const json = await res.json();
    const property = json.data;
    
    const coverImage = (property?.images as PropertyImage[] | undefined)?.find((img) => img.isCover)?.imageUrl;

    return {
      title: property?.title || messages.buy.metaDefaultTitle,
      description:
        property?.description?.substring(0, 160) ||
        messages.buy.metaDefaultDescription,
      alternates: {
        canonical: absoluteUrl(`/${locale}/buy/${slug}`),
      },
      openGraph: {
        title: `${property?.title || messages.buy.metaDefaultTitle} | ${siteConfig.name}`,
        description:
          property?.description?.substring(0, 160) ||
          messages.buy.metaDefaultDescription,
        url: absoluteUrl(`/${locale}/buy/${slug}`),
        images: coverImage ? [{ url: coverImage.startsWith("http") ? coverImage : `${API_BASE_URL}/${coverImage}` }] : []
      }
    };
  } catch {
    return { title: messages.buy.metaDetailsTitle };
  }
}

export default async function SingleBuyPropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: PageSearchParams;
}) {
  const { locale: rawLocale, slug } = await params;
  const query = await searchParams;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getMessages(locale);
  const id = await getPropertyIdBySlug(slug, "buy", locale, query.id);

  if (!id) {
    notFound();
  }

  let propertyJsonLd: Record<string, unknown> | null = null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/property-buyings/${id}`, {
      next: { revalidate: 60 },
      headers: { "Accept-Language": locale, "X-Locale": locale },
    });
    if (res.ok) {
      const json = await res.json();
      const property = json.data;
      if (property) {
        const coverImage = (property?.images as PropertyImage[] | undefined)?.find((img) => img.isCover)?.imageUrl;
        propertyJsonLd = {
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          name: property.title,
          description: property.description?.substring(0, 300),
          url: absoluteUrl(`/${locale}/buy/${slug}`),
          image: coverImage ? [coverImage.startsWith("http") ? coverImage : `${API_BASE_URL}/${coverImage}`] : [],
          offers: {
            "@type": "Offer",
            price: property.price,
            priceCurrency: property.currency || "USD",
            availability: "https://schema.org/InStock",
            businessFunction: "http://purl.org/goodrelations/v1#Sell",
          },
        };
      }
    }
  } catch {
    // Graceful fallback if API unavailable during render
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
        name: messages.buy.metadataTitle,
        item: absoluteUrl(`/${locale}/buy`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: messages.buy.detailsBreadcrumb,
        item: absoluteUrl(`/${locale}/buy/${slug}`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {propertyJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyJsonLd) }}
        />
      )}
      <SingleBuyPropertyPageContent id={id as string} />
    </>
  );
}

