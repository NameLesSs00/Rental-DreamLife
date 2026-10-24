import type { Metadata } from "next";
import BestLocationsSection from "@/components/BestLocationsSection";
import BlogInsightsSection from "@/components/BlogInsightsSection";
import CategoriesSection from "@/components/CategoriesSection";
import OurServices from "@/components/OurServices";
import FaqSection from "@/components/FaqSection";
import FeaturedPropertiesSection from "@/components/FeaturedPropertiesSection";
import HeroSection from "@/components/HeroSection";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getMessages(locale);

  return {
    title: messages.seo.homeTitle,
    description: messages.seo.homeDescription,
    alternates: {
      canonical: absoluteUrl(`/${locale}`),
    },
    openGraph: {
      title: `${siteConfig.name} | ${messages.seo.homeTitle}`,
      description: messages.seo.homeDescription,
      url: absoluteUrl(`/${locale}`),
    },
  };
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.fullName,
    alternateName: siteConfig.name,
    url: absoluteUrl(`/${locale}`),
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl(`/${locale}/rent`)}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HeroSection />
      <FeaturedPropertiesSection />
      <BestLocationsSection />
      <OurServices />
      <CategoriesSection />
      <BlogInsightsSection />
      <FaqSection />
    </>
  );
}
