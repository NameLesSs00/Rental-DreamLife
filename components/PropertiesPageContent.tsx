"use client";

import { usePublicRentProperties } from "@/lib/hooks/useProperties";
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
import type { Currency } from "@/lib/types/currency";
import { useSelectedCurrency } from "@/lib/hooks/useSelectedCurrency";

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

function formatNumberParam(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

function convertPriceFilterToBaseCurrency(
  value: string | undefined,
  selectedCurrency: string,
  currencies: Currency[],
) {
  const amount = Number(value);
  if (!value || !Number.isFinite(amount)) return value;

  const selected = currencies.find((currency) => currency.code.toUpperCase() === selectedCurrency.toUpperCase());
  if (!selected || selected.isBaseCurrency || selected.exchangeRate === 0) return value;

  const baseCurrency = currencies.find((currency) => currency.isBaseCurrency);
  const baseRate = baseCurrency?.exchangeRate || 1;
  return formatNumberParam((amount / selected.exchangeRate) * baseRate);
}

function buildRentApiParams(paramsObj: Record<string, string>, selectedCurrency: string, currencies: Currency[]) {
  const apiParams: Record<string, string> = { ...paramsObj };

  if (apiParams.MinPrice) {
    apiParams.MinPrice = convertPriceFilterToBaseCurrency(apiParams.MinPrice, selectedCurrency, currencies) || apiParams.MinPrice;
  }

  if (apiParams.MaxPrice) {
    apiParams.MaxPrice = convertPriceFilterToBaseCurrency(apiParams.MaxPrice, selectedCurrency, currencies) || apiParams.MaxPrice;
  }

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
  const paramsObj = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const [selectedCurrency, setSelectedCurrency] = useSelectedCurrency(paramsObj.Currency);
  const effectiveParamsObj = useMemo(
    () => ({ ...paramsObj, Currency: selectedCurrency }),
    [paramsObj, selectedCurrency],
  );
  const paramsKey = `${searchParams.toString()}|${selectedCurrency}`;
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleCurrencyChange = (nextCurrency: string) => {
    const normalizedCurrency = nextCurrency.toUpperCase();
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("Currency", normalizedCurrency);
    setSelectedCurrency(normalizedCurrency);
    router.push(href(`/rent?${newParams.toString()}`));
  };

  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileFiltersOpen]);

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newParams = new URLSearchParams();

    const from = (formData.get("from") as string)?.trim();
    const to = (formData.get("to") as string)?.trim();
    const minCapacity = (formData.get("minCapacity") as string)?.trim();
    const city = formData.get("city") as string;
    const minPrice = formData.get("minPrice") as string;
    const maxPrice = formData.get("maxPrice") as string;
    const propertyType = formData.get("propertyType") as string;
    const searchTerm = (formData.get("searchTerm") as string)?.trim();

    if (from && to) {
      newParams.set("from", from);
      newParams.set("to", to);
    }
    if (minCapacity) newParams.set("MinCapacity", minCapacity);
    if (city) newParams.set("CategoryId", city);
    if (minPrice) newParams.set("MinPrice", minPrice);
    if (maxPrice) newParams.set("MaxPrice", maxPrice);
    if (propertyType) newParams.set("PropertyType", propertyType);
    if (searchTerm) newParams.set("SearchTerm", searchTerm);
    if (selectedCurrency) newParams.set("Currency", selectedCurrency);

    const isAvailable = formData.get("isAvailable");
    const hasSeaView = formData.get("hasSeaView");
    const hasPoolView = formData.get("hasPoolView");
    const hasGardenView = formData.get("hasGardenView");
    const hasMountainView = formData.get("hasMountainView");
    const hasCityView = formData.get("hasCityView");

    if (isAvailable) newParams.set("IsAvailable", "true");
    if (hasSeaView) newParams.set("HasSeaView", "true");
    if (hasPoolView) newParams.set("HasPoolView", "true");
    if (hasGardenView) newParams.set("HasGardenView", "true");
    if (hasMountainView) newParams.set("HasMountainView", "true");
    if (hasCityView) newParams.set("HasCityView", "true");

    setMobileFiltersOpen(false);
    router.push(href(`/rent?${newParams.toString()}`));
  };

  return (
    <main className="min-h-screen bg-[#fafaf8] font-[var(--font-poppins)]">
      {/* Hero Section matching Photo 2 */}
      <PropertiesHero />

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
                key={`mobile-${paramsKey}`}
                paramsObj={effectiveParamsObj}
                onSubmit={handleFilterSubmit}
                onCurrencyChange={handleCurrencyChange}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Layout matching Photo 1 */}
      <div className="mx-auto max-w-[1536px] px-4 pb-24 sm:px-6 lg:px-10">
        <ListingHeading />
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8 xl:gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:sticky lg:top-8 lg:block lg:w-[310px] lg:shrink-0">
            <FilterForm
              key={`desktop-${paramsKey}`}
              paramsObj={effectiveParamsObj}
              onSubmit={handleFilterSubmit}
              onCurrencyChange={handleCurrencyChange}
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

