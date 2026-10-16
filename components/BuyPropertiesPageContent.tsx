"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { usePublicBuyProperties } from "@/lib/hooks/usePropertyBuying";
import { slugify } from "@/lib/utils/slugify";
import { API_BASE_URL } from "@/lib/api/config";
import { formatPriceInfo } from "@/lib/utils/currency";
import { useI18n } from "./I18nProvider";
import { PropertyType } from "@/lib/types/property";
import type { PropertyBuyingListItem } from "@/lib/types/propertyBuying";
import { useSelectedCurrency } from "@/lib/hooks/useSelectedCurrency";
import { useCategories } from "@/lib/hooks/useCategory";

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

export default function BuyPropertiesPageContent() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2C798B] border-t-transparent" />
        </div>
      }
    >
      <BuyPropertiesPageInner />
    </Suspense>
  );
}

function BuyPropertiesPageInner() {
  const { href, t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsObj = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const [selectedCurrency, setSelectedCurrency] = useSelectedCurrency(paramsObj.Currency);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const searchTerm = paramsObj.search || paramsObj.SearchTerm || "";
  const propertyTypeId = paramsObj.propertyTypeId ? Number(paramsObj.propertyTypeId) : undefined;
  const minPrice = paramsObj.minPrice ? Number(paramsObj.minPrice) : undefined;
  const maxPrice = paramsObj.maxPrice ? Number(paramsObj.maxPrice) : undefined;
  const bedrooms = paramsObj.bedrooms ? Number(paramsObj.bedrooms) : undefined;

  const { data, isLoading, isError } = usePublicBuyProperties({
    pageSize: 100,
    search: searchTerm || undefined,
    propertyTypeId,
    Currency: selectedCurrency,
  });

  const handleCurrencyChange = (nextCurrency: string) => {
    const normalizedCurrency = nextCurrency.toUpperCase();
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("Currency", normalizedCurrency);
    setSelectedCurrency(normalizedCurrency);
    router.push(href(`/buy?${nextParams.toString()}`));
  };

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newParams = new URLSearchParams();

    const searchVal = (formData.get("searchTerm") as string)?.trim();
    const propertyTypeVal = formData.get("propertyType") as string;
    const roomsVal = formData.get("rooms") as string;
    const minPriceVal = formData.get("minPrice") as string;
    const maxPriceVal = formData.get("maxPrice") as string;

    if (searchVal) newParams.set("search", searchVal);
    if (propertyTypeVal) newParams.set("propertyTypeId", propertyTypeVal);
    if (roomsVal) newParams.set("bedrooms", roomsVal);
    if (minPriceVal) newParams.set("minPrice", minPriceVal);
    if (maxPriceVal) newParams.set("maxPrice", maxPriceVal);
    if (selectedCurrency) newParams.set("Currency", selectedCurrency);

    router.push(href(`/buy?${newParams.toString()}`));
    setMobileFiltersOpen(false);
  };

  // Client-side filtering for min/max price & bedrooms
  const filteredList = useMemo(() => {
    let items = [...(data?.items ?? [])];

    if (minPrice !== undefined && !Number.isNaN(minPrice)) {
      items = items.filter((item) => (item.price ?? 0) >= minPrice);
    }
    if (maxPrice !== undefined && !Number.isNaN(maxPrice)) {
      items = items.filter((item) => (item.price ?? 0) <= maxPrice);
    }
    if (bedrooms !== undefined && !Number.isNaN(bedrooms)) {
      items = items.filter((item) => (item.bedrooms ?? 0) >= bedrooms);
    }

    return items.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }, [data?.items, minPrice, maxPrice, bedrooms]);

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-[#fdecea]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b00020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-[20px] font-semibold text-[#183c2f]">Unable to load properties</h2>
        <p className="max-w-[360px] text-[14px] text-[#656566]">
          We couldn&apos;t fetch the listings right now. Please check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 rounded-full bg-[#2C798B] px-6 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#183640] active:scale-95"
        >
          {t("buy.tryAgain")}
        </button>
      </div>
    );
  }

  return (
    <main className="bg-[#fbfbf9] font-[var(--font-poppins)] text-[#183c2f]">
      {/* Hero Section with exact background & live text */}
      <BuyPropertiesHero />

      {/* Main Content Layout */}
      <div className="mx-auto max-w-[1536px] px-4 pb-24 sm:px-6 lg:px-10">
        <ListingHeading />

        {/* Mobile filter button */}
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-[#d5dedb] bg-white px-4 py-2 text-[13px] font-semibold text-[#142d38] shadow-xs"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
            </svg>
            Filters
          </button>
        </div>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8 xl:gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:sticky lg:top-8 lg:block lg:w-[310px] lg:shrink-0">
            <BuyFilterForm paramsObj={paramsObj} onSubmit={handleFilterSubmit} />
          </aside>

          {/* Property grid */}
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="h-[380px] animate-pulse rounded-[20px] bg-white shadow-xs" />
                ))}
              </div>
            ) : filteredList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d8e0dd] bg-white py-20 text-center">
                <p className="text-[18px] font-semibold text-[#183c2f]">{t("buy.emptyTitle")}</p>
                <p className="mt-2 text-[14px] text-[#656566]">{t("buy.emptyBody")}</p>
              </div>
            ) : (
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
                }}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
              >
                {filteredList.map((property) => (
                  <BuyPropertyCard
                    key={property.id}
                    property={property}
                    selectedCurrency={selectedCurrency}
                    url={href(`/buy/${slugify(property.title)}?id=${property.id}&Currency=${selectedCurrency}`)}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function BuyPropertiesHero() {
  return (
    <section className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6">
      <div className="relative h-[280px] sm:h-[360px] md:h-[420px] lg:h-[480px] w-full overflow-hidden rounded-[20px] sm:rounded-[28px] shadow-sm">
        <Image
          src="/rent/rent-hero-bg.png"
          alt="Discover Properties for Sale in Hurghada"
          fill
          priority
          sizes="(max-width: 1536px) 100vw, 1536px"
          className="object-cover object-center"
        />
        {/* Soft vignette gradient for high contrast readability matching reference */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-transparent flex items-center">
          <div className="px-6 sm:px-12 lg:px-16 max-w-2xl">
            <h1 className="text-[28px] sm:text-[42px] lg:text-[52px] font-extrabold leading-[1.12] text-white tracking-tight drop-shadow-xs">
              Discover<br />
              Properties for<br />
              Sale in Hurghada
            </h1>
            <p className="mt-3 sm:mt-4 max-w-[440px] text-[13.5px] sm:text-[15.5px] leading-relaxed text-white/95 font-medium drop-shadow-xs">
              Explore exceptional homes and investment opportunities in one of Egypt&apos;s most attractive Red Sea destinations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ListingHeading() {
  return (
    <div className="pt-8 sm:pt-12 pb-3 text-center">
      <h2 className="text-[26px] sm:text-[32px] lg:text-[38px] font-bold tracking-tight text-[#142d38]">
        Featured Buy <span className="text-[#3ca3b5]">Properties</span>
      </h2>
      <div className="mx-auto mt-2 h-[3px] w-[86px] rounded-full bg-[#2C798B]" />
    </div>
  );
}

function BuyFilterForm({
  paramsObj,
  onSubmit,
}: {
  paramsObj: Record<string, string>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const { href } = useI18n();
  const { data: categories } = useCategories();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const searchVal = paramsObj.search || paramsObj.SearchTerm || "";
  const propertyTypeVal = paramsObj.propertyTypeId || "";
  const roomsVal = paramsObj.bedrooms || "";
  const minPriceVal = paramsObj.minPrice || "";
  const maxPriceVal = paramsObj.maxPrice || "";

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[#e2e8e6] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      {/* Search Input at Top */}
      <div>
        <input
          type="text"
          name="searchTerm"
          defaultValue={searchVal}
          placeholder="Search"
          className="w-full rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] px-3.5 py-2.5 text-[13px] text-[#142d38] placeholder-[#8a9a94] outline-none transition focus:border-[#2C798B] focus:bg-white"
        />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {/* DATES OF STAY / FILTER CRITERIA Box */}
        <div className="rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#718288]">
              DATES OF STAY
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-[#718288]">Check-In Date</span>
              <input
                type="date"
                name="from"
                className="w-full rounded-lg border border-[#e2e8e6] bg-white px-3 py-1.5 text-[12px] text-[#142d38] outline-none focus:border-[#2C798B]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-[#718288]">Check-Out Date</span>
              <input
                type="date"
                name="to"
                className="w-full rounded-lg border border-[#e2e8e6] bg-white px-3 py-1.5 text-[12px] text-[#142d38] outline-none focus:border-[#2C798B]"
              />
            </label>
          </div>
        </div>

        {/* Property Type row with For Rent pill */}
        <div>
          <span className="mb-1.5 block text-[11.5px] font-semibold text-[#656566]">Property Type</span>
          <div className="flex items-center gap-2">
            <select
              name="propertyType"
              defaultValue={propertyTypeVal}
              className="flex-1 rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] px-3 py-2 text-[12.5px] text-[#142d38] outline-none focus:border-[#2C798B]"
            >
              <option value="">All Types</option>
              <option value={PropertyType.Villa}>Villa</option>
              <option value={PropertyType.Apartment}>Apartment</option>
              <option value={PropertyType.Studio}>Studio</option>
              <option value={PropertyType.Chalet}>Chalet</option>
              <option value={PropertyType.TwinHouse}>Twin House</option>
            </select>
            <span className="shrink-0 rounded-full border border-[#d5dedb] px-3 py-1.5 text-[11.5px] font-medium text-[#183640]">
              For Rent
            </span>
          </div>
        </div>

        {/* Location row with For Sale pill */}
        <div>
          <span className="mb-1.5 block text-[11.5px] font-semibold text-[#656566]">Location</span>
          <div className="flex items-center gap-2">
            <select
              name="city"
              className="flex-1 rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] px-3 py-2 text-[12.5px] text-[#142d38] outline-none focus:border-[#2C798B]"
            >
              <option value="">All Locations</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <Link
              href={href("/buy")}
              className="shrink-0 rounded-full border border-[#d5dedb] px-3 py-1.5 text-[11.5px] font-medium text-[#183640] transition hover:border-[#2C798B] hover:bg-[#2C798B] hover:text-white"
            >
              For Sale
            </Link>
          </div>
        </div>

        {/* Rooms row with All pill */}
        <div>
          <span className="mb-1.5 block text-[11.5px] font-semibold text-[#656566]">Rooms</span>
          <div className="flex items-center gap-2">
            <select
              name="rooms"
              defaultValue={roomsVal}
              className="flex-1 rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] px-3 py-2 text-[12.5px] text-[#142d38] outline-none focus:border-[#2C798B]"
            >
              <option value="">All</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4+</option>
            </select>
            <span className="shrink-0 rounded-full border border-[#d5dedb] px-4 py-1.5 text-[11.5px] font-medium text-[#183640]">
              All
            </span>
          </div>
        </div>

        {/* Min Price / Max Price + Search Button */}
        <div>
          <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
            <div>
              <span className="mb-1 block text-[11px] font-semibold text-[#656566]">Min Price</span>
              <input
                type="number"
                name="minPrice"
                defaultValue={minPriceVal}
                placeholder="0.0 EG"
                min="0"
                className="w-full rounded-lg border border-[#e2e8e6] bg-[#fbfdfc] px-2.5 py-1.5 text-[12px] text-[#142d38] outline-none focus:border-[#2C798B]"
              />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-semibold text-[#656566]">Max Price</span>
              <input
                type="number"
                name="maxPrice"
                defaultValue={maxPriceVal}
                placeholder="0.0 EG"
                min="0"
                className="w-full rounded-lg border border-[#e2e8e6] bg-[#fbfdfc] px-2.5 py-1.5 text-[12px] text-[#142d38] outline-none focus:border-[#2C798B]"
              />
            </div>
            <button
              type="submit"
              className="h-[34px] shrink-0 rounded-lg bg-[#71a8b7] px-3.5 text-[12.5px] font-semibold text-white shadow-xs transition hover:bg-[#5b95a4]"
            >
              Search
            </button>
          </div>
        </div>

        {/* Advanced Accordion Toggle */}
        <div className="border-t border-[#f0f0f0] pt-2">
          <button
            type="button"
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex w-full items-center justify-between py-1.5 text-[12px] font-medium text-[#718288] hover:text-[#183640]"
          >
            <span className="flex items-center gap-1.5">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
              </svg>
              Advanced
            </span>
            <svg className={`size-3.5 transition-transform duration-200 ${advancedOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {advancedOpen && (
            <div className="mt-2 flex flex-col gap-2 pt-2">
              {["Available Now", "Sea View", "Pool View", "Garden View", "Mountain View"].map((label) => (
                <label key={label} className="flex cursor-pointer items-center gap-2 text-[12.5px] text-[#414847]">
                  <input
                    type="checkbox"
                    className="size-3.5 rounded border-[#d0d0d0] accent-[#2C798B]"
                  />
                  {label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

function BuyPropertyCard({
  property,
  url,
  selectedCurrency,
}: {
  property: PropertyBuyingListItem;
  url: string;
  selectedCurrency: string;
}) {
  const { href } = useI18n();
  const image = property.coverImageUrl
    ? `${API_BASE_URL}/${property.coverImageUrl}`
    : "/rent/property-card.png";

  const location = [property.areaName?.trim(), property.city?.trim()]
    .filter(Boolean)
    .join(", ") || "Hurghada, Egypt";

  const typeName = propertyTypeNames[property.propertyTypeId] || "Apartment";

  const formattedPrice = formatPriceInfo(
    property.priceInfo,
    property.price,
    property.priceInfo?.currency || selectedCurrency || property.currency || "USD"
  );

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="group flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
    >
      {/* Top Image + For Sale badge */}
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
        <span className="absolute right-3.5 top-3.5 inline-flex items-center justify-center rounded-full bg-[#3da5b6]/85 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
          For Sale
        </span>
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
          <span>{property.area ? `${property.area} m²` : "N/A"}</span>
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

        {/* Action Button */}
        <Link
          href={url}
          className="mt-4 flex h-9 sm:h-10 w-full items-center justify-center rounded-lg bg-[#71a8b7] text-[13.5px] sm:text-[14px] font-semibold text-white shadow-xs transition hover:bg-[#5b95a4]"
        >
          View Details
        </Link>
      </div>
    </motion.article>
  );
}
