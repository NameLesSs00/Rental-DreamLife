"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Home, ShieldCheck, Headphones } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import PageHero from "@/components/PageHero";

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: smoothEase },
  },
};

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export default function AboutPageContent() {
  const { href, t, locale } = useI18n();
  const shouldReduceMotion = useReducedMotion();

  const initial = shouldReduceMotion ? undefined : "hidden";
  const animate = shouldReduceMotion ? undefined : "visible";

  return (
    <main className="min-h-screen bg-[#F3F0E9] font-[var(--font-poppins)] text-[#183c2f]">
      {/* 1. Hero Section: Unified PageHero */}
      <PageHero
        imageSrc="/about/hero-about.png"
        imageAlt={t("about.heroTitle") || "A Better Way To Feel At Home"}
        title={
          locale === "en" ? (
            <>
              A Better Way To<br />
              Feel At Home
            </>
          ) : (
            t("about.heroTitle") || "A Better Way To Feel At Home"
          )
        }
        subtitle={
          t("about.heroSubtitle") ||
          "We Connect you with handpicked homes and seamless rental experience, whatever you want to be."
        }
        maxTitleWidth="max-w-[560px]"
        maxSubtitleWidth="max-w-[620px]"
        priority
      />

      {/* Main Page Content aligned with max-w-[1536px] */}
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
          <span className="text-[#718288]">{t("common.about") || "About Us"}</span>
        </nav>

        {/* 2. About Us Main Section (2 Columns: Text Left + Living Room Image Right) */}
        <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          <motion.div
            variants={fadeUp}
            initial={initial}
            whileInView={animate}
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col"
          >
            <h2 className="text-[34px] font-bold tracking-tight text-[#142d38] sm:text-[42px] lg:text-[48px]">
              {t("about.aboutUsTitle") || "About Us"}
            </h2>
            <p className="mt-5 font-[var(--font-poppins)] text-[16px] font-normal leading-[150%] tracking-[0%] text-[#000000] sm:text-[18px] lg:text-[20px]">
              {t("about.aboutUsBody") ||
                "Discover new opportunities with our all-in-one real estate and holiday rental platform in Hurghada. We bring together a diverse selection of properties, from cozy holiday apartments and beachfront villas to long-term rental homes and real estate for sale. Whether you're searching for the perfect getaway, a place to call home, or a valuable investment on the Red Sea, we connect you with suitable properties and provide local assistance, personalized service, and convenient solutions tailored to your needs."}
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial={initial}
            whileInView={animate}
            viewport={{ once: true, amount: 0.2 }}
            className="relative aspect-[16/11] w-full overflow-hidden rounded-[24px] border border-black/5 bg-[#e8ecea] shadow-md sm:rounded-[32px]"
          >
            <Image
              src="/about/about-living-room.png"
              alt="Hurghada Vacation Homes Living Room"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </section>

        {/* 3. Dark Stats Banner (#14333b) */}
        <motion.section
          variants={fadeUp}
          initial={initial}
          whileInView={animate}
          viewport={{ once: true, amount: 0.2 }}
          className="mt-14 sm:mt-20"
        >
          <div className="rounded-[24px] bg-[#14333b] px-6 py-12 text-white shadow-md sm:rounded-[32px] sm:px-12 sm:py-16">
            <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3 sm:gap-6  sm:divide-white/10">
              {/* Stat 1 */}
              <div className="flex flex-col items-center">
                <span className="text-[42px] font-bold tracking-tight text-[#3ca3b5] sm:text-[50px]">
                  {t("about.statsBanner.stat1Count") || "10,000+"}
                </span>
                <span className="mt-1 text-[19px] font-bold text-white">
                  {t("about.statsBanner.stat1Title") || "Trusted Hosts"}
                </span>
                <p className="mt-1 max-w-[240px] text-[13.5px] text-white/80">
                  {t("about.statsBanner.stat1Desc") ||
                    "work with verified and reliable properties owners"}
                </p>
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col items-center">
                <span className="text-[42px] font-bold tracking-tight text-[#3ca3b5] sm:text-[50px]">
                  {t("about.statsBanner.stat2Count") || "4,500+"}
                </span>
                <span className="mt-1 text-[19px] font-bold text-white">
                  {t("about.statsBanner.stat2Title") || "Curated Homes"}
                </span>
                <p className="mt-1 max-w-[240px] text-[13.5px] text-white/80">
                  {t("about.statsBanner.stat2Desc") ||
                    "From Cozy apartments to spacious Villas"}
                </p>
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col items-center">
                <span className="text-[42px] font-bold tracking-tight text-[#3ca3b5] sm:text-[50px]">
                  {t("about.statsBanner.stat3Count") || "98%"}
                </span>
                <span className="mt-1 text-[19px] font-bold text-white">
                  {t("about.statsBanner.stat3Title") || "Guest-first Services"}
                </span>
                <p className="mt-1 max-w-[240px] text-[13.5px] text-white/80">
                  {t("about.statsBanner.stat3Desc") ||
                    "Real support, real people , real care"}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 4. Three White Feature Cards (Carefully Selected Home, Clear & Honest Pricing, Personal Support) */}
        <section className="mt-12 sm:mt-16">
          <motion.div
            variants={shouldReduceMotion ? undefined : container}
            initial={initial}
            whileInView={animate}
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {/* Card 1 */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col rounded-[24px] border border-black/5 bg-[#FFFFFF] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] sm:p-9"
            >
              <div className="mb-6 flex size-14 items-center justify-center rounded-full bg-[#f0f4f2] text-[#14333b]">
                <Home className="size-7" strokeWidth={2} />
              </div>
              <h3 className="text-[20px] font-bold text-[#142d38]">
                {t("about.featuresList.card1Title") || "Carefully Selected Home"}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#718288]">
                {t("about.featuresList.card1Desc") ||
                  "we handpick every property for quality comfort and a great location, so you can book with confidence"}
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col rounded-[24px] border border-black/5 bg-[#FFFFFF] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] sm:p-9"
            >
              <div className="mb-6 flex size-14 items-center justify-center rounded-full bg-[#f0f4f2] text-[#14333b]">
                <ShieldCheck className="size-7" strokeWidth={2} />
              </div>
              <h3 className="text-[20px] font-bold text-[#142d38]">
                {t("about.featuresList.card2Title") || "Clear & Honest Pricing"}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#718288]">
                {t("about.featuresList.card2Desc") ||
                  "No hidden fees, no surprises. just straightforward prices and real value"}
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col rounded-[24px] border border-black/5 bg-[#FFFFFF] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] sm:p-9 sm:col-span-2 lg:col-span-1"
            >
              <div className="mb-6 flex size-14 items-center justify-center rounded-full bg-[#f0f4f2] text-[#14333b]">
                <Headphones className="size-7" strokeWidth={2} />
              </div>
              <h3 className="text-[20px] font-bold text-[#142d38]">
                {t("about.featuresList.card3Title") || "Personal Support"}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#718288]">
                {t("about.featuresList.card3Desc") ||
                  "we handpick every property for quality comfort and a great location, so you can book with confidence"}
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* 5. Our People Section (Image Left + Text Right) */}
        <section className="mt-16 sm:mt-24 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          <motion.div
            variants={fadeUp}
            initial={initial}
            whileInView={animate}
            viewport={{ once: true, amount: 0.2 }}
            className="relative aspect-[16/11] w-full overflow-hidden rounded-[24px] border border-black/5 bg-[#e8ecea] shadow-md sm:rounded-[32px]"
          >
            <Image
              src="/about/our-people.png"
              alt={t("about.ourPeopleTitle") || "Our People"}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial={initial}
            whileInView={animate}
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col"
          >
            <h2 className="text-[34px] font-bold tracking-tight text-[#142d38] sm:text-[42px] lg:text-[48px]">
              {t("about.ourPeopleTitle") || "Our People"}
            </h2>
            <h3 className="mt-3 text-[20px] font-bold text-[#183640] sm:text-[22px]">
              {t("about.ourPeopleSubtitle") || "The People Behind Your Perfect Stay"}
            </h3>
            <p className="mt-4 text-[15px] sm:text-[17px] leading-[1.65] text-[#33464f]">
              {t("about.ourPeopleBody") ||
                "Behind every great experience is a dedicated team. Our local team in Hurghada is passionate about helping travelers, property seekers, and homeowners find the right solutions for their needs. From discovering the perfect holiday rental to exploring properties for sale, we focus on providing personal attention, reliable information, and friendly support at every step."}
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