function PropertiesHero() {
  return (
    <section className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6">
      <div className="relative h-[280px] sm:h-[360px] md:h-[420px] lg:h-[480px] w-full overflow-hidden rounded-[20px] sm:rounded-[28px] shadow-sm">
        <Image
          src="/rent/rent-hero-bg.png"
          alt="Browse Homes, Apartments & rental with Ease"
          fill
          priority
          sizes="(max-width: 1536px) 100vw, 1536px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-transparent flex items-center">
          <div className="px-6 sm:px-12 lg:px-16 max-w-2xl">
            <h1 className="text-[28px] sm:text-[42px] lg:text-[52px] font-extrabold leading-[1.12] text-white tracking-tight drop-shadow-xs">
              Browse Homes,<br />
              Apartments &amp; rental<br />
              with Ease
            </h1>
            <p className="mt-3 sm:mt-4 max-w-[420px] text-[13.5px] sm:text-[15.5px] leading-relaxed text-white/95 font-medium drop-shadow-xs">
              Explore rentals that match your space, style, and way of living.
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
        Featured Rental <span className="text-[#3ca3b5]">Properties</span>
      </h2>
      <div className="mx-auto mt-2 h-[3px] w-[86px] rounded-full bg-[#2C798B]" />
    </div>
  );
}

