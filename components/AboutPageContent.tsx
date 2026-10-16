"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/components/I18nProvider";

export default function AboutPageContent() {
  const { href, t } = useI18n();

  return (
    <main className="bg-[#fbfbf9] font-[var(--font-poppins)] text-[#183c2f]">
      {/* 1. Hero Section */}
      <AboutHero />

      <div className="mx-auto max-w-[1536px] px-4 pb-24 pt-6 sm:px-6 lg:px-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-[14px] font-semibold text-[#142d38]">
          <Link href={href("/")} className="hover:underline">
            {t("common.home") || "Home"}
          </Link>
          <span className="text-[#8a9a94]">/</span>
          <span className="text-[#718288]">{t("common.about") || "About Us"}</span>
        </nav>

        {/* 2. About Us Main Section */}
        <section className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-14">
          <div className="flex flex-col">
            <h1 className="text-[32px] font-extrabold leading-tight text-[#142d38] sm:text-[40px] lg:text-[46px]">
              About Us
            </h1>
            <p className="mt-5 text-[14px] leading-relaxed text-[#414847] sm:text-[15px] sm:leading-8">
              Discover new opportunities with our all-in-one real estate and holiday rental platform in Hurghada. We
              bring together a diverse selection of properties, from cozy holiday apartments and beachfront villas to
              long-term rental homes and real estate for sale. Whether you&apos;re searching for the perfect getaway, a
              place to call home, or a valuable investment on the Red Sea, we connect you with suitable properties and
              provide local assistance, personalized service, and convenient solutions tailored to your needs.
            </p>
          </div>
          <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[24px] shadow-sm bg-[#e8ecea]">
            <Image
              src="/about/about-living-room.png"
              alt="Hurghada Vacation Homes"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </section>

        {/* 3. Dark Stats Banner */}
        <section className="mt-14 sm:mt-20">
          <div className="rounded-[24px] bg-[#1c383f] px-6 py-10 sm:px-12 sm:py-14 text-white shadow-md">
            <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3 sm:gap-6">
              {/* Stat 1 */}
              <div className="flex flex-col items-center">
                <span className="text-[38px] font-bold tracking-tight text-[#62b4c4] sm:text-[46px]">
                  10,000+
                </span>
                <span className="mt-1 text-[17px] font-bold text-white">
                  Trusted Hosts
                </span>
                <p className="mt-1 max-w-[220px] text-[13px] text-white/80">
                  work with verified and reliable properties owners
                </p>
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col items-center">
                <span className="text-[38px] font-bold tracking-tight text-[#62b4c4] sm:text-[46px]">
                  4,500+
                </span>
                <span className="mt-1 text-[17px] font-bold text-white">
                  Curated Homes
                </span>
                <p className="mt-1 max-w-[220px] text-[13px] text-white/80">
                  From Cozy apartments to spacious Villas
                </p>
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col items-center">
                <span className="text-[38px] font-bold tracking-tight text-[#62b4c4] sm:text-[46px]">
                  98%
                </span>
                <span className="mt-1 text-[17px] font-bold text-white">
                  Guest-first Services
                </span>
                <p className="mt-1 max-w-[220px] text-[13px] text-white/80">
                  Real support, real people , real care
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Three Feature Cards */}
        <section className="mt-12 sm:mt-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-[24px] border border-[#e2e8e6] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <div className="grid size-12 place-items-center rounded-full bg-[#f0f3f2] text-[#1c383f]">
                <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h3 className="mt-5 text-[17px] font-bold text-[#142d38]">
                Carefully Selected Home
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#718288]">
                we handpick every property for quality comfort and a great location, so you can book with confidence
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-[24px] border border-[#e2e8e6] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <div className="grid size-12 place-items-center rounded-full bg-[#f0f3f2] text-[#1c383f]">
                <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <h3 className="mt-5 text-[17px] font-bold text-[#142d38]">
                Clear &amp; Honest Pricing
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#718288]">
                No hidden fees, no surprises. just straightforward prices and real value
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-[24px] border border-[#e2e8e6] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <div className="grid size-12 place-items-center rounded-full bg-[#f0f3f2] text-[#1c383f]">
                <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              </div>
              <h3 className="mt-5 text-[17px] font-bold text-[#142d38]">
                Personal Support
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#718288]">
                we handpick every property for quality comfort and a great location, so you can book with confidence
              </p>
            </div>
          </div>
        </section>

        {/* 5. Our People Section */}
        <section className="mt-14 sm:mt-24 grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-14">
          <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[24px] shadow-sm bg-[#e8ecea]">
            <Image
              src="/about/our-people.png"
              alt="Our People - The People Behind Your Perfect Stay"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[32px] font-extrabold leading-tight text-[#142d38] sm:text-[40px] lg:text-[46px]">
              Our People
            </h2>
            <h3 className="mt-3 text-[17px] font-bold text-[#142d38] sm:text-[19px]">
              The People Behind Your Perfect Stay
            </h3>
            <p className="mt-4 text-[14px] leading-relaxed text-[#414847] sm:text-[15px] sm:leading-8">
              Behind every great experience is a dedicated team. Our local team in Hurghada is passionate about helping
              travelers, property seekers, and homeowners find the right solutions for their needs. From discovering the
              perfect holiday rental to exploring properties for sale, we focus on providing personal attention, reliable
              information, and friendly support at every step.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function AboutHero() {
  return (
    <section className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6">
      <div className="relative h-[280px] sm:h-[360px] md:h-[420px] lg:h-[480px] w-full overflow-hidden rounded-[20px] sm:rounded-[28px] shadow-sm">
        <Image
          src="/about/about-hero.png"
          alt="A Better Way To Feel At Home"
          fill
          priority
          sizes="(max-width: 1536px) 100vw, 1536px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-transparent flex items-center p-6 sm:p-12 lg:p-16">
          <div className="max-w-2xl">
            <h1 className="text-[28px] sm:text-[42px] lg:text-[52px] font-extrabold leading-[1.12] text-white tracking-tight drop-shadow-xs">
              A Better Way To<br />
              Feel At Home
            </h1>
            <p className="mt-3 sm:mt-4 max-w-[480px] text-[13.5px] sm:text-[15.5px] leading-relaxed text-white/95 font-medium drop-shadow-xs">
              We Connect you with handpicked homes and seamless rental experience, whatever you want to be.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
