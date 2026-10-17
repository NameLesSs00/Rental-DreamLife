"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "./I18nProvider";

interface LocationCardData {
  id: string;
  name: string;
  image: string;
  slug: string;
  categoryId: string;
}

const TOP_ROW_LOCATIONS: LocationCardData[] = [
  {
    id: "el-fayrouz",
    name: "El Fayrouz",
    image: "/homepage/locations/el-fayrouz.jpg",
    slug: "El Fayrouz",
    categoryId: "97f2f50d-8de5-4071-a100-d2a929b91d88",
  },
  {
    id: "el-sahel",
    name: "El Sahel",
    image: "/homepage/locations/el-sahel.jpg",
    slug: "El Sahel",
    categoryId: "16868148-3381-445a-91e9-c82bd521aed0",
  },
  {
    id: "sahl-hasheesh",
    name: "Sahl Hasheesh",
    image: "/homepage/locations/sahl-hasheesh.jpg",
    slug: "Sahl Hasheesh",
    categoryId: "bfa0cddd-6751-4743-9763-43ecadb2ae3b",
  },
];

const BOTTOM_ROW_LOCATIONS: LocationCardData[] = [
  {
    id: "el-gona",
    name: "ElGona",
    image: "/homepage/locations/el-gona.jpg",
    slug: "ElGona",
    categoryId: "bac6e60e-6dae-4ca6-b84b-ececcd74e0eb",
  },
  {
    id: "titanic-area",
    name: "Titanic Area",
    image: "/homepage/locations/titanic-area.jpg",
    slug: "Titanic Area",
    categoryId: "61ee8e7b-1f6d-4510-898f-13cf6f33eec6",
  },
];

export default function BestLocationsSection() {
  const { href } = useI18n();

  return (
    <section className="relative overflow-hidden bg-[#DDFDFE] px-5 py-14 font-[var(--font-poppins)] sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-20">
      <div className="mx-auto max-w-[1360px]">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto flex max-w-[760px] flex-col items-center text-center"
        >
          <h2 className="text-[30px] font-bold leading-tight tracking-tight sm:text-[36px] lg:text-[42px]">
            <span className="text-[#000000]">Explore </span>
            <span className="text-[#2B7F9B]">Locations</span>
          </h2>
          <p className="mt-3.5 max-w-[560px] text-[15px] font-normal leading-relaxed text-[#000000] sm:text-[16px]">
            Enjoy the most beautiful areas, stretching from south of Hurghada to the north.
          </p>
        </motion.div>

        {/* Locations Grid */}
        <div className="mt-10 space-y-6 sm:mt-12 lg:mt-14">
          {/* Top Row: 3 Cards
              Between `sm` and `lg` the row is 2-up, which would leave the 3rd card
              orphaned beside a dead gap. It spans the full 2-col width instead, and
              uses the wider aspect so it reads as a feature card rather than a
              487px-tall slab. At `lg` it collapses back into the 3-across row. */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TOP_ROW_LOCATIONS.map((loc, idx) => (
              <LocationCard
                key={loc.id}
                item={loc}
                index={idx}
                className={idx === 2 ? "sm:col-span-2 lg:col-span-1" : undefined}
                aspectRatioClass={
                  idx === 2
                    ? "aspect-[4/3] sm:aspect-[616/340] lg:aspect-[400/290]"
                    : "aspect-[4/3] sm:aspect-[400/290]"
                }
                hrefUrl={href(`/rent?CategoryId=${loc.categoryId}&location=${encodeURIComponent(loc.name)}`)}
              />
            ))}
          </div>

          {/* Bottom Row: 2 Wider Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {BOTTOM_ROW_LOCATIONS.map((loc, idx) => (
              <LocationCard
                key={loc.id}
                item={loc}
                index={idx + 3}
                aspectRatioClass="aspect-[16/10] sm:aspect-[616/340]"
                hrefUrl={href(`/rent?CategoryId=${loc.categoryId}&location=${encodeURIComponent(loc.name)}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LocationCard({
  item,
  index,
  aspectRatioClass,
  hrefUrl,
  className,
}: {
  item: LocationCardData;
  index: number;
  aspectRatioClass: string;
  hrefUrl: string;
  className?: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -5 }}
      className={`group relative ${className ?? ""}`}
    >
      <Link
        href={hrefUrl}
        style={{ boxShadow: "0px 2px 40px 5px rgba(0, 0, 0, 0.40)" }}
        className={`relative block w-full ${aspectRatioClass} overflow-hidden rounded-[26px] bg-[#0c2434] transition-all duration-300 hover:scale-[1.01]`}
      >
        {/* Full-size high resolution photo */}
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (min-width: 1024px) 33vw, 100vw"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Filter overlay matching exact Figma linear gradient */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 group-hover:opacity-95"
          style={{
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0) 36.54%, rgba(16, 31, 98, 0.4) 62.61%, rgba(1, 0, 43, 0.85) 88.18%)",
          }}
        />

        {/* Card Content */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-5 pt-3 pb-3 sm:px-6 sm:pb-4 lg:px-7 lg:pb-4">
          <h3 className="font-semibold text-[22px] sm:text-[26px] lg:text-[32px] leading-tight tracking-normal text-[#FFFFFF]">
            {item.name}
          </h3>

          <div
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#95D3DE] text-[#000000] shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-[#a5e3ec]"
          >
            <svg
              className="size-5 transition-transform duration-300 group-hover:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
