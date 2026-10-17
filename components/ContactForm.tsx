"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { useSubmitContact } from "@/lib/hooks/useContact";
import { useI18n } from "./I18nProvider";

export default function ContactForm({ defaultSubject = "" }: { defaultSubject?: string }) {
  const { t } = useI18n();
  const shouldReduceMotion = useReducedMotion();

  const { mutate: submitContact, isPending } = useSubmitContact();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: defaultSubject,
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status === "error") setStatus("idle");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("idle");

    submitContact(formData, {
      onSuccess: (res) => {
        if (res.isSuccess) {
          setStatus("success");
          toast.success(res.message || "Message sent successfully!");
          setFormData({ name: "", email: "", phone: "", subject: defaultSubject, message: "" });
        } else {
          setStatus("error");
          const msg = res.errors?.[0] ?? res.message ?? t("contact.form.errorFallback");
          setErrorMessage(msg);
          toast.error(msg);
        }
      },
      onError: (err: any) => {
        setStatus("error");
        const msg =
          err?.response?.data?.errors?.[0] ||
          err?.response?.data?.message ||
          t("contact.form.networkError") ||
          "Network error. Please try again.";
        setErrorMessage(msg);
        toast.error(msg);
      },
    });
  }

  return (
    <div className="h-full w-full">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            className="flex h-full min-h-[460px] flex-col items-center justify-center gap-5 rounded-[20px] border border-[#d8e0dd] bg-white p-8 text-center shadow-xs"
          >
            <div className="grid size-16 place-items-center rounded-full bg-[#e8f1ee] text-[#2C798B]">
              <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <h3 className="text-[22px] font-bold text-[#142d38]">
                {t("contact.form.sentTitle") || "Message Sent"}
              </h3>
              <p className="mt-2 max-w-[360px] text-[13.5px] leading-relaxed text-[#718288]">
                {t("contact.form.sentBody") ||
                  "Thank you for reaching out. Our team will review your message and get back to you shortly."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-[#71a8b7] px-6 text-[13.5px] font-semibold text-white transition hover:bg-[#5c95a4]"
            >
              {t("contact.form.sendAnother") || "Send Another Message"}
            </button>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex h-full flex-col justify-between gap-4 rounded-[20px] border border-[#d8e0dd] bg-white p-6 shadow-xs sm:p-7"
          >
            {status === "error" && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* Your Name */}
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder={t("contact.form.name") || "Your Name"}
                className="w-full rounded-lg border border-[#d8e0dd] bg-[#fbfdfc] px-4 py-2.5 text-[13.5px] text-[#142d38] placeholder-[#9aa8a3] outline-none transition focus:border-[#71a8b7] focus:bg-white"
              />

              {/* Phone Number */}
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t("contact.form.phone") || "Phone Number"}
                className="w-full rounded-lg border border-[#d8e0dd] bg-[#fbfdfc] px-4 py-2.5 text-[13.5px] text-[#142d38] placeholder-[#9aa8a3] outline-none transition focus:border-[#71a8b7] focus:bg-white"
              />

              {/* Email Address */}
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={t("contact.form.email") || "Email Address"}
                className="w-full rounded-lg border border-[#d8e0dd] bg-[#fbfdfc] px-4 py-2.5 text-[13.5px] text-[#142d38] placeholder-[#9aa8a3] outline-none transition focus:border-[#71a8b7] focus:bg-white"
              />

              {/* Subject */}
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder={t("contact.form.subject") || "Subject"}
                className="w-full rounded-lg border border-[#d8e0dd] bg-[#fbfdfc] px-4 py-2.5 text-[13.5px] text-[#142d38] placeholder-[#9aa8a3] outline-none transition focus:border-[#71a8b7] focus:bg-white"
              />

              {/* Your Message... */}
              <textarea
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder={t("contact.form.messagePlaceholder") || "Your Message..."}
                className="w-full resize-none rounded-lg border border-[#d8e0dd] bg-[#fbfdfc] px-4 py-3 text-[13.5px] text-[#142d38] placeholder-[#9aa8a3] outline-none transition focus:border-[#71a8b7] focus:bg-white"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="flex h-[44px] w-full items-center justify-center rounded-lg bg-[#71a8b7] px-6 text-[14px] font-semibold text-white shadow-xs transition hover:bg-[#5c95a4] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <span className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <span>{t("contact.submitMessage") || "Submit Message"}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
}
