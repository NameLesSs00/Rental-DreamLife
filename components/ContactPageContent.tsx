"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import ContactForm from "./ContactForm";
import ContactMap from "./ContactMap";
import { useI18n } from "./I18nProvider";
import PageHero from "@/components/PageHero";
import { siteConfig } from "@/lib/site";

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

export default function ContactPageContent() {
  const { t, href } = useI18n();
  const shouldReduceMotion = useReducedMotion();

  const initial = shouldReduceMotion ? undefined : "hidden";
  const animate = shouldReduceMotion ? undefined : "visible";

  return (
    <main className="min-h-screen bg-[#F3F0E9] font-[var(--font-poppins)] text-[#183c2f]">
      {/* 1. Hero Banner: Unified PageHero with identical spacing and height */}
      <PageHero
        imageSrc="/contact/contact-hero.jpg"
        imageAlt={t("contact.heroTitle") || "Get in Touch"}
        title={t("contact.heroTitle") || "Get in Touch"}
        subtitle={t("contact.heroSubtitle") || "Our Team is ready to assist you."}
        priority
      />

      {/* Main Page Content aligned with max-w-[1536px] matching About and Blogs */}
      <div className="mx-auto w-full max-w-[1536px] px-4 pb-24 sm:px-6 sm:pb-28 lg:px-10">

        <nav
          aria-label="Breadcrumb"
          className="mt-8 mb-6 flex items-center gap-1.5 text-[14px] font-semibold text-[#142d38]"
        >
          <Link href={href("/")} className="hover:underline">
            {t("common.home") || "Home"}
          </Link>
          <span className="text-[#8a9a94]">/</span>
          <span className="text-[#718288]">{t("common.contact") || "Contact Us"}</span>
        </nav>

        {/* 2. Contact Methods Section */}
        <section className="mt-12 sm:mt-16">
          <h2 className="text-[26px] font-bold tracking-tight text-[#142d38] sm:text-[32px]">
            {t("contact.methodsTitle") || "Contact Methods :"}
          </h2>

          <motion.div
            variants={shouldReduceMotion ? undefined : container}
            initial={initial}
            whileInView={animate}
            viewport={{ once: true, amount: 0.2 }}
            className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {/* Card 1: Address */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col items-center text-center rounded-[24px] border border-black/5 bg-[#FFFFFF] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] sm:p-9"
            >
              <div className="mb-6 flex size-16 sm:size-18 items-center justify-center rounded-full bg-[#e8f1ee] text-[#183640]">
                <MapPin className="size-7 sm:size-8" strokeWidth={2.2} />
              </div>
              <h3 className="font-[var(--font-poppins)] text-[24px] font-semibold leading-[140%] tracking-[0%] text-[#183640]">
                {t("contact.offlineAddress") || "Address"}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#718288]">
                {t("footer.address") || siteConfig.address.label}
              </p>
            </motion.div>

            {/* Card 2: Phone & WhatsApp */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col items-center text-center rounded-[24px] border border-black/5 bg-[#FFFFFF] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] sm:p-9"
            >
              <div className="mb-6 flex size-16 sm:size-18 items-center justify-center rounded-full bg-[#e8f1ee] text-[#183640]">
                <Phone className="size-7 sm:size-8" strokeWidth={2.2} />
              </div>
              <h3 className="font-[var(--font-poppins)] text-[24px] font-semibold leading-[140%] tracking-[0%] text-[#183640]">
                {t("contact.phoneWhatsapp") || "Phone & WhatsApp"}
              </h3>
              <div className="mt-3 flex flex-col items-center gap-1.5 text-[14px] text-[#718288]">
                <a
                  href={`tel:${siteConfig.phone}`}
                  dir="ltr"
                  className="font-medium transition hover:text-[#183640] [unicode-bidi:isolate]"
                >
                  {siteConfig.displayPhone}
                </a>
                <a
                  href={siteConfig.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-[#183640] transition hover:text-[#25D366]"
                >
                  <span dir="ltr" className="[unicode-bidi:isolate]">{siteConfig.displayPhone}</span>
                  <span className="text-[#718288]">(WhatsApp)</span>
                </a>
              </div>
            </motion.div>

            {/* Card 3: Email */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col items-center text-center rounded-[24px] border border-black/5 bg-[#FFFFFF] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] sm:p-9 sm:col-span-2 lg:col-span-1"
            >
              <div className="mb-6 flex size-16 sm:size-18 items-center justify-center rounded-full bg-[#e8f1ee] text-[#183640]">
                <Mail className="size-7 sm:size-8" strokeWidth={2.2} />
              </div>
              <h3 className="font-[var(--font-poppins)] text-[24px] font-semibold leading-[140%] tracking-[0%] text-[#183640]">
                {t("contact.emailCard") || "Email"}
              </h3>
              <div className="mt-3 text-[14px] text-[#718288]">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="font-medium transition hover:text-[#183640]"
                >
                  {siteConfig.email}
                </a>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Horizontal Divider Line matching mockup */}
        <div className="my-12 h-[1px] w-full bg-[#dfd9cf] sm:my-16" />

        {/* 3. Send Us a Message Section with 2-Column Form & Map */}
        <section>
          <h2 className="mb-6 text-[26px] font-bold tracking-tight text-[#142d38] sm:text-[32px]">
            {t("contact.sendMessage") || "Send Us a Message"}
          </h2>

          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
            {/* Left: Contact Form Card */}
            <div className="min-w-0">
              <ContactForm />
            </div>

            {/* Right: Hurghada El Kawther Interactive Map */}
            <div className="min-w-0">
              <ContactMap />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
