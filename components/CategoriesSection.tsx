"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Bath, Bed, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "./I18nProvider";
import { usePublicBuyProperties } from "@/lib/hooks/usePropertyBuying";
import { API_BASE_URL } from "@/lib/api/config";
import { slugify } from "@/lib/utils/slugify";
import { formatCurrency } from "@/lib/utils/currency";
import { getPropertyTypeLabel } from "@/lib/utils/propertyUtils";
import type { PropertyBuyingListItem } from "@/lib/types/propertyBuying";

export default function CategoriesSection() {
  const { href } = useI18n();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError } = usePublicBuyProperties({ pageSize: 4 });

  const properties: PropertyBuyingListItem[] = data?.items ?? [];

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 300;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative z-20 flex w-full flex-col items-center bg-[#8FBAC4] px-4 pt-28 pb-16 font-[var(--font-poppins)] sm:px-6 sm:pt-32 sm:pb-20 lg:px-10 lg:pt-36">
      <div className="mx-auto w-full max-w-[1280px] rounded-[24px] bg-[#f3efe6] p-6 shadow-sm sm:p-8 lg:p-10">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 text-center sm:gap-4">
            <span className="h-[2px] w-7 rounded-full bg-[#2a6d77] sm:w-11" />
            <h2 className="text-[22px] font-bold text-[#2a6d77] sm:text-[26px] lg:text-[28px]">
              Best Selling Properties
            </h2>
            <span className="h-[2px] w-7 rounded-full bg-[#2a6d77] sm:w-11" />
          </div>

          <p className="mx-auto mt-2.5 max-w-[620px] text-[13px] font-normal leading-relaxed text-[#4a6b74] sm:text-[14px]">
            Explore properties that stand out for their location, quality, and long-term value.
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-8 flex items-stretch gap-4 overflow-x-auto pb-4 sm:mt-10 sm:gap-5 lg:overflow-visible lg:pb-0 xl:gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-1 min-w-[240px] flex-col overflow-hidden rounded-[16px] border border-black/5 bg-white p-4 shadow-[0_6px_24px_rgba(0,0,0,0.06)] animate-pulse"
              >
                <div className="h-[175px] w-full rounded-[12px] bg-[#e0ded8] sm:h-[185px]" />
                <div className="mt-4 h-4 w-3/4 rounded bg-[#e0ded8]" />
                <div className="mt-2 h-3 w-1/2 rounded bg-[#e0ded8]" />
                <div className="mt-4 h-4 w-full rounded bg-[#e0ded8]" />
                <div className="mt-4 h-[38px] w-full rounded-[8px] bg-[#e0ded8]" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="my-10 flex flex-col items-center justify-center py-8 text-center">
            <p className="text-[15px] font-medium text-[#2a6d77]">
              Unable to load properties right now.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && properties.length === 0 && (
          <div className="my-10 flex flex-col items-center justify-center py-8 text-center">
            <p className="text-[15px] font-medium text-[#2a6d77]">
              No properties available at the moment.
            </p>
          </div>
        )}

        {/* 4 Cards Auto Flex Container */}
        {!isLoading && !isError && properties.length > 0 && (
          <div
            ref={scrollContainerRef}
            className="mt-8 flex items-stretch gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-10 sm:gap-5 lg:overflow-visible lg:pb-0 xl:gap-6 [&::-webkit-scrollbar]:hidden"
          >
            {properties.map((property) => {
              const cleanBase = API_BASE_URL.replace(/\/+$/, "");
              const imageSrc = property.coverImageUrl
                ? `${cleanBase}/${property.coverImageUrl.replace(/^\/+/, "")}`
                : "";

              // The list API returns flat `areaName` and `city` fields (no nested address object)
              const locationText = [property.areaName?.trim(), property.city?.trim()]
                .filter(Boolean)
                .join(", ");

              const categoryName =
                property.category?.name ||
                getPropertyTypeLabel(property.propertyTypeId);

              const priceText = formatCurrency(
                property.price,
                property.currency || "USD"
              );

              const propertyUrl = href(
                `/buy/${property.id || slugify(property.title || "")}`
              );

              return (
                <article
                  key={property.id}
                  className="group flex flex-1 min-w-[240px] flex-col overflow-hidden rounded-[16px] border border-black/5 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
                >
                  {/* Card Image */}
                  <div className="relative h-[175px] w-full overflow-hidden bg-[#e0ded8] sm:h-[185px]">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={property.title || "Property"}
                        fill
                        unoptimized
                        sizes="(min-width: 1280px) 275px, (min-width: 1024px) 220px, (min-width: 640px) 270px, 260px"
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#e0ded8] text-[#78888f] text-[13px]">
                        No image
                      </div>
                    )}

                    {/* Badge */}
                    <div className="absolute right-3 top-3 rounded-full bg-[#7faeb9] px-3 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                      For Sale
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-4 sm:p-4.5">
                    <h3 className="truncate text-[16px] font-bold text-[#14323c] sm:text-[17px]">
                      {property.title}
                    </h3>

                    {/* Location */}
                    <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#78888f]">
                      <MapPin className="size-3.5 shrink-0 text-[#7faeb9]" />
                      <span className="truncate">{locationText}</span>
                    </div>

                    {/* Category & Area */}
                    <div className="mt-3 flex items-center justify-between text-[12px] text-[#78888f]">
                      <span className="font-medium">{categoryName}</span>
                      <span>{property.area ? `${property.area} m²` : "-"}</span>
                    </div>

                    {/* Price & Specs */}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[16px] font-extrabold text-[#14323c] sm:text-[17px]">
                        {priceText}
                      </span>

                      <div className="flex items-center gap-2.5 text-[12px] font-medium text-[#78888f]">
                        <span className="inline-flex items-center gap-1">
                          <span>{property.bathrooms ?? 0}</span>
                          <Bath className="size-3.5 text-[#78888f]" />
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span>{property.bedrooms ?? 0}</span>
                          <Bed className="size-3.5 text-[#78888f]" />
                        </span>
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <Link
                      href={propertyUrl}
                      className="mt-4 flex h-[38px] w-full items-center justify-center rounded-[8px] bg-[#7faeb9] text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#6fa0ab] active:scale-98"
                    >
                      Book Now
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom Actions: View more (left) & Carousel Arrows (right) */}
        <div className="mt-8 flex items-center justify-between sm:mt-10">
          <Link
            href={href("/buy")}
            className="inline-flex h-[42px] items-center justify-center rounded-[8px] bg-[#163640] px-7 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#10272e] active:scale-98"
          >
            View more
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Previous properties"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-[#163640] shadow-sm transition hover:bg-black/5 active:scale-95"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Next properties"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-[#163640] shadow-sm transition hover:bg-black/5 active:scale-95"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

