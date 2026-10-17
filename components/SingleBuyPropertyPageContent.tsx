"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PropertyImageGallery from "./PropertyImageGallery";
import ScrollAnimation from "./ScrollAnimation";
import ContactForm from "./ContactForm";
import DynamicAmenityIcon from "./DynamicAmenityIcon";
import { usePublicPropertyBuyingById } from "@/lib/hooks/usePropertyBuying";
import { usePropertyBuyingCategories } from "@/lib/hooks/usePropertyBuyingCategory";
import { useGroupedAmenities, type AmenityGroup } from "@/lib/hooks/useGroupedAmenities";
import { useCurrencies } from "@/lib/hooks/useCurrency";
import { API_BASE_URL } from "@/lib/api/config";
import type { PropertyBuying, PropertyBuyingSection } from "@/lib/types/propertyBuying";
import type { PropertyBuyingCategory } from "@/lib/types/propertyBuyingCategory";
import { formatPriceForCurrency } from "@/lib/utils/currency";
import { useI18n } from "./I18nProvider";
import { useHeaderStore } from "@/lib/headerStore";
import { useEffect } from "react";
import CurrencySelect from "./CurrencySelect";
import { useSelectedCurrency } from "@/lib/hooks/useSelectedCurrency";


type QuickFact = {
  label: string;
  icon: string;
};

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

export default function SingleBuyPropertyPageContent({ id }: { id: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedCurrency, setSelectedCurrency] = useSelectedCurrency(searchParams.get("Currency"));
  const { data: property, isLoading } = usePublicPropertyBuyingById(id, locale, selectedCurrency);
  const { data: categories = [] } = usePropertyBuyingCategories(locale);
  const { data: currencies = [] } = useCurrencies({ isActive: true });
  const setPageEntity = useHeaderStore((state) => state.setPageEntity);

  useEffect(() => {
    setPageEntity(id, "buy");
    return () => setPageEntity(null, null);
  }, [id, setPageEntity]);

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

  const galleryImages = (property.images || []).sort((a, b) => a.displayOrder - b.displayOrder).map((img) => ({ src: `${API_BASE_URL}/${img.imageUrl}`, alt: property.title }));
  if (galleryImages.length === 0) galleryImages.push({ src: "/rent/property-card.png", alt: "Placeholder" });

  

  const { groups: amenityGroups, categories: amenityCategories } = useGroupedAmenities(
    property.categoryValues || [],
    categories,
    t("buy.features")
  );

  return (
    <main className="overflow-hidden bg-white font-[var(--font-poppins)] text-[#183c2f]">
      <section className="px-5 pb-12 pt-6 lg:px-20 lg:pb-4 lg:pt-10">
        <div className="mx-auto w-full max-w-[1282px]">
          <ScrollAnimation delay={0}>
            <PropertyHeader property={property} />
          </ScrollAnimation>

          <div className="mt-5 min-w-0 lg:mt-6">
            <ScrollAnimation delay={0} className="min-w-0">
              <PropertyImageGallery
                images={galleryImages}
                variant="mosaic"
                className="mx-auto max-w-[1180px]"
              />
            </ScrollAnimation>
          </div>

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
    </main>
  );
}

function PropertyHeader({ property }: { property: PropertyBuying }) {
  return (
    <header>
      <h1 className="text-[26px] font-bold leading-tight text-[#183c2f] lg:text-[40px] lg:leading-[1.15]">
        {property.title}
      </h1>
      <p className="mt-2.5 flex items-center gap-1.5 text-[12px] leading-6 text-[#8a9a94] lg:text-[15px]">
        <Image src="/homepage/properties/icons/location.svg" alt="" width={24} height={24} className="size-6" />
        <span className="truncate">
          {[property.address?.street, property.address?.area, property.address?.city, property.address?.country]
            .filter(Boolean)
            .join(", ")}
        </span>
      </p>
    </header>
  );
}

function DescriptionSection({ text }: { text: string }) {
  const { t } = useI18n();

  return (
    <section>
      <SectionTitle>{t("buy.aboutProperty")}</SectionTitle>
      <p className="mt-[15px] whitespace-pre-line text-[14px] leading-[1.9] text-[#656566] lg:text-[16px] lg:leading-[23px]">
        {text || t("buy.noDescription")}
      </p>
    </section>
  );
}

function propertyTypeLabel(propertyTypeId: number) {
  return propertyTypeNames[propertyTypeId] || String(propertyTypeId);
}

/** "More Amenities" — every group with its own items, in a bordered card. */
function AmenitiesSection({ groups }: { groups: AmenityGroup[] }) {
  const { t } = useI18n();

  if (groups.length === 0) return null;

  return (
    <section className="mt-7 rounded-2xl border border-[#dfe8e4] bg-white p-5 shadow-[0_2px_12px_rgba(24,60,47,0.03)] sm:p-6">
      <div className="flex items-center gap-2">
        <Image src="/icons/amenities/amenities-title.svg" alt="" width={22} height={22} className="object-contain" />
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
  const { t } = useI18n();

  const locationText =
    [property.address?.area, property.address?.city, property.address?.country]
      .filter(Boolean)
      .join(", ") || t("buy.unknown");

  const typeLabel = propertyTypeLabel(property.propertyTypeId);

  return (
    <article className="rounded-xl border border-[#dfe8e4] bg-white p-5">
      <h2 className="text-[15px] font-bold text-[#183c2f]">{t("buy.propertyInformation")}</h2>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[20px] font-bold leading-tight text-[#183c2f] lg:text-[24px]">{priceLabel}</p>
        <p className="text-[13px] text-[#667c74]">{property.area || 0} m²</p>
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

      <CurrencySelect
        value={selectedCurrency}
        onChange={onCurrencyChange}
        className="mt-4 w-full"
        selectClassName="h-10 w-full rounded-xl border border-[#dfe8e4] bg-white px-3 text-[13px] text-[#414847] outline-none transition focus:border-[#2C798B]"
      />
    </article>
  );
}

function SpecChip({ label, icon }: { label: string; icon?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-[#40544c]">
      {icon ? (
        <Image src={icon} alt="" width={15} height={15} className="size-[15px] object-contain opacity-70" />
      ) : (
        <span className="size-[15px] rounded-[3px] border border-[#9aa8a3]" />
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


function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[20px] font-semibold leading-7 text-[#101d28]">{children}</h2>;
}
