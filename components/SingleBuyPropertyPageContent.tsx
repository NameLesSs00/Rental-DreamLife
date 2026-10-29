"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PropertyImageGallery from "./PropertyImageGallery";
import ScrollAnimation from "./ScrollAnimation";
import ContactForm from "./ContactForm";
import DynamicAmenityIcon from "./DynamicAmenityIcon";
import {
  usePublicPropertyBuyingById,
  useRelatedPropertyBuyings,
} from "@/lib/hooks/usePropertyBuying";
import { usePropertyBuyingCategories } from "@/lib/hooks/usePropertyBuyingCategory";
import { useGroupedAmenities, type AmenityGroup } from "@/lib/hooks/useGroupedAmenities";
import { useCurrencies } from "@/lib/hooks/useCurrency";
import { resolveApiImageUrl } from "@/lib/utils/imageUrl";
import type { PropertyBuying, PropertyBuyingListItem } from "@/lib/types/propertyBuying";
import { slugify } from "@/lib/utils/slugify";
import { formatPriceForCurrency, formatPriceInfo } from "@/lib/utils/currency";
import { useI18n } from "./I18nProvider";
import { useHeaderStore } from "@/lib/headerStore";
import CurrencySelect from "./CurrencySelect";
import { useSelectedCurrency } from "@/lib/hooks/useSelectedCurrency";


const propertyTypeNames: Record<number, string> = {
  1: "Apartment",
  2: "Villa",
  3: "Studio",
  4: "Chalet",
  5: "Twin House",
  6: "Townhouse",
  7: "Duplex",
  8: "Penthouse",
  9: "Cabin",
  10: "Hotel",
  11: "2 Bedrooms",
  12: "1 Bedroom",
};

const propertyTypeKeyById: Record<number, string> = {
  1: "rent.apartment",
  2: "rent.villa",
  3: "rent.studio",
  4: "rent.chalet",
  5: "rent.twinHouse",
  6: "rent.townhouse",
  7: "rent.duplex",
  8: "rent.penthouse",
  9: "rent.cabin",
  10: "rent.hotel",
  11: "rent.twoBedrooms",
  12: "rent.oneBedroom",
};

export default function SingleBuyPropertyPageContent({ id }: { id: string }) {
  const { locale, t, href } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedCurrency, setSelectedCurrency] = useSelectedCurrency(searchParams.get("Currency"));
  const { data: property, isLoading } = usePublicPropertyBuyingById(id, locale, selectedCurrency);
  const { data: relatedProperties = [] } = useRelatedPropertyBuyings(id, locale);
  const displayedRelated = useMemo(() => relatedProperties.slice(0, 3), [relatedProperties]);
  const { data: categories = [] } = usePropertyBuyingCategories(locale);
  const { data: currencies = [] } = useCurrencies({ isActive: true });
  const setPageEntity = useHeaderStore((state) => state.setPageEntity);

  useEffect(() => {
    setPageEntity(id, "buy");
    return () => setPageEntity(null, null);
  }, [id, setPageEntity]);

  const categoryValues = property?.categoryValues || [];
  const { groups: amenityGroups, categories: amenityCategories } = useGroupedAmenities(
    categoryValues,
    categories,
    t("buy.features")
  );

  if (isLoading) return <div className="p-20 text-center">{t("buy.loadingProperty")}</div>;
  if (!property) return <div className="p-20 text-center">{t("buy.notFound")}</div>;

  const handleCurrencyChange = (nextCurrency: string) => {
    const normalizedCurrency = nextCurrency.toUpperCase();
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("id", id);
    nextParams.set("Currency", normalizedCurrency);
    setSelectedCurrency(normalizedCurrency);
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const priceLabel = formatPriceForCurrency(
    property.priceInfo,
    property.price,
    selectedCurrency,
    currencies,
  );

  const galleryImages = (property.images || []).sort((a, b) => a.displayOrder - b.displayOrder).map((img) => ({ src: resolveApiImageUrl(img.imageUrl), alt: property.title }));
  if (galleryImages.length === 0) galleryImages.push({ src: "/rent/property-card.png", alt: "Placeholder" });

  return (
    <main className="overflow-hidden bg-[#F3F0E9] font-[var(--font-poppins)] text-[#183c2f]">
      <section className="px-5 pb-12 pt-6 lg:px-20 lg:pb-4 lg:pt-10">
        <div className="mx-auto w-full max-w-[1282px]">
          <div className="min-w-0">
            <ScrollAnimation delay={0} className="min-w-0">
              <PropertyImageGallery
                images={galleryImages}
                variant="mosaic"
                className="mx-auto max-w-[1180px]"
              />
            </ScrollAnimation>
          </div>

          {/* Title sits BELOW the gallery, per the Figma layout. */}
          <ScrollAnimation delay={0.05}>
            <PropertyTitle property={property} />
          </ScrollAnimation>

          <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1.72fr)_minmax(0,1fr)] lg:gap-10">
            {/* ── Left column ── */}
            <div className="min-w-0">
              <ScrollAnimation delay={0.05}>
                <DescriptionSection text={property.description} />
              </ScrollAnimation>

              <ScrollAnimation delay={0.05}>
                <AmenitiesSection groups={amenityGroups} />
              </ScrollAnimation>
            </div>

            {/* ── Right sticky sidebar ── */}
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <ScrollAnimation delay={0.05}>
                <PropertyInformationCard
                  property={property}
                  priceLabel={priceLabel}
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={handleCurrencyChange}
                />
                <BasicAmenitiesCard categories={amenityCategories} />
              </ScrollAnimation>
            </aside>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="bg-white px-5 py-12 sm:px-8 lg:px-20 lg:py-20">
        <div className="mx-auto max-w-[800px]">
          <div className="mb-10 text-center">
            <h2 className="text-[28px] font-semibold text-[#183c2f] sm:text-[32px]">{t("buy.contactTitle")}</h2>
            <p className="mt-4 text-[#667c74]">{t("buy.contactBody")}</p>
          </div>
          <ContactForm defaultSubject={t("buy.contactSubject", { title: property.title, propertyNumber: property.propertyNumber })} />
        </div>
      </section>

      {/* Related Properties Section (Max 3) — last section on page */}
      <RelatedPropertiesSection properties={displayedRelated} href={href} />
    </main>
  );
}