function FilterForm({
  paramsObj,
  onSubmit,
}: {
  paramsObj: Record<string, string>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCurrencyChange: (currency: string) => void;
}) {
  const { t, href } = useI18n();
  const { data: categories } = useCategories();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const minCapacityVal = paramsObj.MinCapacity || "";
  const categoryIdParam = paramsObj.CategoryId || paramsObj.categoryId || "";
  const cityVal = categoryIdParam;
  const propertyTypeVal = paramsObj.PropertyType || paramsObj.propertyType || "";
  const minPriceVal = paramsObj.MinPrice || "";
  const maxPriceVal = paramsObj.MaxPrice || "";
  const searchTermVal = paramsObj.SearchTerm || "";

  const isAvailableVal = paramsObj.IsAvailable === "true";
  const hasSeaViewVal = paramsObj.HasSeaView === "true";
  const hasPoolViewVal = paramsObj.HasPoolView === "true";
  const hasGardenViewVal = paramsObj.HasGardenView === "true";
  const hasMountainViewVal = paramsObj.HasMountainView === "true";
  const hasCityViewVal = paramsObj.HasCityView === "true";

  const fromVal = paramsObj.from || "";
  const toVal = paramsObj.to || "";
  const [fromDate, setFromDate] = useState(fromVal);
  const [toDate, setToDate] = useState(toVal);
  const [prevFrom, setPrevFrom] = useState(fromVal);
  const [prevTo, setPrevTo] = useState(toVal);

  if (prevFrom !== fromVal || prevTo !== toVal) {
    setPrevFrom(fromVal);
    setPrevTo(toVal);
    setFromDate(fromVal);
    setToDate(toVal);
  }

  const todayString = new Date().toISOString().split("T")[0];
  const minCheckOutDate = fromDate
    ? (() => {
        const next = new Date(fromDate);
        next.setDate(next.getDate() + 1);
        return next.toISOString().split("T")[0];
      })()
    : todayString;

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFromDate(val);
    if (val && toDate && toDate <= val) {
      const next = new Date(val);
      next.setDate(next.getDate() + 1);
      setToDate(next.toISOString().split("T")[0]);
    }
  };

  const handleClearFormDates = () => {
    setFromDate("");
    setToDate("");
  };

  const checkboxes = [
    { name: "isAvailable", label: t("rent.availableNow"), defaultChecked: isAvailableVal },
    { name: "hasSeaView", label: t("rent.seaView"), defaultChecked: hasSeaViewVal },
    { name: "hasPoolView", label: t("rent.poolView"), defaultChecked: hasPoolViewVal },
    { name: "hasGardenView", label: t("rent.gardenView"), defaultChecked: hasGardenViewVal },
    { name: "hasMountainView", label: t("rent.mountainView"), defaultChecked: hasMountainViewVal },
    { name: "hasCityView", label: t("rent.cityView"), defaultChecked: hasCityViewVal },
  ];

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[#e2e8e6] bg-white p-5 shadow-xs">
      {/* Search Input at Top */}
      <div>
        <input
          type="text"
          name="searchTerm"
          defaultValue={searchTermVal}
          placeholder="Search"
          className="w-full rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] px-3.5 py-2.5 text-[13px] text-[#183640] placeholder-[#8a9a94] outline-none transition focus:border-[#2C798B] focus:bg-white"
        />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {/* DATES OF STAY Box */}
        <div className="rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#718288]">
              DATES OF STAY
            </span>
            {(fromDate || toDate) && (
              <button
                type="button"
                onClick={handleClearFormDates}
                className="text-[11px] font-medium text-[#c94a4a] hover:underline"
              >
                {t("common.clearDates")}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-[#718288]">Check-In Date</span>
              <input
                type="date"
                name="from"
                value={fromDate}
                min={todayString}
                onChange={handleFromChange}
                className="w-full rounded-lg border border-[#e2e8e6] bg-white px-3 py-1.5 text-[12px] text-[#183640] outline-none focus:border-[#2C798B]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-[#718288]">Check-Out Date</span>
              <input
                type="date"
                name="to"
                value={toDate}
                min={minCheckOutDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-[#e2e8e6] bg-white px-3 py-1.5 text-[12px] text-[#183640] outline-none focus:border-[#2C798B]"
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
              className="flex-1 rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] px-3 py-2 text-[12.5px] text-[#183640] outline-none focus:border-[#2C798B]"
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
              defaultValue={cityVal}
              className="flex-1 rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] px-3 py-2 text-[12.5px] text-[#183640] outline-none focus:border-[#2C798B]"
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
              name="minCapacity"
              defaultValue={minCapacityVal}
              className="flex-1 rounded-xl border border-[#e2e8e6] bg-[#fbfdfc] px-3 py-2 text-[12.5px] text-[#183640] outline-none focus:border-[#2C798B]"
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
              {checkboxes.map(({ name, label, defaultChecked }) => (
                <label key={name} className="flex cursor-pointer items-center gap-2 text-[12.5px] text-[#414847]">
                  <input
                    type="checkbox"
                    name={name}
                    defaultChecked={defaultChecked}
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

function PropertyGrid({ paramsObj }: { paramsObj: Record<string, string> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, href } = useI18n();
  const pageNumber = Number(paramsObj.page) || 1;
  const pageSize = 50;
  const { data: currencies = [] } = useCurrencies({ isActive: true });
  const selectedCurrency = (paramsObj.Currency || "USD").toUpperCase();
  const apiParams = useMemo(
    () => buildRentApiParams(paramsObj, selectedCurrency, currencies),
    [currencies, paramsObj, selectedCurrency],
  );
  const { data, isLoading } = usePublicRentProperties({ ...apiParams, pageNumber, pageSize });
  const minCapacity = Math.max(0, Number(paramsObj.MinCapacity || paramsObj.minCapacity || 0) || 0);

  const hasDateFilter = Boolean(paramsObj.from && paramsObj.to);
  const {
    data: inHouseData,
    isLoading: inHouseLoading,
  } = useInHouseBookings(
    hasDateFilter ? { from: paramsObj.from, to: paramsObj.to } : {}
  );

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
    const rawItems = (items || []).filter((item) => !minCapacity || Number(item.capacity || 0) >= minCapacity);
    if (!hasDateFilter) return rawItems;
    if (!inHouseData?.units) return [];

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
  }, [hasDateFilter, inHouseData, items, minCapacity]);

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
    if (minCapacity) {
      detailParams.set("person", String(minCapacity));
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
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
