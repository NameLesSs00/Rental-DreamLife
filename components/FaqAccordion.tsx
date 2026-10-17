"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/types/faq";
import { motion, AnimatePresence } from "framer-motion";

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-sm divide-y divide-[#ecefe7]">
      {items.map((faq) => {
        const isOpen = openId === faq.id;

        return (
          <article key={faq.id} className="bg-white transition-colors">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="flex w-full items-center justify-between gap-4 px-5 sm:px-8 py-5 sm:py-6 text-start transition-colors hover:bg-[#fafbfb]"
            >
              <h3 className="text-[14.5px] sm:text-[16px] font-medium leading-snug text-[#183640]">
                {faq.question}
              </h3>

              <span className="flex size-6 sm:size-7 shrink-0 items-center justify-center text-[#788a8f] transition-transform duration-200">
                <svg
                  className="size-5 sm:size-6 transition-transform duration-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="12" r="9.5" />
                  <line x1="12" y1="8" x2="12" y2="16" className={`transition-opacity duration-200 ${isOpen ? "opacity-0" : "opacity-100"}`} />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 sm:px-8 pb-5 sm:pb-6 text-[13.5px] sm:text-[14.5px] leading-relaxed text-[#5e7177]">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        );
      })}
    </div>
  );
}
