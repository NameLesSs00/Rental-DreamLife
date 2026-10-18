"use client";

import { usePublicRentProperties, useSearchProperties } from "@/lib/hooks/useProperties";
import { PropertyType, type PropertyListItem } from "@/lib/types/property";
import { slugify } from "@/lib/utils/slugify";
import { API_BASE_URL } from "@/lib/api/config";
import { useCategories } from "@/lib/hooks/useCategory";
import { useCurrencies } from "@/lib/hooks/useCurrency";
import { formatPriceForCurrency } from "@/lib/utils/currency";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useMemo, useTransition, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInHouseBookings } from "@/lib/hooks/useBooking";
import { useI18n } from "./I18nProvider";
import { useSelectedCurrency } from "@/lib/hooks/useSelectedCurrency";
import PageHero from "@/components/PageHero";

type RentGridItem = PropertyListItem & {
  size?: number | null;
  areaName?: string | null;
};

type NormalizedPropertyCard = {
  id: string;
  title: string;
  location: string;
  beds: string;
  baths: string;
  size: string;
  priceLabel: string;
  image: string;
  url: string;
  isFeatured: boolean;
  propertyType?: string;
  bathroomsCount?: number;
  bedroomsCount?: number;
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

/**
 * Translates the URL's filter params into `/api/properties/filter` params.
 *
 * - Location maps to `Area` (a name) because the endpoint has **no `CategoryId`**.
 *   Previously we passed `CategoryId`, which forced the hook to resolve membership
 *   client-side with one `GET /api/properties/{id}` per item — up to 1000 requests.
 * - Prices are USD only, so no FX conversion happens here.
 */
function buildRentApiParams(paramsObj: Record<string, string>) {
  const apiParams: Record<string, string> = { ...paramsObj };

  const area = paramsObj.location || paramsObj.Area || "";
  delete apiParams.location;
  delete apiParams.Area;
  delete apiParams.CategoryId;
  delete apiParams.categoryId;
  if (area) apiParams.Area = area;

  // Prices are USD — pass straight through.
  delete apiParams.minPrice;
  delete apiParams.maxPrice;
  if (paramsObj.MinPrice) apiParams.MinPrice = paramsObj.MinPrice;
  if (paramsObj.MaxPrice) apiParams.MaxPrice = paramsObj.MaxPrice;

  // Rooms & Capacity
  if (paramsObj.MinBedrooms) apiParams.MinBedrooms = paramsObj.MinBedrooms;
  if (paramsObj.MaxBedrooms) apiParams.MaxBedrooms = paramsObj.MaxBedrooms;
  if (paramsObj.MinBathrooms) apiParams.MinBathrooms = paramsObj.MinBathrooms;
  if (paramsObj.MaxBathrooms) apiParams.MaxBathrooms = paramsObj.MaxBathrooms;
  if (paramsObj.MinCapacity) apiParams.MinCapacity = paramsObj.MinCapacity;

  // Featured
  if (paramsObj.IsFeatured === "true") apiParams.IsFeatured = "true";

  // Views
  if (paramsObj.HasSeaView === "true") apiParams.HasSeaView = "true";
  if (paramsObj.HasPoolView === "true") apiParams.HasPoolView = "true";
  if (paramsObj.HasGardenView === "true") apiParams.HasGardenView = "true";
  if (paramsObj.HasMountainView === "true") apiParams.HasMountainView = "true";
  if (paramsObj.HasCityView === "true") apiParams.HasCityView = "true";

  return apiParams;
}

export default function PropertiesPageContent() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2C798B] border-t-transparent" /></div>}>
      <PropertiesPageInner />
    </Suspense>
  );
}

function PropertiesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, href } = useI18n();
  const { data: categories } = useCategories();
  const paramsObj = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const [selectedCurrency] = useSelectedCurrency(paramsObj.Currency);

  // `location` is the area name. Category ids from older inbound links are resolved
  // to their name once categories load, so existing links keep working.
  const locationParam = paramsObj.location || paramsObj.Area || "";

  const effectiveLocation = useMemo(() => {
    const legacyCategoryId = paramsObj.CategoryId || paramsObj.categoryId || "";
    if (locationParam) return locationParam;
    if (!legacyCategoryId || !categories?.length) return "";
    return categories.find((c) => c.id === legacyCategoryId)?.name || "";
  }, [locationParam, paramsObj.CategoryId, paramsObj.categoryId, categories]);

  const effectiveParamsObj = useMemo(() => {
    const rest = { ...paramsObj };
    delete rest.CategoryId;
    delete rest.categoryId;
    return {
      ...rest,
      Currency: selectedCurrency,
      ...(effectiveLocation ? { location: effectiveLocation } : {}),
    };
  }, [paramsObj, selectedCurrency, effectiveLocation]);
  const paramsKey = `${searchParams.toString()}|${selectedCurrency}|${effectiveLocation}`;
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileFiltersOpen]);

  /**
   * Single source of truth for "apply this filter change".
   * Every control navigates through here, so results update instantly without a
   * Search button. Empty values delete the param, so filters can be cleared.
   */
  const navigate = (patch: Record<string, string>, options?: { replace?: boolean }) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete("page"); // any filter change resets pagination
    const qs = next.toString();
    const target = href(`/rent${qs ? `?${qs}` : ""}`);
    router.replace(target, { scroll: false });

    setMobileFiltersOpen(false);
  };


  return (
    <main className="min-h-screen bg-[#F3F0E9] font-[var(--font-poppins)]">
      {/* Hero Section matching Photo 2 */}
      {/* 1. Hero Section: Unified PageHero with identical spacing and height */}
      <PageHero
        imageSrc="/rent/rent-hero-bg.jpg"
        imageAlt="Browse Homes, Apartments & rental with Ease"
        title={
          <>
            Browse Vacation Homes<br />
            with Ease
          </>
        }
        subtitle="Explore rentals that match your space, style, and way of living."

        maxTitleWidth="max-w-[640px]"
        maxSubtitleWidth="max-w-[560px]"
        priority
      />

      {/* Mobile filter floating trigger button */}
      <div className="sticky top-20 z-30 flex justify-end px-4 py-2 lg:hidden">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 rounded-full bg-[#183640] px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg transition hover:bg-[#2C798B]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="2" y1="4" x2="14" y2="4" />
            <line x1="4" y1="8" x2="12" y2="8" />
            <line x1="6" y1="12" x2="10" y2="12" />
          </svg>
          {t("rent.filters")}
        </button>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.aside
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-y-0 left-0 z-[90] flex w-full max-w-[340px] flex-col bg-white shadow-2xl lg:hidden"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#f0f0f0] px-5 py-4">
              <h2 className="text-[18px] font-bold text-[#183640]">{t("rent.filters")}</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="grid size-8 place-items-center rounded-full text-[#656566] transition hover:bg-[#f5f5f5]"
                aria-label={t("rent.closeFilters")}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M1 1l12 12M13 1L1 13" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <FilterForm
                paramsObj={effectiveParamsObj}
                categories={categories}
                navigate={navigate}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Layout matching Photo 1 */}
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
          <span className="text-[#718288]">{t("common.rent") || "Vacation Homes"}</span>
        </nav>
        <ListingHeading />
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8 xl:gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:sticky lg:top-8 lg:block lg:w-[340px] lg:shrink-0">
            <FilterForm
              paramsObj={effectiveParamsObj}
                categories={categories}
                navigate={navigate}
              />
          </aside>
          {/* Property grid */}
          <div className="min-w-0 flex-1">
            <PropertyGrid key={`grid-${paramsKey}`} paramsObj={effectiveParamsObj} />
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
        Featured Rental <span className="text-[#3ca3b5]">Properties</span>
      </h2>
      <div className="mx-auto mt-2 h-[3px] w-[86px] rounded-full bg-[#2C798B]" />
    </div>
  );
}

