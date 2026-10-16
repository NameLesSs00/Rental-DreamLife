"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useProperties } from "@/lib/hooks/useProperties";
import { useCurrencies } from "@/lib/hooks/useCurrency";
import { API_BASE_URL } from "@/lib/api/config";
import { PropertyListItem } from "@/lib/types/property";
import type { Currency } from "@/lib/types/currency";
import { slugify } from "@/lib/utils/slugify";
import { formatPriceForCurrency } from "@/lib/utils/currency";
import { useSelectedCurrency } from "@/lib/hooks/useSelectedCurrency";
import { useI18n } from "./I18nProvider";

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

export default function FeaturedPropertiesSection() {
  const [currency] = useSelectedCurrency();
  const { t, href } = useI18n();
  const { data: currencies = [] } = useCurrencies({ isActive: true });

  const { data: response, isLoading } = useProperties({
    pageNumber: 1,
    pageSize: 12,
    Currency: currency,
  });

  const allProperties: PropertyListItem[] = response?.items || [];
  const featured = allProperties.filter((p) => p.isFeatured);
  const properties = (featured.length >= 3 ? featured : allProperties).slice(0, 3);

  return (
    <section className="relative z-20 flex w-full flex-col items-center bg-[#8FBAC4] px-4 pt-28 pb-16 font-[var(--font-poppins)] sm:px-6 sm:pt-32 sm:pb-20 lg:px-10 lg:pt-36">
      <div className="mx-auto w-full max-w-[1280px] rounded-[24px] bg-[#f3efe6] p-6 shadow-sm sm:p-8 lg:p-10">
        {/* Section Heading: Centered teal title with side lines */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 sm:gap-4"
        >
          <span className="h-[2.5px] w-8 sm:w-12 rounded-full bg-[#2C798B]" />
          <h2 className="text-[22px] font-bold tracking-tight text-[#2C798B] sm:text-[28px] lg:text-[34px]">
            Best rental Properties
          </h2>
          <span className="h-[2.5px] w-8 sm:w-12 rounded-full bg-[#2C798B]" />
        </motion.div>

        {/* Content layout: Left text column + Right 3 cards */}
        <div className="mt-10 flex flex-col items-stretch gap-8 sm:mt-14 xl:flex-row lg:gap-10 xl:gap-12">
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="flex w-full flex-col justify-between self-stretch xl:w-[280px] xl:shrink-0"
          >
            <div>
              <h3 className="text-[32px] font-extrabold leading-[1.12] tracking-tight text-[#142d38] sm:text-[38px] lg:text-[42px]">
                Find Your Next Home
              </h3>
              <p className="mt-4 text-[14px] leading-relaxed text-[#51646b] sm:text-[15px]">
                Explore the most popular villas and apartments for renting in Hurghada and the RedSea. Choose from a selection of highly rated properties.
              </p>
            </div>

            <div className="pt-2 mt-8 xl:mt-auto">
              <Link
                href={href("/rent")}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#183640] px-7 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#11262d] sm:h-12 sm:px-8 sm:text-[15px]"
              >
                {t("home.featured.viewMore") || "View more"}
              </Link>
            </div>
          </motion.div>

          {/* Right Cards Grid */}
          <div className="w-full min-w-0 flex-1">
            {isLoading ? (
              <div className="flex h-[380px] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2C798B] border-t-transparent" />
              </div>
            ) : properties.length === 0 ? (
              <div className="flex h-[320px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#d3cdc5] bg-white/50 text-center text-[15px] text-[#718288]">
                <p className="font-semibold text-[#183640]">
                  {t("home.featured.noDeals") || "No properties available right now"}
                </p>
                <p className="text-[13px] text-[#86979d]">
                  {t("home.featured.noDealsHint") || "Please check back soon for newly listed properties"}
                </p>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
                }}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    currency={currency}
                    currencies={currencies}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PropertyCard({
  property,
  currency,
  currencies,
}: {
  property: PropertyListItem;
  currency: string;
  currencies: Currency[];
}) {
  const { t, href } = useI18n();
  const propertyWithSize = property as PropertyListItem & {
    size?: number | null;
    area?: number | null;
  };

  const imageUrl = property.coverImageUrl
    ? property.coverImageUrl.startsWith("http")
      ? property.coverImageUrl
      : `${API_BASE_URL}/${property.coverImageUrl}`
    : "/rent/property-card.png";

  const location = property.city
    ? property.country
      ? `${property.city}, ${property.country}`
      : property.city
    : property.country || t("home.featured.locationMissing") || "Hurghada";

  const detailParams = new URLSearchParams({
    id: property.id,
    Currency: property.basePriceInfo?.currency || currency,
  });
  const detailUrl = href(`/rent/${slugify(property.name)}?${detailParams.toString()}`);

  const priceLabel = formatPriceForCurrency(
    property.basePriceInfo,
    property.basePrice,
    currency,
    currencies
  );

  const sizeLabel =
    typeof propertyWithSize.size === "number" && propertyWithSize.size > 0
      ? `${propertyWithSize.size} m²`
      : typeof propertyWithSize.area === "number" && propertyWithSize.area > 0
        ? `${propertyWithSize.area} m²`
        : property.capacity
          ? `${property.capacity * 35} m²`
          : "140 m²";

  const typeName =
    property.propertyTypeName ||
    (property.propertyType ? propertyTypeNames[property.propertyType] : "Apartment") ||
    "Apartment";

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="group flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
    >
      {/* Top Image + For Rent badge */}
      <Link
        href={detailUrl}
        className="relative block aspect-[16/11] w-full overflow-hidden rounded-t-[20px] bg-[#e6edea]"
      >
        <Image
          src={imageUrl}
          alt={property.name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3.5 top-3.5 inline-flex items-center justify-center rounded-full bg-[#3da5b6]/85 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
          For Rent
        </span>
      </Link>

      {/* Card Info */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link href={detailUrl} className="hover:underline">
          <h4 className="line-clamp-1 text-[17px] font-bold text-[#142d38] sm:text-[18px]">
            {property.name}
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
          <span>{sizeLabel}</span>
        </div>

        {/* Price & Beds/Baths Row */}
        <div className="mt-3 flex items-center justify-between pt-1">
          <span className="text-[17px] font-bold text-[#142d38] sm:text-[18px]">
            {priceLabel}
          </span>
          <div className="flex items-center gap-3 text-[13px] text-[#718288]">
            <span className="flex items-center gap-1">
              <span>{property.bathroomNo || 1}</span>
              <Image
                src="/homepage/properties/icons/bath.svg"
                alt=""
                width={15}
                height={15}
                className="size-[15px] opacity-70"
              />
            </span>
            <span className="flex items-center gap-1">
              <span>{property.bedroomNo || 1}</span>
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

        {/* Action Button */}
        <Link
          href={detailUrl}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-[#6ea2b0] text-[14px] font-semibold text-white shadow-xs transition hover:bg-[#588e9c]"
        >
          {t("common.bookNow") || "Book Now"}
        </Link>
      </div>
    </motion.article>
  );
}
