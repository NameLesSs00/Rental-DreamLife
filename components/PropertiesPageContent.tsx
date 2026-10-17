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
import { Suspense, useState, useEffect, useMemo } from "react";
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
    if (options?.replace) router.replace(target, { scroll: false });
    else router.push(target);
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
  const minRoomsVal = paramsObj.MinRooms || "";
  const minPriceVal = paramsObj.MinPrice || "";
  const maxPriceVal = paramsObj.MaxPrice || "";
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

  const todayString = new Date().toISOString().split("T")[0];
  const minCheckOutDate = fromVal
    ? (() => {
        const next = new Date(fromVal);
        next.setDate(next.getDate() + 1);
        return next.toISOString().split("T")[0];
      })()
    : todayString;

  const labelCls = "mb-1.5 block text-[11.5px] font-semibold text-[#656566]";

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
            <option value={PropertyType.Apartment}>{t("rent.apartment") || "Apartment"}</option>
            <option value={PropertyType.Villa}>{t("rent.villa") || "Villa"}</option>
            <option value={PropertyType.Studio}>{t("rent.studio") || "Studio"}</option>
            <option value={PropertyType.Chalet}>{t("rent.chalet") || "Chalet"}</option>
            <option value={PropertyType.TwinHouse}>{t("rent.twinHouse") || "Twin House"}</option>
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

        {/* Rooms — typed number, sent as the server's MinRooms */}
        <div>
          <label htmlFor="rent-min-rooms" className={labelCls}>
            {t("rent.rooms")}
          </label>
          <input
            id="rent-min-rooms"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={minRoomsVal}
            onChange={(e) => {
              const raw = e.target.value;
              // Allow clearing, but never send a negative or fractional value.
              const n = Number(raw);
              if (raw !== "" && (!Number.isFinite(n) || n < 0)) return;
              navigate({ MinRooms: raw === "" ? "" : String(Math.floor(n)) });
            }}
            placeholder="0"
            className="w-full rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] px-3 py-2 text-[12.5px] text-[#183640] outline-none transition focus:border-[#2C798B]"
          />
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
                value={minPriceVal}
                onChange={(e) => navigate({ MinPrice: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full rounded-lg border border-[#e2e8e6] bg-[#fbfdfc] px-2.5 py-1.5 text-[12px] text-[#142d38] outline-none focus:border-[#2C798B]"
              />
            </div>
            <div>
              <span className={labelCls}>{t("rent.maxPrice") || "Max Price"}</span>
              <input
                type="number"
                value={maxPriceVal}
                onChange={(e) => navigate({ MaxPrice: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full rounded-lg border border-[#e2e8e6] bg-[#fbfdfc] px-2.5 py-1.5 text-[12px] text-[#142d38] outline-none focus:border-[#2C798B]"
              />
            </div>
          </div>
          <p className="mt-1.5 text-[11px] text-[#8a9a94]">USD</p>
        </div>
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
    router.push(href(`/rent?${newParams.toString()}`));
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
    return [...filteredRawItems].sort((a, b) => {
      const aFeatured = a.isFeatured ? 1 : 0;
      const bFeatured = b.isFeatured ? 1 : 0;
      return bFeatured - aFeatured;
    });
  }, [filteredRawItems]);

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

  const isGridLoading = isLoading || (hasDateFilter && inHouseLoading);

  return (
    <>
      <section id="properties" className="w-full">
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

        {isGridLoading ? (
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
          <motion.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </motion.div>
        )}
      </section>

      {!isGridLoading && totalPages > 1 && (
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
    router.push(href(`/rent?${newParams.toString()}`));
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