function FilterForm({
  paramsObj,
  categories,
  navigate,
}: {
  paramsObj: Record<string, string>;
  categories?: { id: string; name: string }[];
  navigate: (patch: Record<string, string>, options?: { replace?: boolean }) => void;
}) {
  const { t } = useI18n();

  const propertyTypeVal = paramsObj.PropertyType || paramsObj.propertyType || "";
  const locationVal = paramsObj.location || paramsObj.Area || "";
  const minPriceVal = paramsObj.MinPrice || "";
  const maxPriceVal = paramsObj.MaxPrice || "";
  const minBedroomsVal = paramsObj.MinBedrooms || "";
  const maxBedroomsVal = paramsObj.MaxBedrooms || "";
  const minBathroomsVal = paramsObj.MinBathrooms || "";
  const maxBathroomsVal = paramsObj.MaxBathrooms || "";
  const minCapacityVal = paramsObj.MinCapacity || "";
  const isFeaturedVal = paramsObj.IsFeatured === "true";
  const hasSeaViewVal = paramsObj.HasSeaView === "true";
  const hasPoolViewVal = paramsObj.HasPoolView === "true";
  const hasGardenViewVal = paramsObj.HasGardenView === "true";
  const hasMountainViewVal = paramsObj.HasMountainView === "true";
  const hasCityViewVal = paramsObj.HasCityView === "true";
  const searchTermVal = paramsObj.SearchTerm || "";

  const fromVal = paramsObj.from || "";
  const toVal = paramsObj.to || "";

  // Debounced search so typing doesn't fire a request per keystroke.
  const [term, setTerm] = useState(searchTermVal);
  const [debouncedTerm, setDebouncedTerm] = useState(searchTermVal);
  const [lastUrlTerm, setLastUrlTerm] = useState(searchTermVal);

  // React's documented "adjust state when props change" pattern — keeps the box in
  // sync with Back/forward navigation without a setState-in-effect.
  if (searchTermVal !== lastUrlTerm) {
    setLastUrlTerm(searchTermVal);
    setTerm(searchTermVal);
    setDebouncedTerm(searchTermVal);
  }

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(term), 350);
    return () => clearTimeout(timer);
  }, [term]);

  useEffect(() => {
    if (debouncedTerm === searchTermVal) return;
    navigate({ SearchTerm: debouncedTerm }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTerm]);

  const hasAnyAdvancedFilter = Boolean(
    hasSeaViewVal ||
    hasPoolViewVal ||
    hasGardenViewVal ||
    hasMountainViewVal ||
    hasCityViewVal ||
    isFeaturedVal
  );

  const [advancedOpen, setAdvancedOpen] = useState(hasAnyAdvancedFilter);

  useEffect(() => {
    if (hasAnyAdvancedFilter) setAdvancedOpen(true);
  }, [hasAnyAdvancedFilter]);

  const [localMinPrice, setLocalMinPrice] = useState(minPriceVal);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceVal);
  const [localMinBedrooms, setLocalMinBedrooms] = useState(minBedroomsVal);
  const [localMaxBedrooms, setLocalMaxBedrooms] = useState(maxBedroomsVal);
  const [localMinBathrooms, setLocalMinBathrooms] = useState(minBathroomsVal);
  const [localMaxBathrooms, setLocalMaxBathrooms] = useState(maxBathroomsVal);

  useEffect(() => {
    setLocalMinPrice(minPriceVal);
    setLocalMaxPrice(maxPriceVal);
    setLocalMinBedrooms(minBedroomsVal);
    setLocalMaxBedrooms(maxBedroomsVal);
    setLocalMinBathrooms(minBathroomsVal);
    setLocalMaxBathrooms(maxBathroomsVal);
  }, [minPriceVal, maxPriceVal, minBedroomsVal, maxBedroomsVal, minBathroomsVal, maxBathroomsVal]);

  const debouncerRef = useRef<NodeJS.Timeout | null>(null);
  const handleDebouncedInput = (patch: Record<string, string>) => {
    if (patch.MinPrice !== undefined) setLocalMinPrice(patch.MinPrice);
    if (patch.MaxPrice !== undefined) setLocalMaxPrice(patch.MaxPrice);
    if (patch.MinBedrooms !== undefined) setLocalMinBedrooms(patch.MinBedrooms);
    if (patch.MaxBedrooms !== undefined) setLocalMaxBedrooms(patch.MaxBedrooms);
    if (patch.MinBathrooms !== undefined) setLocalMinBathrooms(patch.MinBathrooms);
    if (patch.MaxBathrooms !== undefined) setLocalMaxBathrooms(patch.MaxBathrooms);

    if (debouncerRef.current) clearTimeout(debouncerRef.current);
    debouncerRef.current = setTimeout(() => {
      navigate(patch, { replace: true });
    }, 350);
  };

  const todayString = new Date().toISOString().split("T")[0];
  const minCheckOutDate = fromVal
    ? (() => {
        const next = new Date(fromVal);
        next.setDate(next.getDate() + 1);
        return next.toISOString().split("T")[0];
      })()
    : todayString;

  const labelCls = "mb-1.5 block text-[11.5px] font-semibold text-[#656566]";

  const hasAnyFilter = Boolean(
    searchTermVal ||
    propertyTypeVal ||
    locationVal ||
    minPriceVal ||
    maxPriceVal ||
    minBedroomsVal ||
    maxBedroomsVal ||
    minBathroomsVal ||
    maxBathroomsVal ||
    minCapacityVal ||
    fromVal ||
    toVal ||
    isFeaturedVal ||
    hasSeaViewVal ||
    hasPoolViewVal ||
    hasGardenViewVal ||
    hasMountainViewVal ||
    hasCityViewVal
  );

  const clearAllFilters = () => {
    navigate({
      SearchTerm: "",
      PropertyType: "",
      location: "",
      Area: "",
      City: "",
      MinPrice: "",
      MaxPrice: "",
      MinBedrooms: "",
      MaxBedrooms: "",
      MinBathrooms: "",
      MaxBathrooms: "",
      MinCapacity: "",
      from: "",
      to: "",
      IsFeatured: "",
      HasSeaView: "",
      HasPoolView: "",
      HasGardenView: "",
      HasMountainView: "",
      HasCityView: "",
    });
  };

  return (
    <div className="rounded-2xl border border-[#e2e8e6] bg-white p-5 shadow-xs">
      {/* Search */}
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={t("rent.searchPlaceholder") || "Search properties"}
        aria-label={t("rent.searchPlaceholder") || "Search properties"}
        className="w-full rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] px-3.5 py-2.5 text-[13px] text-[#183640] outline-none transition placeholder-[#8a9a94] focus:border-[#2C798B] focus:bg-white"
      />

      <div className="mt-4 flex flex-col gap-4">
        {/* Property Type */}
        <div>
          <span className={labelCls}>{t("rent.propertyType") || "Property Type"}</span>
          <select
            value={propertyTypeVal}
            onChange={(e) => navigate({ PropertyType: e.target.value })}
            className="w-full rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] px-3 py-2 text-[12.5px] text-[#183640] outline-none focus:border-[#2C798B]"
          >
            <option value="">{t("rent.allTypes") || "All Types"}</option>
            <option value={PropertyType.oneBedroom}>{t("rent.oneBedroom") || "1 Bedroom"}</option>
            <option value={PropertyType.twoBedroom}>{t("rent.twoBedrooms") || "2 Bedrooms"}</option>
            <option value={PropertyType.Apartment}>{t("rent.apartment") || "Apartment"}</option>
            <option value={PropertyType.Villa}>{t("rent.villa") || "Villa"}</option>
            <option value={PropertyType.Studio}>{t("rent.studio") || "Studio"}</option>
            <option value={PropertyType.Chalet}>{t("rent.chalet") || "Chalet"}</option>
            <option value={PropertyType.TwinHouse}>{t("rent.twinHouse") || "Twin House"}</option>
            <option value={PropertyType.TownHouse}>{t("rent.townhouse") || "Townhouse"}</option>
            <option value={PropertyType.Duplex}>{t("rent.duplex") || "Duplex"}</option>
            <option value={PropertyType.Penthouse}>{t("rent.penthouse") || "Penthouse"}</option>
            <option value={PropertyType.Cabin}>{t("rent.cabin") || "Cabin"}</option>
            <option value={PropertyType.Hotel}>{t("rent.hotel") || "Hotel"}</option>
          </select>
        </div>

        {/* Location — sends the area name, which the filter endpoint supports */}
        <div>
          <span className={labelCls}>{t("rent.location") || "Location"}</span>
          <select
            value={locationVal}
            onChange={(e) => navigate({ location: e.target.value })}
            className="w-full rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] px-3 py-2 text-[12.5px] text-[#183640] outline-none focus:border-[#2C798B]"
          >
            <option value="">{t("rent.anyLocation") || "All Locations"}</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Guests / Capacity */}
        <div>
          <span className={labelCls}>{t("rent.adults") || "Guests (Adults)"}</span>
          <div className="grid grid-cols-5 gap-1.5">
            {["", "1", "2", "4", "6"].map((val) => {
              const isSelected = val === "" ? !minCapacityVal : minCapacityVal === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => navigate({ MinCapacity: val })}
                  className={`h-8 rounded-lg text-[12px] font-medium transition ${
                    isSelected
                      ? "bg-[#2C798B] text-white shadow-xs"
                      : "border border-[#e2e8e6] bg-[#fbfdfc] text-[#556960] hover:border-[#2C798B]/50 hover:bg-white"
                  }`}
                >
                  {val === "" ? t("rent.any") || "Any" : `${val}+`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dates of stay */}
        <div className="rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#718288]">
              {t("rent.datesOfStay") || "Dates of stay"}
            </span>
            {(fromVal || toVal) && (
              <button
                type="button"
                onClick={() => navigate({ from: "", to: "" })}
                className="text-[11px] font-medium text-[#c94a4a] hover:underline"
              >
                {t("common.clearDates") || "Clear"}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-[#718288]">
                {t("rent.checkIn") || "Check-In Date"}
              </span>
              <input
                type="date"
                value={fromVal}
                min={todayString}
                onChange={(e) => {
                  const val = e.target.value;
                  const nextTo = toVal && toVal <= val
                    ? (() => {
                        const d = new Date(val);
                        d.setDate(d.getDate() + 1);
                        return d.toISOString().split("T")[0];
                      })()
                    : toVal;
                  navigate({ from: val, to: val ? nextTo : "" });
                }}
                className="w-full rounded-lg border border-[#e2e8e6] bg-white px-3 py-1.5 text-[12px] text-[#183640] outline-none focus:border-[#2C798B]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-[#718288]">
                {t("rent.checkOut") || "Check-Out Date"}
              </span>
              <input
                type="date"
                value={toVal}
                min={minCheckOutDate}
                onChange={(e) => navigate({ to: e.target.value })}
                className="w-full rounded-lg border border-[#e2e8e6] bg-white px-3 py-1.5 text-[12px] text-[#183640] outline-none focus:border-[#2C798B]"
              />
            </label>
          </div>
        </div>

        {/* Price — USD only */}
        <div>
          <div className="grid grid-cols-2 items-end gap-2">
            <div>
              <span className={labelCls}>{t("rent.minPrice") || "Min Price"}</span>
              <input
                type="number"
                value={localMinPrice}
                onChange={(e) => handleDebouncedInput({ MinPrice: e.target.value })}
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
                onChange={(e) => handleDebouncedInput({ MaxPrice: e.target.value })}
                placeholder="No limit"
                min="0"
                className="w-full rounded-lg border border-[#e2e8e6] bg-[#fbfdfc] px-2.5 py-1.5 text-[12px] text-[#142d38] outline-none focus:border-[#2C798B]"
              />
            </div>
          </div>
          <p className="mt-1 text-[10.5px] text-[#8a9a94]">USD / {t("common.night")}</p>
        </div>

        {/* Bedrooms (Min / Max) */}
        <div>
          <span className={labelCls}>{t("rent.bedrooms") || "Bedrooms"}</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              value={localMinBedrooms}
              onChange={(e) => handleDebouncedInput({ MinBedrooms: e.target.value })}
              placeholder="e.g. 1"
              aria-label={t("rent.minBedrooms") || "Min Bedrooms"}
              className="w-full rounded-lg border border-[#e2e8e6] bg-[#fbfdfc] px-2.5 py-1.5 text-[12px] text-[#142d38] outline-none focus:border-[#2C798B]"
            />
            <input
              type="number"
              min="0"
              value={localMaxBedrooms}
              onChange={(e) => handleDebouncedInput({ MaxBedrooms: e.target.value })}
              placeholder="e.g. 3"
              aria-label={t("rent.maxBedrooms") || "Max Bedrooms"}
              className="w-full rounded-lg border border-[#e2e8e6] bg-[#fbfdfc] px-2.5 py-1.5 text-[12px] text-[#142d38] outline-none focus:border-[#2C798B]"
            />
          </div>
        </div>

        {/* Bathrooms (Min / Max) */}
        <div>
          <span className={labelCls}>{t("rent.bathrooms") || "Bathrooms"}</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              value={localMinBathrooms}
              onChange={(e) => handleDebouncedInput({ MinBathrooms: e.target.value })}
              placeholder="e.g. 1"
              aria-label={t("rent.minBathrooms") || "Min Bathrooms"}
              className="w-full rounded-lg border border-[#e2e8e6] bg-[#fbfdfc] px-2.5 py-1.5 text-[12px] text-[#142d38] outline-none focus:border-[#2C798B]"
            />
            <input
              type="number"
              min="0"
              value={localMaxBathrooms}
              onChange={(e) => handleDebouncedInput({ MaxBathrooms: e.target.value })}
              placeholder="e.g. 2"
              aria-label={t("rent.maxBathrooms") || "Max Bathrooms"}
              className="w-full rounded-lg border border-[#e2e8e6] bg-[#fbfdfc] px-2.5 py-1.5 text-[12px] text-[#142d38] outline-none focus:border-[#2C798B]"
            />
          </div>
        </div>

        {/* Advanced Filters (Amenities and Views) */}
        <div className="border-t border-[#eef2f0] pt-3">
          <button
            type="button"
            onClick={() => setAdvancedOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-left text-[12.5px] font-semibold text-[#183640] transition hover:text-[#2C798B]"
          >
            <span className="flex items-center gap-2">
              <span>{t("common.advanced") || "Advanced"}</span>
              {hasAnyAdvancedFilter && (
                <span className="inline-flex size-4 items-center justify-center rounded-full bg-[#2C798B] text-[10px] font-bold text-white">
                  {[hasSeaViewVal, hasPoolViewVal, hasGardenViewVal, hasMountainViewVal, hasCityViewVal, isFeaturedVal].filter(Boolean).length}
                </span>
              )}
            </span>
            <svg
              className={`size-4 text-[#8a9a94] transition-transform duration-200 ${advancedOpen ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {advancedOpen && (
            <div className="mt-3 space-y-2">
              <span className={labelCls}>{t("rent.amenitiesViews") || "Amenities and Views"}</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    key: "HasSeaView",
                    label: t("rent.seaView") || "Sea View",
                    active: hasSeaViewVal,
                    icon: (
                      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 7 0" />
                        <path d="M2 17c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 7 0" />
                      </svg>
                    ),
                  },
                  {
                    key: "HasPoolView",
                    label: t("rent.poolView") || "Pool View",
                    active: hasPoolViewVal,
                    icon: (
                      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 20a4 4 0 0 0 8 0 4 4 0 0 0 8 0 4 4 0 0 0 4-2" />
                        <path d="M4 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                        <circle cx="16" cy="4" r="2" />
                      </svg>
                    ),
                  },
                  {
                    key: "HasGardenView",
                    label: t("rent.gardenView") || "Garden View",
                    active: hasGardenViewVal,
                    icon: (
                      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a9 9 0 0 0-9 9c0 4.17 2.84 7.67 6.69 8.69L12 22l2.31-2.31C18.16 18.67 21 15.17 21 11a9 9 0 0 0-9-9z" />
                        <path d="M12 6v10" />
                      </svg>
                    ),
                  },
                  {
                    key: "HasMountainView",
                    label: t("rent.mountainView") || "Mountain View",
                    active: hasMountainViewVal,
                    icon: (
                      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                      </svg>
                    ),
                  },
                  {
                    key: "HasCityView",
                    label: t("rent.cityView") || "City View",
                    active: hasCityViewVal,
                    icon: (
                      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="2" width="16" height="20" rx="1" />
                        <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
                      </svg>
                    ),
                  },
                  {
                    key: "IsFeatured",
                    label: t("rent.featuredOnly") || "Featured Only",
                    active: isFeaturedVal,
                    icon: (
                      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ),
                  },
                ].map((view) => (
                  <button
                    key={view.key}
                    type="button"
                    onClick={() => navigate({ [view.key]: view.active ? "" : "true" })}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition ${
                      view.active
                        ? "bg-[#2C798B] text-white shadow-xs"
                        : "border border-[#e2e8e6] bg-[#fbfdfc] text-[#556960] hover:border-[#2C798B]/50 hover:bg-white"
                    }`}
                  >
                    {view.icon}
                    <span>{view.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clear All Filters */}
        {hasAnyFilter && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#dfe8e4] bg-[#fbfdfc] py-2 text-[12px] font-semibold text-[#c94a4a] transition hover:bg-[#fdecea] hover:border-[#f5c6cb]"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            <span>{t("rent.clearAll") || "Clear All Filters"}</span>
          </button>
        )}
      </div>
    </div>
  );
}


function PropertyGrid({ paramsObj }: { paramsObj: Record<string, string> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, href } = useI18n();
  const pageNumber = Number(paramsObj.page) || 1;
  const pageSize = 50;
  const { data: currencies = [] } = useCurrencies({ isActive: true });
  const selectedCurrency = (paramsObj.Currency || "USD").toUpperCase();
  const apiParams = useMemo(
    () => buildRentApiParams(paramsObj),
    [paramsObj],
  );
  const searchTerm = (paramsObj.SearchTerm || paramsObj.search || "").trim();

  const hasDateFilter = Boolean(paramsObj.from && paramsObj.to);
  const {
    data: inHouseData,
    isLoading: inHouseLoading,
  } = useInHouseBookings(
    hasDateFilter ? { from: paramsObj.from, to: paramsObj.to } : {}
  );

  // `SearchTerm` is only honoured by `/api/properties/search` — the filter endpoint
  // ignores it, which made search silently return the unfiltered list.
  const { data: searchData, isLoading: searchLoading } = useSearchProperties({
    SearchTerm: searchTerm,
    PageNumber: pageNumber,
    PageSize: pageSize,
  });
  const { data: listData, isLoading: listLoading } = usePublicRentProperties(
    { ...apiParams, pageNumber, pageSize },
    { enabled: !searchTerm }
  );

  const data = searchTerm ? searchData : listData;
  const isLoading = searchTerm ? searchLoading : listLoading;

  const items = data?.items;
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.pageNumber || pageNumber;

  const handleClearDates = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("from");
    newParams.delete("to");
    router.replace(href(`/rent?${newParams.toString()}`), { scroll: false });
  };

  const filteredRawItems = useMemo(() => {
    const rawItems = items || [];
    if (!hasDateFilter) return rawItems;
    // Fall back to the unfiltered list when availability hasn't loaded — the old
    // `return []` blanked the entire grid if this request was slow or failed.
    if (!inHouseData?.units?.length) return rawItems;

    const availableUnitIds = new Set(
      inHouseData.units
        .filter((u) => u.status?.toLowerCase() === "available")
        .map((u) => u.unitId.toLowerCase())
    );
    const availableUnitNumbers = new Set(
      inHouseData.units
        .filter((u) => u.status?.toLowerCase() === "available")
        .map((u) => (u.unitNumber || "").toLowerCase())
        .filter(Boolean)
    );

    const unavailableUnitIds = new Set(
      inHouseData.units
        .filter((u) => u.status?.toLowerCase() !== "available")
        .map((u) => u.unitId.toLowerCase())
    );
    const unavailableUnitNumbers = new Set(
      inHouseData.units
        .filter((u) => u.status?.toLowerCase() !== "available")
        .map((u) => (u.unitNumber || "").toLowerCase())
        .filter(Boolean)
    );

    return rawItems.filter((item) => {
      const idLower = item.id.toLowerCase();
      const propNumLower = (item.propertyNumber || "").toLowerCase();

      if (
        unavailableUnitIds.has(idLower) ||
        (propNumLower && unavailableUnitNumbers.has(propNumLower))
      ) {
        return false;
      }

      const isAvailable =
        availableUnitIds.has(idLower) ||
        (propNumLower && availableUnitNumbers.has(propNumLower));

      return isAvailable;
    });
  }, [hasDateFilter, inHouseData, items]);

  const sortedRawItems = useMemo(() => {
    let list = [...filteredRawItems];

    if (paramsObj.MinCapacity) {
      const cap = Number(paramsObj.MinCapacity);
      if (!Number.isNaN(cap) && cap > 0) {
        list = list.filter((item) => (item.capacity ?? 0) >= cap);
      }
    }
    if (paramsObj.MinBedrooms) {
      const minB = Number(paramsObj.MinBedrooms);
      if (!Number.isNaN(minB) && minB > 0) {
        list = list.filter((item) => (item.bedroomNo ?? 0) >= minB);
      }
    }
    if (paramsObj.MaxBedrooms) {
      const maxB = Number(paramsObj.MaxBedrooms);
      if (!Number.isNaN(maxB) && maxB > 0) {
        list = list.filter((item) => (item.bedroomNo ?? 0) <= maxB);
      }
    }
    if (paramsObj.MinBathrooms) {
      const minB = Number(paramsObj.MinBathrooms);
      if (!Number.isNaN(minB) && minB > 0) {
        list = list.filter((item) => (item.bathroomNo ?? 0) >= minB);
      }
    }
    if (paramsObj.MaxBathrooms) {
      const maxB = Number(paramsObj.MaxBathrooms);
      if (!Number.isNaN(maxB) && maxB > 0) {
        list = list.filter((item) => (item.bathroomNo ?? 0) <= maxB);
      }
    }
    if (paramsObj.IsFeatured === "true") {
      list = list.filter((item) => Boolean(item.isFeatured));
    }

    return list.sort((a, b) => {
      const aFeatured = a.isFeatured ? 1 : 0;
      const bFeatured = b.isFeatured ? 1 : 0;
      return bFeatured - aFeatured;
    });
  }, [filteredRawItems, paramsObj]);

  const properties: NormalizedPropertyCard[] = sortedRawItems.map((item) => {
    const rentItem = item as RentGridItem;
    const detailParams = new URLSearchParams();
    if (hasDateFilter) {
      detailParams.set("checkIn", paramsObj.from);
      detailParams.set("checkOut", paramsObj.to);
    }
    detailParams.set("id", rentItem.id);
    detailParams.set("Currency", selectedCurrency);
    const queryString = detailParams.toString();
    const url = `/rent/${slugify(rentItem.name)}${queryString ? `?${queryString}` : ""}`;

    const typeName =
      rentItem.propertyTypeName ||
      (rentItem.propertyType ? propertyTypeNames[rentItem.propertyType] : "Apartment") ||
      "Apartment";

    const sizeStr =
      typeof rentItem.size === "number" && rentItem.size > 0
        ? `${rentItem.size} m²`
        : rentItem.capacity
        ? `${rentItem.capacity * 35} m²`
        : "140 m²";

    return {
      id: rentItem.id,
      title: rentItem.name,
      location: rentItem.city || rentItem.areaName || t("home.featured.locationMissing") || "Hurghada",
      beds: `${rentItem.bedroomNo || 1}`,
      baths: `${rentItem.bathroomNo || 1}`,
      bedroomsCount: rentItem.bedroomNo || 1,
      bathroomsCount: rentItem.bathroomNo || 1,
      size: sizeStr,
      propertyType: typeName,
      priceLabel: formatPriceForCurrency(rentItem.basePriceInfo, rentItem.basePrice, selectedCurrency, currencies),
      image: rentItem.coverImageUrl ? (rentItem.coverImageUrl.startsWith("http") ? rentItem.coverImageUrl : `${API_BASE_URL}/${rentItem.coverImageUrl}`) : "/rent/property-card.png",
      url,
      isFeatured: Boolean(rentItem.isFeatured),
    };
  });

  const removeFilter = (keys: string[]) => {
    const newParams = new URLSearchParams(searchParams.toString());
    keys.forEach((k) => newParams.delete(k));
    newParams.set("page", "1");
    router.replace(href(`/rent?${newParams.toString()}`), { scroll: false });
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    if (paramsObj.from) newParams.set("from", paramsObj.from);
    if (paramsObj.to) newParams.set("to", paramsObj.to);
    router.replace(href(`/rent${newParams.toString() ? `?${newParams.toString()}` : ""}`), { scroll: false });
  };

  const activeFilterTags: { keys: string[]; label: string }[] = [];

  if (paramsObj.Location) {
    activeFilterTags.push({ keys: ["Location"], label: `${t("rent.location") || "Location"}: ${paramsObj.Location}` });
  }
  if (paramsObj.PropertyType) {
    const typeLabel = propertyTypeNames[Number(paramsObj.PropertyType)] || paramsObj.PropertyType;
    activeFilterTags.push({ keys: ["PropertyType"], label: `${t("rent.propertyType") || "Type"}: ${typeLabel}` });
  }
  if (paramsObj.MinPrice || paramsObj.MaxPrice) {
    const priceText =
      paramsObj.MinPrice && paramsObj.MaxPrice
        ? `$${paramsObj.MinPrice} - $${paramsObj.MaxPrice}`
        : paramsObj.MinPrice
        ? `≥ $${paramsObj.MinPrice}`
        : `≤ $${paramsObj.MaxPrice}`;
    activeFilterTags.push({ keys: ["MinPrice", "MaxPrice"], label: `${t("rent.priceNight") || "Price"}: ${priceText}` });
  }
  if (paramsObj.MinBedrooms || paramsObj.MaxBedrooms) {
    const bedsText =
      paramsObj.MinBedrooms && paramsObj.MaxBedrooms
        ? `${paramsObj.MinBedrooms} - ${paramsObj.MaxBedrooms}`
        : paramsObj.MinBedrooms
        ? `≥ ${paramsObj.MinBedrooms}`
        : `≤ ${paramsObj.MaxBedrooms}`;
    activeFilterTags.push({ keys: ["MinBedrooms", "MaxBedrooms"], label: `${t("rent.bedrooms") || "Bedrooms"}: ${bedsText}` });
  }
  if (paramsObj.MinBathrooms || paramsObj.MaxBathrooms) {
    const bathsText =
      paramsObj.MinBathrooms && paramsObj.MaxBathrooms
        ? `${paramsObj.MinBathrooms} - ${paramsObj.MaxBathrooms}`
        : paramsObj.MinBathrooms
        ? `≥ ${paramsObj.MinBathrooms}`
        : `≤ ${paramsObj.MaxBathrooms}`;
    activeFilterTags.push({ keys: ["MinBathrooms", "MaxBathrooms"], label: `${t("rent.bathrooms") || "Bathrooms"}: ${bathsText}` });
  }
  if (paramsObj.MinCapacity) {
    activeFilterTags.push({ keys: ["MinCapacity"], label: `${t("rent.capacity") || "Guests"}: ${paramsObj.MinCapacity}+` });
  }
  if (paramsObj.IsFeatured === "true") {
    activeFilterTags.push({ keys: ["IsFeatured"], label: t("rent.featuredOnly") || "Featured" });
  }
  if (paramsObj.HasSeaView === "true") {
    activeFilterTags.push({ keys: ["HasSeaView"], label: t("rent.seaView") || "Sea View" });
  }
  if (paramsObj.HasPoolView === "true") {
    activeFilterTags.push({ keys: ["HasPoolView"], label: t("rent.poolView") || "Pool View" });
  }
  if (paramsObj.HasGardenView === "true") {
    activeFilterTags.push({ keys: ["HasGardenView"], label: t("rent.gardenView") || "Garden View" });
  }
  if (paramsObj.HasMountainView === "true") {
    activeFilterTags.push({ keys: ["HasMountainView"], label: t("rent.mountainView") || "Mountain View" });
  }
  if (paramsObj.HasCityView === "true") {
    activeFilterTags.push({ keys: ["HasCityView"], label: t("rent.cityView") || "City View" });
  }

  const isGridLoading = isLoading || (hasDateFilter && inHouseLoading);

  return (
    <>
      <section id="properties" className="w-full">
        {activeFilterTags.length > 0 && !isGridLoading && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium text-[#656566]">{t("rent.activeFilters")}:</span>
            {activeFilterTags.map((tag) => (
              <button
                key={tag.keys.join("-")}
                type="button"
                onClick={() => removeFilter(tag.keys)}
                className="group inline-flex items-center gap-1.5 rounded-full bg-[#f4f7f6] px-3 py-1 text-[12px] font-medium text-[#183640] transition hover:bg-[#e4ece9]"
              >
                <span>{tag.label}</span>
                <svg className="size-3 text-[#9aa8a3] transition group-hover:text-[#183640]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[12px] font-semibold text-[#2C798B] underline hover:text-[#183640]"
            >
              {t("rent.clearAll")}
            </button>
          </div>
        )}
        {hasDateFilter && !isGridLoading && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#2C798B]/20 bg-[#2C798B]/5 px-4 py-3 text-[14px] text-[#183640]">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2C798B]">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>
                {t("rent.showingAvailable", { from: paramsObj.from, to: paramsObj.to, count: properties.length })}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearDates}
              className="text-[13px] font-semibold text-[#2C798B] underline hover:text-[#183640]"
            >
              {t("common.clearDates")}
            </button>
          </div>
        )}

        {isGridLoading && properties.length === 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-[380px] animate-pulse rounded-[20px] bg-white shadow-xs" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d8e0dd] bg-white py-20 text-center">
            <p className="text-[18px] font-semibold text-[#183640]">{t("rent.emptyTitle")}</p>
            <p className="mt-2 text-[14px] text-[#656566]">
              {hasDateFilter
                ? t("rent.emptyWithDates", { from: paramsObj.from, to: paramsObj.to })
                : t("rent.emptyFiltered")}
            </p>
            {hasDateFilter && (
              <button
                type="button"
                onClick={handleClearDates}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-[#2C798B] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#183640]"
              >
                {t("rent.viewAllAvailable")}
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            {isGridLoading && (
              <div className="absolute top-2 right-2 z-20 flex items-center gap-2 rounded-full border border-[#2C798B]/20 bg-white/95 px-3 py-1.5 text-[12px] font-medium text-[#2C798B] shadow-md backdrop-blur-xs">
                <span className="size-3 animate-spin rounded-full border-2 border-[#2C798B] border-t-transparent" />
                <span>{t("common.loading") || "Loading..."}</span>
              </div>
            )}
          <motion.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
            initial="hidden"
            animate="visible"
            className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ${isGridLoading ? "opacity-60 pointer-events-none" : ""}`}
          >
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </motion.div>
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} paramsObj={paramsObj} />
      )}
    </>
  );
}

function PropertyCard({ property }: { property: NormalizedPropertyCard }) {
  const { t, href } = useI18n();

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="group flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
    >
      {/* Top Image + For Rent badge */}
      <Link
        href={href(property.url)}
        className="relative block aspect-[16/11] w-full overflow-hidden rounded-t-[20px] bg-[#e6edea]"
      >
        <Image
          src={property.image}
          alt={property.title}
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
        <Link href={href(property.url)} className="hover:underline">
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
          <span className="line-clamp-1">{property.location}</span>
        </div>

        {/* Type & Size Row */}
        <div className="mt-2.5 flex items-center justify-between text-[13px] text-[#718288]">
          <span>{property.propertyType || "Apartment"}</span>
          <span>{property.size}</span>
        </div>

        {/* Price & Beds/Baths Row */}
        <div className="mt-3 flex items-center justify-between pt-1">
          <span className="text-[17px] font-bold text-[#142d38] sm:text-[18px]">
            {property.priceLabel}
          </span>
          <div className="flex items-center gap-3 text-[13px] text-[#718288]">
            <span className="flex items-center gap-1">
              <span>{property.bathroomsCount || 1}</span>
              <Image
                src="/homepage/properties/icons/bath.svg"
                alt=""
                width={15}
                height={15}
                className="size-[15px] opacity-70"
              />
            </span>
            <span className="flex items-center gap-1">
              <span>{property.bedroomsCount || 1}</span>
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
          href={href(property.url)}
          className="mt-4 flex h-9 sm:h-10 w-full items-center justify-center rounded-lg bg-[#71a8b7] text-[13.5px] sm:text-[14px] font-semibold text-white shadow-xs transition hover:bg-[#5b95a4]"
        >
          {t("common.bookNow") || "Book Now"}
        </Link>
      </div>
    </motion.article>
  );
}

function Pagination({ currentPage, totalPages, paramsObj }: { currentPage: number; totalPages: number; paramsObj: Record<string, string> }) {
  const router = useRouter();
  const { t, href } = useI18n();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const newParams = new URLSearchParams(paramsObj);
    newParams.set("page", page.toString());
    router.replace(href(`/rent?${newParams.toString()}`), { scroll: false });
  };

  const generatePages = (): Array<number | "..."> => {
    const pages: Array<number | "..."> = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }
    return pages.filter((val, idx, arr) => val !== "..." || arr[idx - 1] !== "...");
  };

  return (
    <nav className="mt-12 flex justify-center pb-4" aria-label="Properties pagination">
      <div className="flex items-center gap-2">
        <PageArrow src="/rent/icons/page-prev.svg" disabled={currentPage <= 1} label={t("common.previousPage")} onClick={() => handlePageChange(currentPage - 1)} />
        {generatePages().map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-[16px] text-[#667c74]">...</span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page as number)}
              className={`grid size-10 place-items-center rounded-full border text-[14px] font-semibold transition hover:border-[#2C798B] hover:bg-[#2C798B] hover:text-white ${page === currentPage
                ? "border-[#2C798B] bg-[#2C798B] text-white"
                : "border-[#e6e6e6] bg-white text-[#414847]"
                }`}
            >
              {page}
            </button>
          )
        )}
        <PageArrow src="/rent/icons/page-next.svg" disabled={currentPage >= totalPages} label={t("common.nextPage")} onClick={() => handlePageChange(currentPage + 1)} />
      </div>
    </nav>
  );
}

function PageArrow({ src, label, disabled = false, onClick }: { src: string; label: string; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-10 place-items-center rounded-full border transition ${disabled ? "cursor-not-allowed border-[#f0f0f0] opacity-40" : "border-[#e6e6e6] bg-white hover:border-[#2C798B] hover:bg-[#2C798B] hover:text-white"}`}
    >
      <Image src={src} alt="" width={16} height={16} className="size-4" />
    </button>
  );
}
