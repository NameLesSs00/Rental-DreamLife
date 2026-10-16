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
}

const TOP_ROW_LOCATIONS: LocationCardData[] = [
  {
    id: "el-fayrouz",
    name: "El Fayrouz",
    image: "/homepage/locations/photo-el-fayrouz.png",
    slug: "El Fayrouz",
  },
  {
    id: "el-sahel",
    name: "El Sahel",
    image: "/homepage/locations/photo-el-sahel.png",
    slug: "El Sahel",
  },
  {
    id: "sahl-hasheesh",
    name: "Sahl Hasheesh",
    image: "/homepage/locations/photo-sahl-hasheesh.png",
    slug: "Sahl Hasheesh",
  },
];

const BOTTOM_ROW_LOCATIONS: LocationCardData[] = [
  {
    id: "el-gona",
    name: "ElGona",
    image: "/homepage/locations/photo-el-gouna.png",
    slug: "ElGona",
  },
  {
    id: "titanic-area",
    name: "Titanic Area",
    image: "/homepage/locations/photo-titanic-area.png",
    slug: "Titanic Area",
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
          {/* Top Row: 3 Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TOP_ROW_LOCATIONS.map((loc, idx) => (
              <LocationCard
                key={loc.id}
                item={loc}
                index={idx}
                aspectRatioClass="aspect-[400/286]"
                hrefUrl={href(`/rent?location=${encodeURIComponent(loc.slug)}`)}
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
                aspectRatioClass="aspect-[616/318]"
                hrefUrl={href(`/rent?location=${encodeURIComponent(loc.slug)}`)}
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
}: {
  item: LocationCardData;
  index: number;
  aspectRatioClass: string;
  hrefUrl: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -5 }}
      className="group relative"
    >
      <Link
        href={hrefUrl}
        className={`relative block w-full ${aspectRatioClass} overflow-hidden rounded-[26px] bg-[#0c2434] shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-shadow duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.22)]`}
      >
        {/* Real photo asset extracted from reference */}
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Real CSS Dark Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-300 group-hover:opacity-95" />

        {/* Card Content: Real HTML Text & Separate Real SVG Icon */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5 sm:p-6 lg:p-7">
          <h3 className="text-[20px] font-bold tracking-normal text-[#FFFFFF] sm:text-[23px] lg:text-[26px]">
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
