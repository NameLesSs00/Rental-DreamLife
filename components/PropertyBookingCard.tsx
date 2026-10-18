"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";
import { useI18n } from "./I18nProvider";

interface PropertyBookingCardProps {
  idPrefix?: string;
  propertyId: string;
  propertyName: string;
  basePrice: number;
  nightPrice?: number;
  currencyCode?: string;
  capacity: number;
  rating?: number;
  totalReviews?: number;
  todayString: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  onClearDates: () => void;
  bookingForm: {
    fullName: string;
    email: string;
    phone: string;
    person: number;
  };
  setBookingForm: React.Dispatch<
    React.SetStateAction<{
      fullName: string;
      email: string;
      phone: string;
      person: number;
    }>
  >;
  hasAcceptedRules: boolean;
  setHasAcceptedRules: (accepted: boolean) => void;
  formError: string;
  isPending: boolean;
  isCheckingPrice: boolean;
  isPriceUnavailable: boolean;
  estimatedTotal: number;
  missingDates: string[];
  onSubmitBooking: (e: React.FormEvent<HTMLFormElement>) => void;
  onScrollToCalendar?: () => void;
}

export default function PropertyBookingCard({
  idPrefix,
  basePrice,
  nightPrice,
  currencyCode = "USD",
  capacity,
  rating = 0,
  totalReviews = 0,
  todayString,
  checkIn,
  checkOut,
  nights,
  onCheckInChange,
  onCheckOutChange,
  onClearDates,
  bookingForm,
  setBookingForm,
  hasAcceptedRules,
  setHasAcceptedRules,
  formError,
  isPending,
  isCheckingPrice,
  isPriceUnavailable,
  estimatedTotal,
  missingDates,
  onSubmitBooking,
  onScrollToCalendar,
}: PropertyBookingCardProps) {
  const { t, href } = useI18n();
  const bookPropertyTitle =
    t("booking.bookTheProperty", { defaultValue: "Book The Property" }) !== "booking.bookTheProperty"
      ? t("booking.bookTheProperty", { defaultValue: "Book The Property" })
      : "Book The Property";

  const displayedPrice = nightPrice ?? basePrice;

  return (
    <div
      id={idPrefix ? `booking-card-${idPrefix}` : "booking-card"}
      className="scroll-mt-24 rounded-2xl border border-[#dfe8e4] bg-white p-4 shadow-[0_4px_24px_rgba(24,60,47,0.06)] sm:p-5"
    >
      {/* ─── Top Title: Book The Property ─── */}
      <div className="mb-3">
        <h3 className="text-[18px] font-bold text-[#183c2f]">
          {bookPropertyTitle}
        </h3>
      </div>

      {/* ─── Card Header: Price & Rating ─── */}
      <div className="flex items-baseline justify-between border-b border-[#edf2ef] pb-2.5">
        <div>
          <span className="text-[22px] font-bold text-[#183c2f] lg:text-[24px]">
            {formatCurrency(displayedPrice, currencyCode)}
          </span>
          <span className="text-[12px] font-medium text-[#667c74]"> / {t("common.night")}</span>
        </div>

        {totalReviews > 0 ? (
          <div className="flex items-center gap-1 text-[12px] font-semibold text-[#183c2f]">
            <span className="text-[#2C798B]">★</span>
            <span>{rating.toFixed(1)}</span>
            <span className="text-[11px] font-normal text-[#8a9a94]">
              ({totalReviews})
            </span>
          </div>
        ) : null}
      </div>

      <form onSubmit={onSubmitBooking} className="mt-3 space-y-2.5">
        {/* ─── Date Picker Box ─── */}
        <div className="rounded-xl border border-[#dfe8e4] bg-[#fbfdfc] p-2.5 transition focus-within:border-[#2C798B]">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#667c74]">
                {t("booking.checkIn")}
              </label>
              <input
                type="date"
                min={todayString}
                value={checkIn}
                onChange={(e) => onCheckInChange(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-[12.5px] font-semibold text-[#183c2f] outline-none cursor-pointer"
              />
            </div>
            <div className="border-l border-[#dfe8e4] pl-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#667c74]">
                {t("booking.checkout")}
              </label>
              <input
                type="date"
                min={checkIn || todayString}
                value={checkOut}
                onChange={(e) => onCheckOutChange(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-[12.5px] font-semibold text-[#183c2f] outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-[#edf2ef] pt-1.5 text-[10.5px]">
            <span className="text-[#667c74] truncate">
              {checkIn && checkOut
                ? t("booking.selectedRange", { count: nights, label: nights === 1 ? t("common.night") : t("common.nights") })
                : checkIn
                  ? t("booking.selectCheckout")
                  : t("booking.selectDates")}
            </span>
            <div className="flex shrink-0 items-center gap-1.5">
              {onScrollToCalendar && (
                <button
                  type="button"
                  onClick={onScrollToCalendar}
                  className="font-medium text-[#2C798B] hover:underline"
                >
                  {t("property.viewCalendar")}
                </button>
              )}
              {(checkIn || checkOut) && (
                <>
                  <span className="text-[#d0ded8]">•</span>
                  <button
                    type="button"
                    onClick={onClearDates}
                    className="font-medium text-[#2C798B] hover:underline"
                  >
                    {t("common.clear")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ─── Guests Selector ─── */}
        <div>
          <label className="block text-[11px] font-semibold text-[#183c2f]">
            {t("common.guests")}
          </label>
          <select
            value={bookingForm.person}
            onChange={(e) =>
              setBookingForm((prev) => ({
                ...prev,
                person: Number(e.target.value),
              }))
            }
            className="mt-1 h-8.5 w-full rounded-lg border border-[#dfe8e4] bg-white px-2.5 text-[12.5px] text-[#183c2f] outline-none transition focus:border-[#2C798B]"
          >
            {Array.from(
              { length: Math.max(1, capacity) },
              (_, index) => index + 1
            ).map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? t("common.guest") : t("common.guests")}{" "}
                {count === capacity ? `(${t("common.maxCapacity")})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* ─── Guest Contact Fields ─── */}
        <div className="space-y-2">
          <div>
            <label className="block text-[11px] font-semibold text-[#183c2f]">
              {t("booking.fullName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={t("booking.fullNamePlaceholder")}
              value={bookingForm.fullName}
              onChange={(e) =>
                setBookingForm((prev) => ({ ...prev, fullName: e.target.value }))
              }
              className="mt-1 h-8.5 w-full rounded-lg border border-[#dfe8e4] bg-white px-2.5 text-[12.5px] text-[#183c2f] outline-none transition placeholder:text-[#aab4b0] focus:border-[#2C798B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#183c2f]">
                {t("booking.email")} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder={t("booking.emailPlaceholder")}
                value={bookingForm.email}
                onChange={(e) =>
                  setBookingForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="mt-1 h-8.5 w-full rounded-lg border border-[#dfe8e4] bg-white px-2.5 text-[12.5px] text-[#183c2f] outline-none transition placeholder:text-[#aab4b0] focus:border-[#2C798B]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#183c2f]">
                {t("booking.phone")} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder={t("booking.phonePlaceholder")}
                value={bookingForm.phone}
                onChange={(e) =>
                  setBookingForm((prev) => ({
                    ...prev,
                    phone: e.target.value.replace(/[^\d+]/g, ""),
                  }))
                }
                className="mt-1 h-8.5 w-full rounded-lg border border-[#dfe8e4] bg-white px-2.5 text-[12.5px] text-[#183c2f] outline-none transition placeholder:text-[#aab4b0] focus:border-[#2C798B]"
              />
            </div>
          </div>
        </div>

        {/* ─── Price Breakdown Summary ─── */}
        <div className="rounded-lg border border-[#edf2ef] bg-[#fbfdfc] p-2.5">
          <dl className="space-y-1.5 text-[12px]">
            <div className="flex justify-between text-[#667c74]">
              <span>
                {formatCurrency(displayedPrice, currencyCode)} × {nights || 0}{" "}
                {nights === 1 ? t("common.night") : t("common.nights")}
              </span>
              <span className="font-semibold text-[#183c2f]">
                {isCheckingPrice && checkIn && checkOut
                  ? t("common.checking")
                  : formatCurrency(estimatedTotal, currencyCode)}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#edf2ef] pt-1.5 text-[13px]">
              <span className="font-bold text-[#183c2f]">{t("common.total")}</span>
              <span className="text-[15px] font-bold text-[#2C798B]">
                {isCheckingPrice && checkIn && checkOut
                  ? t("common.checking")
                  : formatCurrency(estimatedTotal, currencyCode)}
              </span>
            </div>
          </dl>
          {!checkIn || !checkOut ? (
            <p className="mt-1.5 text-[10.5px] text-[#8a9a94]">
              {t("booking.selectDatesPrice")}
            </p>
          ) : null}
        </div>

        {/* Alerts & Errors */}
        {isPriceUnavailable && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11.5px] leading-relaxed text-amber-700">
            {t("booking.pricingMissing", { dates: missingDates.length ? missingDates.join(", ") : t("booking.selectDates") })}
          </div>
        )}

        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11.5px] leading-relaxed text-red-600">
            {formError}
          </div>
        )}

        {/* House Rules Agreement Checkbox (saved for later use)
        <label className="flex items-start gap-2 cursor-pointer text-[11.5px] text-[#556960] select-none py-0.5">
          <input
            type="checkbox"
            checked={hasAcceptedRules}
            onChange={(e) => setHasAcceptedRules(e.target.checked)}
            className="mt-0.5 size-3.5 rounded border-[#dfe8e4] text-[#2C798B] focus:ring-[#2C798B] cursor-pointer"
          />
          <span className="leading-tight">
            {t("booking.rulesAgreement")}{" "}
            <a
              href="#terms-and-conditions"
              onClick={(e) => {
                e.stopPropagation();
                const el = document.getElementById("terms-and-conditions");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-[#2C798B] underline font-medium hover:text-[#183c2f]"
            >
              {t("terms.houseRules", { defaultValue: "house rules & policies" })}
            </a>
          </span>
        </label>
        */}

        {/* Submit CTA Button */}
        <button
          type="submit"
          disabled={isPending}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#2C798B] text-[13.5px] font-semibold text-white shadow-sm transition-all hover:bg-[#183640] hover:shadow active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>{t("common.processing")}</span>
            </>
          ) : (
            <>
              <span>{t("booking.bookPaypal")}</span>
              <svg
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </>
          )}
        </button>

        {/* Trust Badges */}
        <div className="border-t border-[#edf2ef] pt-2 text-[11px] text-[#667c74]">
          <div className="flex items-center gap-1.5">
            <svg
              className="size-3.5 text-[#2C798B] shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>{t("booking.secure")}</span>
          </div>
        </div>
      </form>
    </div>
  );
}
