"use client";

import Link from "next/link";
import { useFaqs } from "@/lib/hooks/useFaq";
import FaqAccordion from "./FaqAccordion";
import { motion } from "framer-motion";
import { useI18n } from "./I18nProvider";
import type { FaqItem } from "@/lib/types/faq";

const fallbackFaqs: FaqItem[] = [
  {
    id: "faq-1",
    question: "What types of properties do you offer?",
    answer: "We offer a wide range of properties including luxury villas, modern apartments, chalets, and studios across prime locations in Hurghada and the Red Sea.",
    displayOrder: 1,
    isPublished: true,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: new Date().toISOString(),
  },
  {
    id: "faq-2",
    question: "Can you help me find a property within my budget?",
    answer: "Yes, our team works closely with you to understand your budget and find the best properties that deliver exceptional quality and value.",
    displayOrder: 2,
    isPublished: true,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: new Date().toISOString(),
  },
  {
    id: "faq-3",
    question: "Do you offer both buying and renting services?",
    answer: "Yes, we provide full-service solutions for both short/long-term renting and property buying across Hurghada and coastal destinations.",
    displayOrder: 3,
    isPublished: true,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: new Date().toISOString(),
  },
  {
    id: "faq-4",
    question: "Can I contact you for more details about a specific property?",
    answer: "Yes! You can contact us anytime via our contact form, phone, or WhatsApp to receive full details, photos, and personalized advice.",
    displayOrder: 4,
    isPublished: true,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: new Date().toISOString(),
  },
  {
    id: "faq-5",
    question: "Can I visit a property before making a decision?",
    answer: "Certainly. We arrange scheduled in-person property tours as well as virtual walkthroughs so you can inspect every detail before deciding.",
    displayOrder: 5,
    isPublished: true,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: new Date().toISOString(),
  },
];

export default function FaqSection() {
  const { href } = useI18n();
  const { data, isLoading } = useFaqs({
    IsPublished: true,
    PageNumber: 1,
    PageSize: 5,
    SortBy: "displayOrder",
    IsDescending: false,
  });

  const apiFaqs = data?.items ?? [];
  const faqs = apiFaqs.length > 0 ? apiFaqs : fallbackFaqs;

  return (
    <section className="bg-[#b3cbca] px-5 py-14 font-[var(--font-poppins)] sm:px-8 sm:py-18 lg:px-14 lg:py-20">
      <div className="mx-auto max-w-[1320px]">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 xl:gap-16">
          {/* Left Column: Heading + Description + Still need A Help box */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="flex w-full flex-col lg:w-[320px] xl:w-[340px] lg:shrink-0"
          >
            <h2 className="text-[36px] sm:text-[44px] font-extrabold tracking-tight text-[#183640]">
              FAQ
            </h2>
            <p className="mt-2 text-[14px] sm:text-[15px] leading-relaxed text-[#456167]">
              Find clear answers to common questions about our properties, services, and real-estate process.
            </p>

            {/* Still need A Help ? Card */}
            <div className="mt-8 sm:mt-10 rounded-2xl bg-[#f8faf9] p-6 sm:p-7 text-center shadow-xs">
              <h3 className="text-[18px] sm:text-[20px] font-bold text-[#183640]">
                Still need A Help ?
              </h3>
              <Link
                href={href("/contact")}
                className="mt-5 block w-full rounded-xl bg-[#183640] py-3 text-center text-[14px] sm:text-[15px] font-semibold text-white shadow-xs transition hover:bg-[#11262d]"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>

          {/* Right Column: 5 Accordion Items in a big white card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="w-full flex-1 min-w-0"
          >
            {isLoading ? (
              <div className="h-[340px] animate-pulse rounded-2xl sm:rounded-3xl bg-white/70" />
            ) : (
              <FaqAccordion items={faqs} />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
