"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { MapPin, Bath, Bed, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "./I18nProvider";
import { usePublicBuyProperties } from "@/lib/hooks/usePropertyBuying";
import { useSelectedCurrency } from "@/lib/hooks/useSelectedCurrency";
import { API_BASE_URL } from "@/lib/api/config";
import { slugify } from "@/lib/utils/slugify";
import { formatPriceInfo } from "@/lib/utils/currency";
import { getPropertyTypeLabel } from "@/lib/utils/propertyUtils";
import type { PropertyBuyingListItem } from "@/lib/types/propertyBuying";

const FALLBACK_IMAGE = "/rent/property-card.png";

export default function CategoriesSection() {
  const { href, t, isRtl } = useI18n();
  const [currency] = useSelectedCurrency();

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxDrag, setMaxDrag] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // `Currency` tells the API which currency to price in — same call as the /buy page.
  const { data, isLoading, isError } = usePublicBuyProperties({
    pageSize: 6,
    Currency: currency,
  });

  const properties: PropertyBuyingListItem[] = data?.items ?? [];

  // Recalculate drag constraints when container or track size changes
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
    const step = card ? card.offsetWidth + 20 : 320;
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
        {/* Section Heading: centred title with side dashes */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-4 sm:gap-5 lg:gap-7">
            <span className="h-[3px] w-8 shrink-0 rounded-full bg-[#2C798B] sm:h-[4px] sm:w-12 lg:h-[5px] lg:w-[36px]" />
            <h2 className="break-words font-[var(--font-poppins)] text-[22px] font-semibold leading-[1.15] tracking-[0%] text-[#2C798B] sm:text-[28px] lg:text-[35px]">
              {t("home.featured.bestSellingTitle")}
            </h2>
            <span className="h-[3px] w-8 shrink-0 rounded-full bg-[#2C798B] sm:h-[4px] sm:w-12 lg:h-[5px] lg:w-[36px]" />
          </div>

          <p className="mx-auto mt-4 max-w-[640px] font-[var(--font-poppins)] text-[13.5px] font-normal leading-[1.7] tracking-[0%] text-[#2C798B] sm:mt-5 sm:text-[16.58px] sm:leading-[36.84px]">
            {t("home.featured.bestSellingDescription")}
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-8 flex items-stretch gap-5 overflow-x-auto pb-4 sm:mt-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-[0_0_85%] animate-pulse flex-col overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.06)] sm:flex-[0_0_calc(50%-10px)] lg:flex-[0_0_calc(33.333%-13.333px)] xl:flex-[0_0_calc(25%-15px)]"
              >
                <div className="aspect-[16/11] w-full bg-[#e0ded8]" />
                <div className="p-5 sm:p-6">
                  <div className="h-5 w-3/4 rounded bg-[#e0ded8]" />
                  <div className="mt-2.5 h-3 w-1/2 rounded bg-[#e0ded8]" />
                  <div className="mt-4 h-3 w-full rounded bg-[#e0ded8]" />
                  <div className="mt-4 h-6 w-2/5 rounded bg-[#e0ded8]" />
                  <div className="mt-5 h-12 w-full rounded-[10px] bg-[#e0ded8]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="my-10 flex flex-col items-center justify-center py-8 text-center">
            <p className="text-[15px] font-medium text-[#2C798B]">
              Unable to load properties right now.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && properties.length === 0 && (
          <div className="my-10 flex flex-col items-center justify-center py-8 text-center">
            <p className="text-[15px] font-medium text-[#2C798B]">
              No properties available at the moment.
            </p>
          </div>
        )}

        {/* Cards Carousel */}
        {!isLoading && !isError && properties.length > 0 && (
          <div
            ref={containerRef}
            onClickCapture={(e) => {
              if (isDraggingRef.current) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            className="mt-8 w-full overflow-hidden sm:mt-10"
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
              {properties.map((property) => {
                const cleanBase = API_BASE_URL.replace(/\/+$/, "");
                const imageSrc = property.coverImageUrl
                  ? `${cleanBase}/${property.coverImageUrl.replace(/^\/+/, "")}`
                  : FALLBACK_IMAGE;

                // The list API returns flat `areaName` and `city` fields (no nested address object)
                const locationText = [property.areaName?.trim(), property.city?.trim()]
                  .filter(Boolean)
                  .join(", ");

                const categoryName =
                  property.category?.name || getPropertyTypeLabel(property.propertyTypeId);

                // Same pricing helper as the /buy page — respects the selected currency.
                const priceText = formatPriceInfo(
                  property.priceInfo,
                  property.price,
                  property.priceInfo?.currency || currency || property.currency || "USD"
                );

                // Carry `id` + `Currency` so the detail page resolves instantly and keeps the currency.
                const propertyUrl = href(
                  `/buy/${slugify(property.title) || "property"}?id=${property.id}&Currency=${currency}`
                );

                return (
                  <article
                    key={property.id}
                    data-card
                    className="group flex flex-[0_0_85%] shrink-0 flex-col overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] sm:flex-[0_0_calc(50%-10px)] lg:flex-[0_0_calc(33.333%-13.333px)] xl:flex-[0_0_calc(25%-15px)]"
                  >
                  {/* Card Image */}
                  <div className="relative">
                    <Link
                      href={propertyUrl}
                      draggable={false}
                      className="relative block aspect-[16/11] w-full cursor-inherit select-none overflow-hidden bg-[#e0ded8]"
                    >
                      <Image
                        src={imageSrc}
                        alt={property.title || "Property"}
                        fill
                        unoptimized
                        draggable={false}
                        sizes="(min-width: 1280px) 275px, (min-width: 1024px) 220px, (min-width: 640px) 270px, 260px"
                        className="pointer-events-none object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          // Guard against a cover URL that 404s — not just a missing one.
                          if (e.currentTarget.src.endsWith(FALLBACK_IMAGE)) return;
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    </Link>

                    {/* For Sale Badge */}
                    <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-[#3DA9BA] px-3.5 py-1.5 font-[var(--font-poppins)] text-[10.97px] font-medium leading-[1] text-white">
                      {t("home.featured.forSaleBadge")}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="truncate font-[var(--font-manrope)] text-[17px] font-bold leading-[1.2] text-[#142d38] sm:text-[19px] lg:text-[21.94px] lg:leading-[24.93px]">
                      {property.title}
                    </h3>

                    {/* Location */}
                    <div className="mt-2.5 flex items-center gap-2 text-[12.5px] text-[#78888f] lg:text-[14px]">
                      <MapPin className="size-3.5 shrink-0 text-[#2C798B] lg:size-[18px]" />
                      <span className="truncate">{locationText}</span>
                    </div>

                    {/* Category & Area */}
                    <div className="mt-3 flex items-center justify-between text-[13px] text-[#78888f] lg:text-[15px]">
                      <span className="font-medium">{categoryName}</span>
                      <span>{property.area ? `${property.area} m²` : "-"}</span>
                    </div>

                    {/* Price & Specs */}
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="font-[var(--font-manrope)] text-[17px] font-bold leading-[1.2] text-black sm:text-[19px] lg:text-[21.94px] lg:leading-[24.93px]">
                        {priceText}
                      </span>

                      <div className="flex items-center gap-2.5 text-[12px] font-medium text-[#78888f] lg:gap-4 lg:text-[15px]">
                        <span className="inline-flex items-center gap-1">
                          <span>{property.bathrooms ?? 0}</span>
                          <Bath className="size-3.5 text-[#78888f] lg:size-[18px]" />
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span>{property.bedrooms ?? 0}</span>
                          <Bed className="size-3.5 text-[#78888f] lg:size-[18px]" />
                        </span>
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <Link
                      href={propertyUrl}
                      draggable={false}
                      className="mt-5 flex h-12 w-full cursor-inherit select-none items-center justify-center rounded-[10px] bg-[#7FAEB9] font-[var(--font-poppins)] text-[14px] font-semibold text-white transition hover:bg-[#6fa0ab]"
                    >
                      {t("home.featured.viewDetails")}
                    </Link>
                  </div>
                </article>
              );
            })}
            </motion.div>
          </div>
        )}

        {/* Bottom Actions: View more (left) & Carousel Arrows (right) */}
        <div className="mt-8 flex items-center justify-between gap-4 sm:mt-10">
          <Link
            href={href("/buy")}
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