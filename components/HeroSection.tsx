"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useI18n } from "./I18nProvider";

export default function HeroSection() {
  const router = useRouter();
  const { t, href } = useI18n();

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
    if (propertyType && propertyType !== "All") {
      searchParams.append("PropertyType", propertyType);
    }
    if (minCapacity) {
      searchParams.append("MinCapacity", minCapacity);
    }
    if (minPrice && Number(minPrice) > 0) {
      searchParams.append("MinPrice", minPrice);
    }
    if (maxPrice && Number(maxPrice) > 0) {
      searchParams.append("MaxPrice", maxPrice);
    }
    if (rooms && rooms !== "Any") {
      searchParams.append("MinCapacity", rooms.replace("+", ""));
    }
    if (location && location !== "All") {
      searchParams.append("city", location);
    }

    router.push(href(`/rent?${searchParams.toString()}`));
  };

  return (
    <section className="relative w-full overflow-visible font-[var(--font-poppins)]">
      <div className="relative w-full overflow-visible">
        {/* Background image container.
            `lg`–`xl` follow the design's proportion (1080x555 ≈ 1.95:1), which is only
            slightly wider than the source photo (1400x745 = 1.879:1) — so `object-cover`
            trims just a sliver vertically instead of cropping ~17% off the sides.
            From `2xl` the height is capped so the hero doesn't grow unbounded on wide
            monitors. Below `lg` a fixed height is kept so there is room for the headline
            and the search card on phones/tablets. */}
        <div className="relative h-[480px] w-full overflow-hidden sm:h-[560px] lg:h-auto lg:aspect-[1080/555] 2xl:h-[780px] 2xl:aspect-auto">
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
          className="absolute left-1/2 top-[14%] z-20 w-[calc(100%-28px)] max-w-[1120px] -translate-x-1/2 text-center sm:top-[17%] lg:top-[21%] xl:top-[22%]"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto font-[var(--font-poppins)] font-black uppercase tracking-[0%] text-center text-white text-[34px] leading-[36px] sm:text-[50px] sm:leading-[52px] lg:text-[70px] lg:leading-[70px]"
          >
            YOUR FUTURE
            <br />
            STARTS HERE
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-3 font-[var(--font-poppins)] font-semibold tracking-[0%] text-center text-white text-[16px] leading-[1.2] sm:text-[18px] lg:text-[20px] lg:leading-[24px]"
          >
            Find the Place You&apos;ll Love to Call Home
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-2 max-w-[220px] font-[var(--font-poppins)] font-normal tracking-[0%] text-center text-[12px] leading-relaxed text-white/90 sm:max-w-[300px] sm:text-[14px] lg:max-w-[400px]"
          >
            Discover exceptional properties in prime locations, tailored to the way you want to live.
          </motion.p>
        </motion.div>

        {/* Search Form Card: overlapping the bottom edge */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          style={{ boxShadow: "0px 2px 60px 10px #00000033" }}
          className="absolute bottom-0 left-1/2 z-30 w-[calc(100%-28px)] max-w-[1020px] -translate-x-1/2 translate-y-1/2 rounded-[20px] bg-[#e4edf0]/80 p-4 backdrop-blur-md border border-white/60 sm:rounded-[24px] sm:p-5 lg:p-6"
        >
          <div className="flex flex-col sm:flex-row items-end gap-3 sm:gap-4 w-full">
            {/* Check-in & Check-out Dates */}
            <div className="min-w-0 text-[#2C798B] w-full sm:flex-1">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
                <label className="block min-w-0">
                  <span className="mb-1.5 block truncate text-[13px] font-medium leading-none text-[#2C798B] sm:text-[14px] xl:text-[15px] 2xl:text-[16px]">
                    {t("home.hero.checkIn")}
                  </span>
                  <input
                    type="date"
                    name="from"
                    min={new Date().toISOString().split("T")[0]}
                    aria-label={t("home.hero.checkIn")}
                    title={t("home.hero.checkIn")}
                    className="h-10 w-full min-w-0 cursor-pointer rounded-lg border border-[#e6ece9] bg-white px-2 sm:px-3 text-[12px] font-medium text-[#2C798B] outline-none transition hover:border-[#2C798B] focus:border-[#2C798B] focus:ring-2 focus:ring-[#2C798B]/10 sm:rounded-xl sm:text-[13px] xl:h-[48px] xl:text-[14px] 2xl:text-[15px] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                  />
                </label>

                <label className="block min-w-0">
                  <span className="mb-1.5 block truncate text-[13px] font-medium leading-none text-[#2C798B] sm:text-[14px] xl:text-[15px] 2xl:text-[16px]">
                    {t("home.hero.checkOut")}
                  </span>
                  <input
                    type="date"
                    name="to"
                    min={new Date().toISOString().split("T")[0]}
                    aria-label={t("home.hero.checkOut")}
                    title={t("home.hero.checkOut")}
                    className="h-10 w-full min-w-0 cursor-pointer rounded-lg border border-[#e6ece9] bg-white px-2 sm:px-3 text-[12px] font-medium text-[#2C798B] outline-none transition hover:border-[#2C798B] focus:border-[#2C798B] focus:ring-2 focus:ring-[#2C798B]/10 sm:rounded-xl sm:text-[13px] xl:h-[48px] xl:text-[14px] 2xl:text-[15px] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                  />
                </label>

                <label className="block min-w-0">
                  <span className="mb-1.5 block truncate text-[13px] font-medium leading-none text-[#2C798B] sm:text-[14px] xl:text-[15px] 2xl:text-[16px]">
                    {t("rent.adults")}
                  </span>
                  <input
                    type="number"
                    name="minCapacity"
                    min="1"
                    placeholder={t("rent.any")}
                    onWheel={(event) => (event.target as HTMLElement).blur()}
                    aria-label={t("rent.adults")}
                    title={t("rent.adults")}
                    className="h-10 w-full min-w-0 rounded-lg border border-[#e6ece9] bg-white px-2 text-[12px] font-medium text-[#2C798B] outline-none transition hover:border-[#2C798B] focus:border-[#2C798B] focus:ring-2 focus:ring-[#2C798B]/10 sm:rounded-xl sm:px-3 sm:text-[13px] xl:h-[48px] xl:text-[14px] 2xl:text-[15px]"
                  />
                </label>
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="h-[42px] min-w-[100px] px-6 rounded-[10px] bg-[#7faeb9] text-white text-[14px] font-medium transition hover:bg-[#6fa0ab] flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
            >
              Search
            </button>
          </div>

          {/* Row 2: Min Price, Max Price, Rooms, Location, Property Type */}
          <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {/* Min Price */}
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#2d3f38]">
                Min Price
              </label>
              <div className="relative flex h-[38px] w-full items-center rounded-[10px] bg-white px-3 focus-within:ring-2 focus-within:ring-[#7faeb9]/40">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="0.0"
                  step="any"
                  className="w-full bg-transparent pr-7 text-[13px] font-medium text-[#183c2f] outline-none placeholder:text-[#9eada6]"
                />
                <span className="pointer-events-none absolute right-3 text-[11px] font-bold text-[#8fa099]">
                  EG
                </span>
              </div>
            </div>

            {/* Max Price */}
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#2d3f38]">
                Max Price
              </label>
              <div className="relative flex h-[38px] w-full items-center rounded-[10px] bg-white px-3 focus-within:ring-2 focus-within:ring-[#7faeb9]/40">
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="0.0"
                  step="any"
                  className="w-full bg-transparent pr-7 text-[13px] font-medium text-[#183c2f] outline-none placeholder:text-[#9eada6]"
                />
                <span className="pointer-events-none absolute right-3 text-[11px] font-bold text-[#8fa099]">
                  EG
                </span>
              </div>
            </div>

            {/* Rooms */}
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#2d3f38]">
                Rooms
              </label>
              <div className="relative flex h-[38px] w-full items-center rounded-[10px] bg-white px-3 focus-within:ring-2 focus-within:ring-[#7faeb9]/40">
                <select
                  name="rooms"
                  defaultValue="2"
                  className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-[13px] font-medium text-[#183c2f] outline-none"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5+</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-[#4a5e55]" />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#2d3f38]">
                Location
              </label>
              <div className="relative flex h-[38px] w-full items-center rounded-[10px] bg-white px-3 focus-within:ring-2 focus-within:ring-[#7faeb9]/40">
                <select
                  name="location"
                  defaultValue="Hurghada"
                  className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-[13px] font-medium text-[#183c2f] outline-none"
                >
                  <option value="Hurghada">Hurghada</option>
                  <option value="El Gouna">El Gouna</option>
                  <option value="Sahl Hasheesh">Sahl Hasheesh</option>
                  <option value="Makadi Heights">Makadi Heights</option>
                  <option value="Soma Bay">Soma Bay</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-[#4a5e55]" />
              </div>
            </div>

            {/* Property Type */}
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1 block text-[12px] font-medium text-[#2d3f38]">
                Property Type
              </label>
              <div className="relative flex h-[38px] w-full items-center rounded-[10px] bg-white px-3 focus-within:ring-2 focus-within:ring-[#7faeb9]/40">
                <select
                  name="propertyType"
                  defaultValue="Villa"
                  className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-[13px] font-medium text-[#183c2f] outline-none"
                >
                  <option value="Villa">Villa</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Studio">Studio</option>
                  <option value="Chalet">Chalet</option>
                  <option value="TwinHouse">Twin House</option>
                  <option value="TownHouse">Townhouse</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Penthouse">Penthouse</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-[#4a5e55]" />
              </div>
            </div>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