/**
 * Property title, rendered directly under the gallery.
 * Figma: Poppins / Medium (500) / 45px / line-height 25px / letter-spacing 0%.
 */
function PropertyTitle({ property }: { property: PropertyBuying }) {
  return (
    <header className="mt-8 lg:mt-10">
      <h1 className="text-[28px] font-medium leading-[32px] tracking-[0%] text-[#183c2f] lg:text-[45px] lg:leading-[25px]">
        {property.title}
      </h1>
    </header>
  );
}

function DescriptionSection({ text }: { text: string }) {
  const { t } = useI18n();

  return (
    <section>
      <SectionTitle>{t("buy.aboutProperty")}</SectionTitle>
      <p className="mt-5 whitespace-pre-line text-[14px] leading-[1.9] text-[#656566] lg:mt-7 lg:text-[16px] lg:leading-[23px]">
        {text || t("buy.noDescription")}
      </p>
    </section>
  );
}

function propertyTypeLabel(propertyTypeId: number, t: (key: string) => string) {
  const key = propertyTypeKeyById[propertyTypeId];
  return key ? t(key) : propertyTypeNames[propertyTypeId] || String(propertyTypeId);
}

/** "More Amenities" — every group with its own items, in a bordered card. */
function AmenitiesSection({ groups }: { groups: AmenityGroup[] }) {
  const { t } = useI18n();

  if (groups.length === 0) return null;

  return (
    <section className="mt-5 rounded-2xl border border-[#dfe8e4] bg-white px-5 pb-5 pt-3.5 shadow-[0_2px_12px_rgba(24,60,47,0.03)] sm:px-6 sm:pb-6 sm:pt-4">
      <div className="flex items-center gap-3">
        <Image src="/icons/amenities/amenities-title.svg" alt="" width={26} height={26} className="object-contain" />
        <SectionTitle>{t("buy.moreAmenities")}</SectionTitle>
      </div>
      <div className="mt-5 grid gap-6">
        {groups.map((section) => (
          <div key={section.categoryId}>
            <h3 className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#f5f7f6] px-3 text-[14px] font-semibold text-[#183c2f]">
              <DynamicAmenityIcon
                icon={section.categoryIcon}
                width={18}
                height={18}
                className="size-[18px] object-contain"
              />
              {section.categoryName}
            </h3>
            <ul className="mt-3 grid gap-x-4 gap-y-2.5 text-[14px] leading-5 text-[#556960] sm:grid-cols-2 lg:grid-cols-4">
              {section.items.map((item) => (
                <li key={item.itemId} className="flex items-center gap-2.5">
                  <DynamicAmenityIcon
                    icon={item.icon}
                    width={18}
                    height={18}
                    className="size-[18px] shrink-0 object-contain"
                  />
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Sidebar card — price, size, location and core specs. */
function PropertyInformationCard({
  property,
  priceLabel,
  selectedCurrency,
  onCurrencyChange,
}: {
  property: PropertyBuying;
  priceLabel: string;
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}) {
  const { t, locale } = useI18n();

  const locationText =
    [property.address?.area, property.address?.city, property.address?.country]
      .filter(Boolean)
      .join(", ") || t("buy.unknown");

  const typeLabel = propertyTypeLabel(property.propertyTypeId, t);
  const areaUnit = locale === "ar" ? "م²" : "m²";

  return (
    <article className="rounded-xl border border-[#dfe8e4] bg-white p-5">
      <h2 className="text-[15px] font-bold text-[#183c2f]">{t("buy.propertyInformation")}</h2>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[20px] font-bold leading-tight text-[#183c2f] lg:text-[24px]">{priceLabel}</p>
        <p className="text-[13px] text-[#667c74]">{property.area || 0} {areaUnit}</p>
      </div>

      <p className="mt-3 flex items-start gap-2 text-[12.5px] leading-5 text-[#667c74]">
        <Image
          src="/homepage/properties/icons/location.svg"
          alt=""
          width={16}
          height={16}
          className="mt-0.5 size-4 shrink-0"
        />
        <span className="min-w-0 break-words">{locationText}</span>
      </p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#eef2f0] pt-3">
        <SpecChip label={typeLabel} />
        <SpecChip
          label={`${property.bedrooms || 0} ${
            Number(property.bedrooms || 0) === 1 ? t("buy.bedroom") : t("buy.bedrooms")
          }`}
          icon="/homepage/properties/icons/bed.svg"
        />
        <SpecChip
          label={`${property.bathrooms || 0} ${
            Number(property.bathrooms || 0) === 1 ? t("buy.bathroom") : t("buy.bathrooms")
          }`}
          icon="/homepage/properties/icons/bath.svg"
        />
      </div>

      {/* HIDDEN FOR THIS VERSION: Currency converter select - uncomment to re-enable */}
      {/*
      <CurrencySelect
        value={selectedCurrency}
        onChange={onCurrencyChange}
        className="mt-4 w-full"
        selectClassName="h-10 w-full rounded-xl border border-[#dfe8e4] bg-white px-3 text-[13px] text-[#414847] outline-none transition focus:border-[#2C798B]"
      />
      */}
    </article>
  );
}

function SpecChip({ label, icon }: { label: string; icon?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-[#40544c]">
      {icon && (
        <Image src={icon} alt="" width={15} height={15} className="size-[15px] object-contain opacity-70" />
      )}
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}

/**
 * Sidebar "Basic Amenities" — the category titles from "More Amenities",
 * with their logos. Shares its source via `useGroupedAmenities`, so the two
 * can never disagree.
 */
function BasicAmenitiesCard({
  categories: amenityCategories,
}: {
  categories: Pick<AmenityGroup, "categoryId" | "categoryName" | "categoryIcon">[];
}) {
  const { t } = useI18n();

  if (amenityCategories.length === 0) return null;

  return (
    <article className="mt-6 rounded-xl border border-[#dfe8e4] bg-white p-5">
      <h2 className="text-[15px] font-bold text-[#183c2f]">{t("buy.basicAmenities")}</h2>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        {amenityCategories.map((cat) => (
          <span key={cat.categoryId} className="flex items-center gap-2 text-[12.5px] text-[#40544c]">
            <DynamicAmenityIcon
              icon={cat.categoryIcon}
              width={16}
              height={16}
              className="size-4 shrink-0 object-contain"
            />
            <span className="min-w-0 break-words">{cat.categoryName}</span>
          </span>
        ))}
      </div>
    </article>
  );
}


/**
 * Section headings ("About Property", "More Amenities") use the same type
 * scale as the property title.
 * Figma: Poppins / Medium (500) / 45px / line-height 25px / letter-spacing 0%.
 */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[18px] font-medium leading-[32px] tracking-[0%] text-[#183c2f] lg:text-[25px] lg:leading-[25px]">
      {children}
    </h2>
  );
}

function RelatedPropertiesSection({
  properties,
  href,
}: {
  properties: PropertyBuyingListItem[];
  href: (path: string) => string;
}) {
  const { t } = useI18n();
  if (properties.length === 0) return null;

  return (
    <section className="border-t border-[#e8eeea] bg-[#f8faf9] px-5 py-14 sm:px-8 lg:px-20 lg:py-20">
      <div className="mx-auto w-full max-w-[1282px]">
        <div className="mb-8 flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-start">
          <div>
            <h2 className="text-[24px] font-bold text-[#142d38] sm:text-[30px]">
              {t("buy.relatedHeadingPrefix")}<span className="text-[#3ca3b5]">{t("buy.relatedHeadingHighlight")}</span>
            </h2>
            <p className="mt-1 text-[13.5px] text-[#718288]">
              {t("buy.relatedSubtitle")}
            </p>
          </div>
          <Link
            href={href("/buy")}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#2C798B] px-5 py-2 text-[13px] font-semibold text-[#2C798B] transition hover:bg-[#2C798B] hover:text-white"
          >
            <span>{t("buy.viewAllProperties")}</span>
            <span className="rtl:rotate-180 inline-block">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((item) => (
            <RelatedPropertyCard
              key={item.id}
              property={item}
              url={href(`/buy/${slugify(item.title)}?id=${item.id}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedPropertyCard({
  property,
  url,
}: {
  property: PropertyBuyingListItem;
  url: string;
}) {
  const { t, locale } = useI18n();
  const image = resolveApiImageUrl(property.coverImageUrl) || "/rent/property-card.png";

  const location = [property.areaName?.trim(), property.city?.trim()]
    .filter(Boolean)
    .join(", ") || t("home.featured.locationMissing") || (locale === "ar" ? "الغردقة، مصر" : "Hurghada, Egypt");

  const typeKey = property.propertyTypeId ? propertyTypeKeyById[property.propertyTypeId] : undefined;
  const typeName = typeKey ? t(typeKey) : propertyTypeNames[property.propertyTypeId] || "Apartment";

  const formattedPrice = formatPriceInfo(
    property.priceInfo,
    property.price,
    property.priceInfo?.currency || property.currency || "USD"
  );

  const areaUnit = locale === "ar" ? "م²" : "m²";

  return (
    <article className="group flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)]">
      {/* Top Image + Badges */}
      <Link
        href={url}
        className="relative block aspect-[16/11] w-full overflow-hidden rounded-t-[20px] bg-[#e6edea]"
      >
        <Image
          src={image}
          alt={property.title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute end-3.5 top-3.5 flex items-center gap-1.5">
          {property.isFeatured && (
            <span className="inline-flex items-center rounded-full bg-[#183640]/85 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
              {t("home.featured.featured")}
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-[#3da5b6]/85 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
            {t("home.featured.forSaleBadge")}
          </span>
        </div>
      </Link>

      {/* Card Info */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link href={url} className="hover:underline">
          <h4 className="line-clamp-1 text-[17px] font-bold text-[#142d38] sm:text-[18px]">
            {property.title}
          </h4>
        </Link>

        {/* Location Row */}
        <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-[#718288]">
          <Image
            src="/homepage/properties/icons/location.svg"
            alt=""
            width={14}
            height={14}
            className="size-3.5 shrink-0"
          />
          <span className="line-clamp-1">{location}</span>
        </div>

        {/* Type & Size Row */}
        <div className="mt-2.5 flex items-center justify-between text-[13px] text-[#718288]">
          <span>{typeName}</span>
          <span>{property.area ? `${property.area} ${areaUnit}` : (locale === "ar" ? "غير محدد" : "N/A")}</span>
        </div>

        {/* Price & Beds/Baths Row */}
        <div className="mt-3 flex items-center justify-between pt-1">
          <span className="text-[17px] font-bold text-[#142d38] sm:text-[18px]">
            {formattedPrice}
          </span>
          <div className="flex items-center gap-3 text-[13px] text-[#718288]">
            <span className="flex items-center gap-1">
              <span>{property.bathrooms || 1}</span>
              <Image
                src="/homepage/properties/icons/bath.svg"
                alt=""
                width={15}
                height={15}
                className="size-[15px] opacity-70"
              />
            </span>
            <span className="flex items-center gap-1">
              <span>{property.bedrooms || 1}</span>
              <Image
                src="/homepage/properties/icons/bed.svg"
                alt=""
                width={15}
                height={15}
                className="size-[15px] opacity-70"
              />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
