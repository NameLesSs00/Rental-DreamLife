"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, SlidersHorizontal, Search } from "lucide-react";
import { useI18n } from "./I18nProvider";
import { useCategories } from "@/lib/hooks/useCategory";

export default function HeroSection() {
  const router = useRouter();
  const { t, href, locale } = useI18n();
  const { data: categories = [] } = useCategories(locale);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchParams = new URLSearchParams();

    const from = (formData.get("from") as string)?.trim();
    const to = (formData.get("to") as string)?.trim();
    const minCapacity = (formData.get("minCapacity") as string)?.trim();
    const propertyType = (formData.get("propertyType") as string)?.trim();
    const minPrice = (formData.get("minPrice") as string)?.trim();
    const maxPrice = (formData.get("maxPrice") as string)?.trim();
    const rooms = (formData.get("rooms") as string)?.trim();
    const location = (formData.get("location") as string)?.trim();

    if (from && to) {
      searchParams.append("from", from);
      searchParams.append("to", to);
    } else if (from && !to) {
      const d = new Date(from);
      d.setDate(d.getDate() + 1);
      searchParams.append("from", from);
      searchParams.append("to", d.toISOString().split("T")[0]);
    }

    if (minCapacity && Number(minCapacity) > 0) {
      searchParams.append("MinCapacity", minCapacity);
    }

    if (rooms && Number(rooms) > 0) {
      searchParams.append("BedroomNo", rooms);
    }

    if (location && location !== "All" && location !== "") {
      searchParams.append("CategoryId", location);
    }

    if (propertyType && propertyType !== "All") {
      searchParams.append("PropertyType", propertyType);
    }

    if (minPrice && Number(minPrice) > 0) {
      searchParams.append("MinPrice", minPrice);
    }

    if (maxPrice && Number(maxPrice) > 0) {
      searchParams.append("MaxPrice", maxPrice);
    }

    searchParams.append("Currency", "USD");

    router.push(href(`/rent?${searchParams.toString()}`));
  };

  return (
    <section className="relative w-full overflow-visible font-[var(--font-poppins)]">
      <div className="relative w-full overflow-visible">
        {/* Background image container */}
        <div className="relative min-h-[500px] h-[520px] w-full overflow-hidden sm:h-[560px] lg:h-auto lg:aspect-[1080/555] 2xl:h-[780px] 2xl:aspect-auto">
          <motion.div
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute -inset-[20px] origin-center"
          >
            <Image
              src="/homepage/heroSection1/hero-luxury.jpg"
              alt={t("seo.ogAlt")}
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
              quality={95}
              draggable={false}
            />
          </motion.div>
        </div>

        {/* Headline, Subtitle, and Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.15 }}
          className="absolute left-1/2 top-[8%] sm:top-[16%] lg:top-[21%] xl:top-[22%] z-20 w-[calc(100%-24px)] max-w-[1120px] -translate-x-1/2 text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto font-[var(--font-poppins)] font-black uppercase tracking-[0%] text-center text-white text-[32px] leading-[36px] sm:text-[50px] sm:leading-[52px] lg:text-[70px] lg:leading-[70px]"
          >
            <span className="block">{t("home.hero.headlineLine1")}</span>
            <span className="block rtl:mt-1.5 sm:rtl:mt-2 lg:rtl:mt-3">{t("home.hero.headlineLine2")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-2.5 font-[var(--font-poppins)] font-semibold tracking-[0%] text-center text-white text-[15px] leading-[1.25] sm:text-[18px] lg:text-[20px] lg:leading-[24px]"
          >
            {t("home.hero.tagline")}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-2 max-w-[240px] font-[var(--font-poppins)] font-normal tracking-[0%] text-center text-[11.5px] leading-relaxed text-white/90 sm:max-w-[300px] sm:text-[14px] lg:max-w-[400px]"
          >
            {t("home.hero.description")}
          </motion.p>
        </motion.div>

        {/* Search Form Card: overlapping the bottom edge */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          style={{ boxShadow: "0px 4px 50px 0px rgba(0, 0, 0, 0.22)" }}
          className="absolute bottom-0 left-1/2 z-30 w-[calc(100%-24px)] max-w-[1040px] -translate-x-1/2 translate-y-1/2 rounded-[20px] bg-[#e4edf0]/90 p-3 sm:p-5 lg:p-6 backdrop-blur-md border border-white/70 shadow-lg sm:rounded-[24px]"
        >
          {/* Row 1: Primary Inputs (Check-in, Check-out, Residents/Adults) + Filters Button + Search */}
          <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-3 items-end">
            {/* Check-in Date */}
            <label className="col-span-1 sm:col-span-3 block min-w-0">
              <span className="mb-1 block truncate text-[11.5px] sm:text-[13px] xl:text-[14px] font-medium leading-none text-[#2C798B]">
                {t("home.hero.checkIn")}
              </span>
              <input
                type="date"
                name="from"
                min={new Date().toISOString().split("T")[0]}
                aria-label={t("home.hero.checkIn")}
                title={t("home.hero.checkIn")}
                className="h-10 sm:h-[44px] w-full min-w-0 cursor-pointer rounded-lg border border-[#e6ece9] bg-white px-2 sm:px-3 text-[12px] font-medium text-[#2C798B] outline-none transition hover:border-[#2C798B] focus:border-[#2C798B] focus:ring-2 focus:ring-[#2C798B]/10 sm:rounded-xl sm:text-[13px] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              />
            </label>

            {/* Check-out Date */}
            <label className="col-span-1 sm:col-span-3 block min-w-0">
              <span className="mb-1 block truncate text-[11.5px] sm:text-[13px] xl:text-[14px] font-medium leading-none text-[#2C798B]">
                {t("home.hero.checkOut")}
              </span>
              <input
                type="date"
                name="to"
                min={new Date().toISOString().split("T")[0]}
                aria-label={t("home.hero.checkOut")}
                title={t("home.hero.checkOut")}
                className="h-10 sm:h-[44px] w-full min-w-0 cursor-pointer rounded-lg border border-[#e6ece9] bg-white px-2 sm:px-3 text-[12px] font-medium text-[#2C798B] outline-none transition hover:border-[#2C798B] focus:border-[#2C798B] focus:ring-2 focus:ring-[#2C798B]/10 sm:rounded-xl sm:text-[13px] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              />
            </label>

            {/* Adults / Residents */}
            <label className="col-span-2 sm:col-span-2 block min-w-0">
              <span className="mb-1 block truncate text-[11.5px] sm:text-[13px] xl:text-[14px] font-medium leading-none text-[#2C798B]">
                {t("rent.adults")}
              </span>
              <input
                type="number"
                name="minCapacity"
                min="1"
                placeholder={t("rent.any") || "Any"}
                onWheel={(event) => (event.target as HTMLElement).blur()}
                aria-label={t("rent.adults")}
                title={t("rent.adults")}
                className="h-10 sm:h-[44px] w-full min-w-0 rounded-lg border border-[#e6ece9] bg-white px-3 text-[12px] font-medium text-[#2C798B] outline-none transition hover:border-[#2C798B] focus:border-[#2C798B] focus:ring-2 focus:ring-[#2C798B]/10 sm:rounded-xl sm:text-[13px]"
              />
            </label>

            {/* More Filters Button */}
            <div className="col-span-1 sm:col-span-2">
              <button
                type="button"
                onClick={() => setShowMoreFilters((prev) => !prev)}
                className={`inline-flex h-10 sm:h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border transition shadow-xs cursor-pointer px-2 sm:px-3 text-[12px] sm:text-[13px] font-medium ${
                  showMoreFilters
                    ? "border-[#2C798B] bg-[#2C798B]/10 text-[#2C798B]"
                    : "border-[#2C798B]/30 bg-white/80 text-[#2C798B] hover:bg-white hover:border-[#2C798B]"
                }`}
              >
                <SlidersHorizontal className="size-3.5 sm:size-4 shrink-0" />
                <span className="truncate">{showMoreFilters ? t("home.hero.fewerFilters") : t("home.hero.moreFilters")}</span>
                <ChevronDown
                  className={`size-3.5 shrink-0 transition-transform duration-200 ${
                    showMoreFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Search Button */}
            <div className="col-span-1 sm:col-span-2">
              <button
                type="submit"
                className="inline-flex h-10 sm:h-[44px] w-full items-center justify-center gap-1.5 rounded-lg bg-[#2C798B] px-3 sm:px-4 text-[13px] sm:text-[14px] font-semibold text-white shadow-xs transition hover:bg-[#23606e] active:scale-[0.98] cursor-pointer"
              >
                <Search className="size-4 shrink-0" />
                <span>{t("common.search")}</span>
              </button>
            </div>
          </div>

          {/* Collapsible Secondary Filters */}
          <AnimatePresence>
            {showMoreFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-[#2C798B]/20 grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {/* Min Price (USD) */}
                  <div>
                    <label className="mb-1 block text-[11px] sm:text-[12px] font-medium text-[#2d3f38]">
                      {t("rent.minPrice")}
                    </label>
                    <div className="relative flex h-[38px] w-full items-center rounded-[10px] bg-white px-3 focus-within:ring-2 focus-within:ring-[#7faeb9]/40">
                      <input
                        type="number"
                        name="minPrice"
                        placeholder="0.0"
                        step="any"
                        min="0"
                        className="w-full bg-transparent pe-9 text-[13px] font-medium text-[#183c2f] outline-none placeholder:text-[#9eada6]"
                      />
                      <span className="pointer-events-none absolute end-2.5 text-[10.5px] font-bold text-[#8fa099]">
                        USD
                      </span>
                    </div>
                  </div>

                  {/* Max Price (USD) */}
                  <div>
                    <label className="mb-1 block text-[11px] sm:text-[12px] font-medium text-[#2d3f38]">
                      {t("rent.maxPrice")}
                    </label>
                    <div className="relative flex h-[38px] w-full items-center rounded-[10px] bg-white px-3 focus-within:ring-2 focus-within:ring-[#7faeb9]/40">
                      <input
                        type="number"
                        name="maxPrice"
                        placeholder="0.0"
                        step="any"
                        min="0"
                        className="w-full bg-transparent pe-9 text-[13px] font-medium text-[#183c2f] outline-none placeholder:text-[#9eada6]"
                      />
                      <span className="pointer-events-none absolute end-2.5 text-[10.5px] font-bold text-[#8fa099]">
                        USD
                      </span>
                    </div>
                  </div>

                  {/* Rooms (Number Input) */}
                  <div>
                    <label className="mb-1 block text-[11px] sm:text-[12px] font-medium text-[#2d3f38]">
                      {t("rent.rooms")}
                    </label>
                    <div className="relative flex h-[38px] w-full items-center rounded-[10px] bg-white px-3 focus-within:ring-2 focus-within:ring-[#7faeb9]/40">
                      <input
                        type="number"
                        name="rooms"
                        min="1"
                        placeholder={t("rent.any") || "Any"}
                        onWheel={(event) => (event.target as HTMLElement).blur()}
                        className="w-full bg-transparent text-[13px] font-medium text-[#183c2f] outline-none placeholder:text-[#9eada6]"
                      />
                    </div>
                  </div>

                  {/* Location (Fetched dynamically from backend) */}
                  <div>
                    <label className="mb-1 block text-[11px] sm:text-[12px] font-medium text-[#2d3f38]">
                      {t("rent.location")}
                    </label>
                    <div className="relative flex h-[38px] w-full items-center rounded-[10px] bg-white px-3 focus-within:ring-2 focus-within:ring-[#7faeb9]/40">
                      <select
                        name="location"
                        defaultValue=""
                        className="w-full cursor-pointer appearance-none bg-transparent pe-6 text-[13px] font-medium text-[#183c2f] outline-none"
                      >
                        <option value="">{t("rent.anyLocation") || t("rent.all")}</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute end-2.5 size-4 text-[#4a5e55]" />
                    </div>
                  </div>

                  {/* Property Type */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="mb-1 block text-[11px] sm:text-[12px] font-medium text-[#2d3f38]">
                      {t("rent.propertyType")}
                    </label>
                    <div className="relative flex h-[38px] w-full items-center rounded-[10px] bg-white px-3 focus-within:ring-2 focus-within:ring-[#7faeb9]/40">
                      <select
                        name="propertyType"
                        defaultValue="All"
                        className="w-full cursor-pointer appearance-none bg-transparent pe-6 text-[13px] font-medium text-[#183c2f] outline-none"
                      >
                        <option value="All">{t("rent.allTypes")}</option>
                        <option value="Villa">{t("rent.villa")}</option>
                        <option value="Apartment">{t("rent.apartment")}</option>
                        <option value="Studio">{t("rent.studio")}</option>
                        <option value="Chalet">{t("rent.chalet")}</option>
                        <option value="TwinHouse">{t("rent.twinHouse")}</option>
                        <option value="TownHouse">{t("rent.townhouse")}</option>
                        <option value="Duplex">{t("rent.duplex")}</option>
                        <option value="Penthouse">{t("rent.penthouse")}</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute end-2.5 size-4 text-[#4a5e55]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </section>
  );
}
