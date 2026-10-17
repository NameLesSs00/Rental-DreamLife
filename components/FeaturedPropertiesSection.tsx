"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

const FALLBACK_IMAGE = "/rent/property-card.png";

export default function FeaturedPropertiesSection() {
  const [currency] = useSelectedCurrency();
  const { t, href, isRtl } = useI18n();
  const { data: currencies = [] } = useCurrencies({ isActive: true });

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxDrag, setMaxDrag] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Fetch 6 rental properties from backend
  const { data: response, isLoading } = useProperties({
    pageNumber: 1,
    pageSize: 6,
    Currency: currency,
  });

  const properties: PropertyListItem[] = response?.items || [];

  // Update drag boundaries whenever container or track resizes
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const updateConstraints = () => {
      const containerWidth = container.offsetWidth;
      const trackWidth = track.scrollWidth;
      const diff = Math.max(0, trackWidth - containerWidth);
      setMaxDrag(diff);

      const cur = x.get();
      if (!isRtl) {
        if (cur < -diff) x.set(-diff);
        if (cur > 0) x.set(0);
        setCanPrev(cur < -5);
        setCanNext(diff > 5 && cur > -diff + 5);
      } else {
        if (cur > diff) x.set(diff);
        if (cur < 0) x.set(0);
        setCanPrev(cur > 5);
        setCanNext(diff > 5 && cur < diff - 5);
      }
    };

    updateConstraints();
    const observer = new ResizeObserver(updateConstraints);
    observer.observe(container);
    observer.observe(track);
    return () => observer.disconnect();
  }, [properties.length, isRtl, x]);

  // Keep button states in sync with x position
  useEffect(() => {
    return x.on("change", (latest) => {
      if (!isRtl) {
        setCanPrev(latest < -5);
        setCanNext(maxDrag > 5 && latest > -maxDrag + 5);
      } else {
        setCanPrev(latest > 5);
        setCanNext(maxDrag > 5 && latest < maxDrag - 5);
      }
    });
  }, [maxDrag, isRtl, x]);

  const scroll = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 20 : 340;
    const cur = x.get();

    let target = cur;
    if (!isRtl) {
      if (direction === "left") {
        target = Math.min(0, cur + step);
      } else {
        target = Math.max(-maxDrag, cur - step);
      }
    } else {
      if (direction === "left") {
        target = Math.max(0, cur - step);
      } else {
        target = Math.min(maxDrag, cur + step);
      }
    }

    animate(x, target, {
      type: "spring",
      stiffness: 220,
      damping: 28,
      mass: 0.8,
    });
  };

  const arrowClass =
    "grid size-10 place-items-center rounded-full border border-[#2C798B]/30 bg-white text-[#183640] transition hover:border-[#2C798B] hover:bg-[#2C798B] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#2C798B]/30 disabled:hover:bg-white disabled:hover:text-[#183640]";

  return (
    <section className="relative z-20 flex w-full flex-col items-center bg-[#8FBAC4] px-2 pt-28 pb-16 font-[var(--font-poppins)] sm:px-3 sm:pt-32 sm:pb-20 lg:px-4 lg:pt-36">
      <div className="mx-auto w-full max-w-[1800px] rounded-[24px] bg-[#F3F0E9] p-6 shadow-sm sm:p-8 lg:p-10">
        {/* Section Heading: Centered teal title with side lines */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-4 sm:gap-5 lg:gap-7"
        >
          <span className="h-[3px] w-8 shrink-0 rounded-full bg-[#2C798B] sm:h-[4px] sm:w-12 lg:h-[5px] lg:w-[36px]" />
          <h2 className="break-words font-[var(--font-poppins)] text-[22px] font-semibold leading-[1.15] tracking-[0%] text-[#2C798B] sm:text-[28px] lg:text-[35px]">
            {t("home.featured.bestRentalTitle")}
          </h2>
          <span className="h-[3px] w-8 shrink-0 rounded-full bg-[#2C798B] sm:h-[4px] sm:w-12 lg:h-[5px] lg:w-[36px]" />
        </motion.div>

        {/* Content layout: Left text column + Right cards */}
        <div className="mt-10 flex flex-col items-stretch gap-8 sm:mt-14 xl:flex-row lg:gap-10 xl:gap-12">
          {/* Left Text Column: Title, Description, and Desktop Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="flex w-full flex-col justify-between self-stretch xl:w-[300px] xl:shrink-0 xl:pt-5"
          >
            <div>
              <h3 className="break-words font-[var(--font-poppins)] text-[26px] font-bold leading-[1.15] tracking-[0%] text-[#183640] sm:text-[32px] lg:text-[46px] lg:leading-[1.05]">
                {t("home.featured.findNextHome")}
              </h3>
              <p className="mt-4 break-words font-[var(--font-poppins)] text-[14px] font-normal leading-[1.55] tracking-[0%] text-[#183640] sm:text-[16px] lg:text-[21px] lg:leading-[1.2] lg:tracking-[-0.02em]">
                {t("home.featured.bestRentalBody")}
              </p>
            </div>

            {/* Desktop Actions in Left Column */}
            <div className="hidden xl:flex flex-col gap-4 mt-auto pt-8 xl:mb-4">
              <Link
                href={href("/rent")}
                className="inline-flex h-[52px] w-full max-w-[280px] shrink-0 items-center justify-center rounded-[10px] bg-[#183640] px-8 font-[var(--font-poppins)] text-[15px] font-semibold text-white transition hover:bg-[#11262d]"
              >
                {t("home.featured.viewMore")}
              </Link>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  disabled={!canPrev}
                  aria-label={t("home.featured.previous")}
                  className={arrowClass}
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  disabled={!canNext}
                  aria-label={t("home.featured.next")}
                  className={arrowClass}
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Cards Carousel */}
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
              <div
                ref={containerRef}
                onClickCapture={(e) => {
                  if (isDraggingRef.current) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                className="w-full overflow-hidden"
              >
                <motion.div
                  ref={trackRef}
                  drag="x"
                  dragDirectionLock
                  style={{ x, touchAction: "pan-y" }}
                  dragConstraints={
                    isRtl
                      ? { left: 0, right: maxDrag }
                      : { left: -maxDrag, right: 0 }
                  }
                  dragElastic={0.2}
                  dragTransition={{
                    power: 0.38,
                    timeConstant: 320,
                    bounceStiffness: 300,
                    bounceDamping: 30,
                  }}
                  onDragStart={() => {
                    isDraggingRef.current = true;
                    setIsDragging(true);
                  }}
                  onDragEnd={() => {
                    setTimeout(() => {
                      isDraggingRef.current = false;
                      setIsDragging(false);
                    }, 50);
                  }}
                  className={`flex items-stretch gap-5 pb-4 ${
                    isDragging ? "cursor-grabbing select-none" : "cursor-grab"
                  }`}
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
              </div>
            )}
          </div>
        </div>

        {/* Mobile / Tablet Actions: View more (left) & Carousel Arrows (right) on the bottom */}
        <div className="mt-8 flex items-center justify-between gap-4 xl:hidden">
          <Link
            href={href("/rent")}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#183640] px-7 font-[var(--font-poppins)] text-[13.3px] font-semibold leading-[1] text-white transition hover:bg-[#11262d] sm:h-12 sm:px-9"
          >
            {t("home.featured.viewMore")}
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canPrev}
              aria-label={t("home.featured.previous")}
              className={arrowClass}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canNext}
              aria-label={t("home.featured.next")}
              className={arrowClass}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
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
    : FALLBACK_IMAGE;

  const location = property.city
    ? property.country
      ? `${property.city}, ${property.country}`
      : property.city
    : property.country || "Hurghada";

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
    <article
      data-card
      className="group flex flex-[0_0_85%] shrink-0 flex-col overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] sm:flex-[0_0_calc(50%-10px)] lg:flex-[0_0_calc(50%-12px)] xl:flex-[0_0_calc(33.333%-14px)]"
    >
      {/* Top Image + For Rent badge */}
      <Link
        href={detailUrl}
        draggable={false}
        className="relative block aspect-[16/11] w-full select-none overflow-hidden rounded-t-[24px] bg-[#e6edea]"
      >
        <Image
          src={imageUrl}
          alt={property.name}
          fill
          unoptimized
          draggable={false}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
          className="pointer-events-none object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            if (e.currentTarget.src.endsWith(FALLBACK_IMAGE)) return;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-[#3DA9BA] px-3.5 py-1.5 font-[var(--font-poppins)] text-[10.97px] font-medium leading-[1] text-white">
          {t("home.featured.forRentBadge")}
        </span>
      </Link>

      {/* Card Info */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <Link href={detailUrl} draggable={false} className="select-none hover:underline">
          <h4 className="line-clamp-1 font-[var(--font-manrope)] text-[17px] font-bold leading-[1.2] text-[#142d38] sm:text-[19px] lg:text-[21.94px] lg:leading-[24.93px]">
            {property.name}
          </h4>
        </Link>

        {/* Location Row */}
        <div className="mt-2.5 flex items-center gap-2 text-[12.5px] text-[#78888f] lg:text-[14px]">
          <Image
            src="/homepage/properties/icons/location.svg"
            alt=""
            width={14}
            height={14}
            className="size-3.5 shrink-0 lg:size-[18px]"
          />
          <span className="line-clamp-1">{location}</span>
        </div>

        {/* Type & Size Row */}
        <div className="mt-3 flex items-center justify-between text-[13px] text-[#78888f] lg:text-[15px]">
          <span>{typeName}</span>
          <span>{sizeLabel}</span>
        </div>

        {/* Price & Beds/Baths Row */}
        <div className="mt-4 flex items-center justify-between gap-2 pt-1">
          <span className="font-[var(--font-manrope)] text-[17px] font-bold leading-[1.2] text-black sm:text-[19px] lg:text-[21.94px] lg:leading-[24.93px]">
            {priceLabel}
          </span>
          <div className="flex items-center gap-2.5 text-[12px] text-[#78888f] lg:gap-4 lg:text-[15px]">
            <span className="flex items-center gap-1">
              <span>{property.bathroomNo || 1}</span>
              <Image
                src="/homepage/properties/icons/bath.svg"
                alt=""
                width={15}
                height={15}
                className="size-[15px] lg:size-[18px]"
              />
            </span>
            <span className="flex items-center gap-1">
              <span>{property.bedroomNo || 1}</span>
              <Image
                src="/homepage/properties/icons/bed.svg"
                alt=""
                width={15}
                height={15}
                className="size-[15px] lg:size-[18px]"
              />
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-5">
          <Link
            href={detailUrl}
            draggable={false}
            className="flex h-12 w-full select-none items-center justify-center rounded-[10px] bg-[#7FAEB9] font-[var(--font-poppins)] text-[14px] font-semibold text-white transition hover:bg-[#6fa0ab]"
          >
            {t("common.bookNow") || "Book Now"}
          </Link>
        </div>
      </div>
    </article>
  );
}