"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useMemo, useState, useTransition, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePublicBuyProperties } from "@/lib/hooks/usePropertyBuying";
import { slugify } from "@/lib/utils/slugify";
import { API_BASE_URL } from "@/lib/api/config";
import { formatPriceInfo } from "@/lib/utils/currency";
import { useI18n } from "./I18nProvider";
import { PropertyType } from "@/lib/types/property";
import type { PropertyBuyingListItem } from "@/lib/types/propertyBuying";
import { useSelectedCurrency } from "@/lib/hooks/useSelectedCurrency";
import PageHero from "@/components/PageHero";

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
  const { href, t, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsObj = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const [selectedCurrency] = useSelectedCurrency(paramsObj.Currency);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const searchTerm = paramsObj.search || paramsObj.SearchTerm || "";
  const minPrice = paramsObj.minPrice ? Number(paramsObj.minPrice) : undefined;
  const maxPrice = paramsObj.maxPrice ? Number(paramsObj.maxPrice) : undefined;
  const bedrooms = paramsObj.bedrooms ? Number(paramsObj.bedrooms) : undefined;
  const bathrooms = paramsObj.bathrooms ? Number(paramsObj.bathrooms) : undefined;
  const isFeatured =
    paramsObj.isFeatured === "true"
      ? true
      : paramsObj.isFeatured === "false"
      ? false
      : undefined;

  const { data, isLoading, isError } = usePublicBuyProperties(
    {
      pageSize: 100,
      search: searchTerm || undefined,
      bedrooms,
      bathrooms,
      minPrice,
      maxPrice,
      isFeatured,
      Currency: selectedCurrency,
    },
    locale
  );

  const [isPending, startTransition] = useTransition();

  /**
   * Single source of truth for applying a filter change. Updates smoothly
   * in-place without page reload or scrolling to the top.
   */
  const navigate = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete("page");
    const qs = next.toString();
    const nextUrl = href(`/buy${qs ? `?${qs}` : ""}`);

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
    setMobileFiltersOpen(false);
  };

  const clearAllFilters = () => {
    const next = new URLSearchParams();
    if (paramsObj.Currency) {
      next.set("Currency", paramsObj.Currency);
    }
    const qs = next.toString();
    const nextUrl = href(`/buy${qs ? `?${qs}` : ""}`);

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
    setMobileFiltersOpen(false);
  };

  // Client-side fallback filtering for min/max price, bedrooms, bathrooms & isFeatured
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
    if (bathrooms !== undefined && !Number.isNaN(bathrooms)) {
      items = items.filter((item) => (item.bathrooms ?? 0) >= bathrooms);
    }
    if (isFeatured !== undefined) {
      items = items.filter((item) => item.isFeatured === isFeatured);
    }

    return items.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }, [data?.items, minPrice, maxPrice, bedrooms, bathrooms, isFeatured]);

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
    <main className="min-h-screen bg-[#F3F0E9] font-[var(--font-poppins)] text-[#183c2f]">
      {/* Hero Section with exact background & live text */}
      {/* 1. Hero Section: Unified PageHero with identical spacing and height */}
      <PageHero
        imageSrc="/buy/buy-hero-bg.jpg"
        imageAlt="Discover Properties for Sale in Hurghada"
        title={
          <>
            Discover Properties<br />
            for Sale
          </>
        }
        subtitle="Explore exceptional homes and investment opportunities in one of Egypt's most attractive Red Sea destinations."

        maxTitleWidth="max-w-[640px]"
        maxSubtitleWidth="max-w-[560px]"
        priority
      />

      {/* Main Content Layout */}
      {/* Main Content Layout aligned with max-w-[1536px] matching About and Contact */}
      <div className="mx-auto w-full max-w-[1536px] px-4 pb-24 sm:px-6 sm:pb-28 lg:px-10">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mt-8 mb-6 flex items-center gap-1.5 text-[14px] font-semibold text-[#142d38]"
        >
          <Link href={href("/")} className="hover:underline">
            {t("common.home") || "Home"}
          </Link>
          <span className="text-[#8a9a94]">/</span>
          <span className="text-[#718288]">{t("nav.items.buy") || "Buy"}</span>
        </nav>
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

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <motion.div
              className="fixed inset-0 z-[90] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                type="button"
                aria-label={t("rent.closeFilters") || "Close filters"}
                onClick={() => setMobileFiltersOpen(false)}
                className="absolute inset-0 bg-black/40"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-y-0 left-0 flex w-full max-w-[340px] flex-col bg-white shadow-2xl"
              >
                <div className="flex shrink-0 items-center justify-between border-b border-[#f0f0f0] px-5 py-4">
                  <h2 className="text-[18px] font-bold text-[#183640]">
                    {t("rent.filters") || "Filters"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label={t("rent.closeFilters") || "Close filters"}
                    className="grid size-8 place-items-center rounded-full text-[#656566] transition hover:bg-[#f5f5f5]"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M1 1l12 12M13 1L1 13" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <BuyFilterForm paramsObj={paramsObj} navigate={navigate} onClear={clearAllFilters} />
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8 xl:gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:sticky lg:top-8 lg:block lg:w-[340px] lg:shrink-0">
            <BuyFilterForm paramsObj={paramsObj} navigate={navigate} onClear={clearAllFilters} />
          </aside>

          {/* Property grid */}
          <div className="min-w-0 flex-1">
            {(isLoading || isPending) && filteredList.length === 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              <div className="relative">
                {(isLoading || isPending) && (
                  <div className="absolute top-2 right-2 z-20 flex items-center gap-2 rounded-full border border-[#2C798B]/20 bg-white/95 px-3 py-1.5 text-[12px] font-medium text-[#2C798B] shadow-md backdrop-blur-xs">
                    <span className="size-3 animate-spin rounded-full border-2 border-[#2C798B] border-t-transparent" />
                    <span>{t("common.loading") || "Loading..."}</span>
                  </div>
                )}
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
                }}
                initial="hidden"
                animate="visible"
                className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ${isLoading || isPending ? "opacity-60 pointer-events-none" : ""}`}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
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
  navigate,
  onClear,
}: {
  paramsObj: Record<string, string>;
  navigate: (patch: Record<string, string>) => void;
  onClear?: () => void;
}) {
  const { t } = useI18n();

  const searchVal = paramsObj.search || paramsObj.SearchTerm || "";
  const roomsVal = paramsObj.bedrooms || "";
  const bathroomsVal = paramsObj.bathrooms || "";
  const minPriceVal = paramsObj.minPrice || "";
  const maxPriceVal = paramsObj.maxPrice || "";
  const isFeaturedVal = paramsObj.isFeatured === "true";

  const hasActiveFilters = Boolean(
    searchVal || roomsVal || bathroomsVal || minPriceVal || maxPriceVal || isFeaturedVal
  );

  const labelCls = "mb-1.5 block text-[11.5px] font-semibold text-[#656566]";

  const [localRooms, setLocalRooms] = useState(roomsVal);
  const [localBaths, setLocalBaths] = useState(bathroomsVal);
  const [localMinPrice, setLocalMinPrice] = useState(minPriceVal);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceVal);

  useEffect(() => {
    setLocalRooms(roomsVal);
    setLocalBaths(bathroomsVal);
    setLocalMinPrice(minPriceVal);
    setLocalMaxPrice(maxPriceVal);
  }, [roomsVal, bathroomsVal, minPriceVal, maxPriceVal]);

  const debouncerRef = useRef<NodeJS.Timeout | null>(null);
  const handleDebouncedChange = (patch: Record<string, string>) => {
    if (patch.bedrooms !== undefined) setLocalRooms(patch.bedrooms);
    if (patch.bathrooms !== undefined) setLocalBaths(patch.bathrooms);
    if (patch.minPrice !== undefined) setLocalMinPrice(patch.minPrice);
    if (patch.maxPrice !== undefined) setLocalMaxPrice(patch.maxPrice);

    if (debouncerRef.current) clearTimeout(debouncerRef.current);
    debouncerRef.current = setTimeout(() => {
      navigate(patch);
    }, 350);
  };

  return (
    <div className="rounded-2xl border border-[#e2e8e6] bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between border-b border-[#f0f4f2] pb-3">
        <h3 className="text-[15px] font-bold text-[#142d38]">{t("rent.filters") || "Filters"}</h3>
        {hasActiveFilters && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-[12px] font-medium text-[#2C798B] transition hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* 1. Search */}
        <div>
          <span className={labelCls}>{t("rent.searchPlaceholder") || "Search"}</span>
          <input
            type="text"
            defaultValue={searchVal}
            key={searchVal}
            onBlur={(e) => navigate({ search: e.target.value.trim() })}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate({ search: (e.target as HTMLInputElement).value.trim() });
            }}
            placeholder={t("rent.searchPlaceholder") || "Search properties"}
            className="w-full rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] px-3.5 py-2.5 text-[13px] text-[#183640] outline-none transition placeholder-[#8a9a94] focus:border-[#2C798B] focus:bg-white"
          />
        </div>

        {/* 2. Bedrooms */}
        <div>
          <label htmlFor="buy-bedrooms" className={labelCls}>
            {t("buy.bedrooms") || "Bedrooms"}
          </label>
          <input
            id="buy-bedrooms"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={localRooms}
            onChange={(e) => handleDebouncedChange({ bedrooms: e.target.value })}
            placeholder="e.g. 2"
            className="w-full rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] px-3 py-2 text-[12.5px] text-[#183640] outline-none transition focus:border-[#2C798B]"
          />
        </div>

        {/* 3. Bathrooms */}
        <div>
          <label htmlFor="buy-bathrooms" className={labelCls}>
            {t("buy.bathrooms") || "Bathrooms"}
          </label>
          <input
            id="buy-bathrooms"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={localBaths}
            onChange={(e) => handleDebouncedChange({ bathrooms: e.target.value })}
            placeholder="e.g. 1"
            className="w-full rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] px-3 py-2 text-[12.5px] text-[#183640] outline-none transition focus:border-[#2C798B]"
          />
        </div>

        {/* 4 & 5. Price (USD) — minPrice & maxPrice */}
        <div>
          <div className="grid grid-cols-2 items-end gap-2">
            <div>
              <span className={labelCls}>{t("rent.minPrice") || "Min Price"}</span>
              <input
                type="number"
                value={localMinPrice}
                onChange={(e) => handleDebouncedChange({ minPrice: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full rounded-lg border border-[#e2e8e6] bg-[#fbfdfc] px-2.5 py-1.5 text-[12px] text-[#142d38] outline-none focus:border-[#2C798B]"
              />
            </div>
            <div>
              <span className={labelCls}>{t("rent.maxPrice") || "Max Price"}</span>
              <input
                type="number"
                value={localMaxPrice}
                onChange={(e) => handleDebouncedChange({ maxPrice: e.target.value })}
                placeholder="No limit"
                min="0"
                className="w-full rounded-lg border border-[#e2e8e6] bg-[#fbfdfc] px-2.5 py-1.5 text-[12px] text-[#142d38] outline-none focus:border-[#2C798B]"
              />
            </div>
          </div>
          <p className="mt-1.5 text-[11px] text-[#8a9a94]">USD</p>
        </div>

        {/* 6. Featured Only (isFeatured) */}
        <div className="pt-1">
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] px-3 py-2.5 transition hover:bg-[#f2f7f5]">
            <span className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#142d38]">Featured Only</span>
              <span className="text-[11px] text-[#8a9a94]">Show featured properties first</span>
            </span>
            <input
              type="checkbox"
              checked={isFeaturedVal}
              onChange={(e) => navigate({ isFeatured: e.target.checked ? "true" : "" })}
              className="size-4.5 rounded text-[#2C798B] accent-[#2C798B] focus:ring-[#2C798B]"
            />
          </label>
        </div>
      </div>
    </div>
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
  const {} = useI18n();
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
        <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5">
          {property.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#183640]/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs backdrop-blur-xs">
            Featured
            </span>
          )}
          <span className="inline-flex items-center justify-center rounded-full bg-[#3da5b6]/85 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
            For Sale
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
