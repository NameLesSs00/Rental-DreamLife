"use client";

import Link from "next/link";
import { useFaqs } from "@/lib/hooks/useFaq";
import FaqAccordion from "./FaqAccordion";
import { motion } from "framer-motion";
import { useI18n } from "./I18nProvider";

export default function FaqSection() {
  const { href, locale, t } = useI18n();
  const { data, isLoading, isError } = useFaqs(
    {
      IsPublished: true,
      PageNumber: 1,
      PageSize: 10,
      SortBy: "displayOrder",
      IsDescending: false,
    },
    locale
  );

  const faqs = data?.items ?? [];

  return (
    <section className="bg-[#b3cbca] px-5 py-14 font-[var(--font-poppins)] sm:px-8 sm:py-18 lg:px-14 lg:py-20">
      <div className="mx-auto max-w-[1320px]">
        {/* Grid rather than flex: the CTA has to sit under the heading on desktop but
            AFTER the accordion on mobile. Explicit col/row placement handles desktop,
            while plain DOM order handles mobile — no `order` overrides to fight. */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-x-12 lg:gap-y-0 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-x-16">
          {/* Heading + Description — first on mobile, top-left on desktop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-start-1 lg:row-start-1"
          >
            <h2 className="text-[36px] sm:text-[44px] font-extrabold tracking-tight text-[#183640]">
              {t("common.faq") || "FAQ"}
            </h2>
            <p className="mt-2 text-[14px] sm:text-[15px] leading-relaxed text-[#456167]">
              {t("faq.pageBody") ||
                "Find clear answers to common questions about our properties, services, and real-estate process."}
            </p>
          </motion.div>

          {/* Accordion — second on mobile, right column on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1"
          >
            {isLoading ? (
              <div className="h-[340px] animate-pulse rounded-2xl sm:rounded-3xl bg-white/70" />
            ) : isError ? (
              <div className="flex h-[200px] flex-col items-center justify-center rounded-2xl sm:rounded-3xl bg-white/70 p-6 text-center text-[#456167]">
                <p className="font-semibold text-[#183640]">{t("faq.failed") || "Unable to load FAQs right now."}</p>
              </div>
            ) : faqs.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center rounded-2xl sm:rounded-3xl bg-white/70 p-6 text-center text-[#456167]">
                <p>{t("faq.emptyYet") || "No FAQs have been published yet."}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <FaqAccordion items={faqs} />
                <div className="flex justify-end pt-1">
                  <Link
                    href={href("/faq")}
                    className="text-[14px] font-semibold text-[#183640] underline-offset-4 hover:underline"
                  >
                    {t("faq.viewAll") || "View all FAQs"} &rarr;
                  </Link>
                </div>
              </div>
            )}
          </motion.div>

          {/* Still need A Help ? Card — last on mobile, under the heading on desktop.
              `lg:gap-y-0` + `items-start` keep it snug under the heading instead of
              stretching down its tall grid row. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="mt-8 sm:mt-10 lg:col-start-1 lg:row-start-2"
          >
            <div className="rounded-2xl bg-[#f8faf9] p-6 text-center shadow-xs sm:p-7">
              <h3 className="text-[18px] font-bold text-[#183640] sm:text-[20px]">
                {t("faq.stillQuestions") || "Still have questions?"}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[#667c74]">
                {t("faq.contactBody") ||
                  "Send us a message and our local team will help you choose the right stay or transfer."}
              </p>
              <Link
                href={href("/contact")}
                className="mt-5 block w-full rounded-xl bg-[#183640] py-3 text-center text-[14px] font-semibold text-white shadow-xs transition hover:bg-[#11262d] sm:text-[15px]"
              >
                {t("common.contact") || "Contact Us"}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
