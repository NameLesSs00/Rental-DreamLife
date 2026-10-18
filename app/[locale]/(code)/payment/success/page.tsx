"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCapturePaypalPayment, CapturePaymentData } from "@/lib/hooks/usePayment";
import {
  clearPaymentBookingContext,
  PaymentBookingContext,
  PaymentBookingKind,
  readPaymentBookingContext,
} from "@/lib/utils/paymentBookingContext";
import { formatUsd } from "@/lib/utils/currency";
import { useHydrated } from "@/lib/hooks/useHydrated";
import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

type PageState = "loading" | "success" | "error";
type BookingKind = PaymentBookingKind | "extension" | "booking";

type DetailRow = {
  label: string;
  value: string;
  strong?: boolean;
  mono?: boolean;
};

const bookingCopy: Record<
  BookingKind,
  {
    label: string;
    title: string;
    message: string;
    next: string;
    retryHref: string;
  }
> = {
  rent: {
    label: "Rental",
    title: "Rental Booking Confirmed!",
    message: "Your rental booking has been successfully completed.",
    next: "We will confirm your stay details by email. Please keep your phone available in case we need to contact you before check-in.",
    retryHref: "/rent",
  },
  extension: {
    label: "Stay Extension",
    title: "Stay Extension Payment Confirmed!",
    message: "Your stay extension payment has been successfully completed.",
    next: "We will update the booking extension status after payment confirmation. Please keep your phone available in case our team needs to contact you.",
    retryHref: "/rent",
  },
  transfer: {
    label: "Transfer",
    title: "Transfer Booking Confirmed!",
    message: "Your transfer booking has been successfully completed.",
    next: "Our driver will contact you before your scheduled pickup. Please keep your phone available and check your email for the booking confirmation.",
    retryHref: "/transfer",
  },
  buy: {
    label: "Purchase",
    title: "Purchase Request Confirmed!",
    message: "Your property purchase request has been successfully completed.",
    next: "Our sales team will review your request and contact you with the next steps. Please keep your phone available and check your email for confirmation.",
    retryHref: "/buy",
  },
  booking: {
    label: "Booking",
    title: "Booking Confirmed!",
    message: "Your booking has been successfully completed.",
    next: "We will send your confirmation by email. Please keep your phone available in case our team needs to contact you.",
    retryHref: "/",
  },
};

function normalizeBookingType(value: unknown): BookingKind | null {
  if (value === undefined || value === null) return null;

  const normalized = String(value).trim().toLowerCase();
  if (["rent", "rental", "property", "propertybooking", "property-booking"].includes(normalized)) return "rent";
  if (["transfer", "journey"].includes(normalized)) return "transfer";
  if (["extension", "bookingextension", "booking-extension", "stayextension", "stay-extension"].includes(normalized)) return "extension";
  if (["buy", "buying", "purchase", "propertybuying", "property-buying"].includes(normalized)) return "buy";

  return null;
}

function resolveBookingKind(paymentData?: CapturePaymentData | null, context?: PaymentBookingContext | null): BookingKind {
  const explicitType =
    normalizeBookingType(paymentData?.bookingType) ||
    normalizeBookingType(paymentData?.bookingCategory) ||
    normalizeBookingType(paymentData?.paymentTypeName) ||
    normalizeBookingType(paymentData?.paymentType) ||
    normalizeBookingType(paymentData?.type);

  if (explicitType) return explicitType;

  if (Number(paymentData?.paymentType) === 2) return "extension";
  if (paymentData?.bookingExtensionId) return "extension";

  const bookingNumber = paymentData?.bookingNumber || context?.bookingNumber || "";
  if (bookingNumber.startsWith("TR-")) return "transfer";
  if (bookingNumber.startsWith("BK-")) return "rent";

  return context?.kind || "booking";
}

function getErrorMessage(error: unknown) {
  const apiError = error as { response?: { data?: { errors?: string[]; message?: string } } };
  return apiError.response?.data?.errors?.[0] || apiError.response?.data?.message || "";
}

function getStoredPaypalOrderId() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("paypal_order_id") || "";
}

function optionalDetail(label: string, value?: string | number | null): DetailRow | null {
  if (value === undefined || value === null || value === "") return null;
  return { label, value: String(value) };
}

function getContextDetails(
  kind: BookingKind,
  paymentData: CapturePaymentData,
  context: PaymentBookingContext | null,
  labels: Record<string, string>,
) {
  const rows: Array<DetailRow | null> = [];

  if (kind === "rent") {
    rows.push(
      optionalDetail(labels.property, paymentData.propertyName || context?.propertyName),
      optionalDetail(labels.checkIn, paymentData.checkIn || context?.checkIn),
      optionalDetail(labels.checkOut, paymentData.checkOut || context?.checkOut),
      optionalDetail(labels.guests, paymentData.guests || context?.guests),
    );
  }

  if (kind === "transfer") {
    rows.push(
      optionalDetail(labels.transfer, context?.journeyName),
      optionalDetail(labels.pickupDate, paymentData.pickupDate || context?.pickupDate),
      optionalDetail(labels.pickupTime, paymentData.pickupTime || context?.pickupTime),
      optionalDetail(labels.passengers, paymentData.passengers || context?.passengers),
    );
  }

  if (kind === "buy") {
    rows.push(
      optionalDetail(labels.property, paymentData.propertyBuyingName || context?.title),
      optionalDetail(labels.purchaseId, paymentData.buyingId || context?.buyingId),
    );
  }

  return rows.filter(Boolean) as DetailRow[];
}

function PaymentSuccessContent() {
  const { t, tArray, href } = useI18n();
  const searchParams = useSearchParams();
  const redirectOrderId = searchParams.get("orderId") || searchParams.get("token");
  const hasCapturedRef = useRef(false);
  const hydrated = useHydrated();

  /**
   * localStorage is unavailable on the server, so reading it during render makes
   * the first client render differ from the SSR HTML (the server sees no order
   * id and renders the error state, the client finds one and renders the
   * loading state). `hydrated` is false for the SSR pass *and* the hydration
   * pass, so both sides produce identical markup; the real values are only read
   * on the render after that.
   */
  const captureOrderId = hydrated ? redirectOrderId || getStoredPaypalOrderId() : "";
  const bookingContext = hydrated ? readPaymentBookingContext() : null;

  // Only the async capture result needs state — it arrives via callbacks from an
  // external system, which is exactly what effects are for.
  const [paymentData, setPaymentData] = useState<CapturePaymentData | null>(null);
  const [captureError, setCaptureError] = useState("");

  const { mutate: capturePayment } = useCapturePaypalPayment();

  useEffect(() => {
    if (!captureOrderId || hasCapturedRef.current) return;
    hasCapturedRef.current = true;

    capturePayment(captureOrderId, {
      onSuccess: (res) => {
        if (res.isSuccess && res.data) {
          localStorage.removeItem("paypal_order_id");
          clearPaymentBookingContext();
          setPaymentData(res.data);
        } else {
          setCaptureError(res.errors?.[0] ?? t("payment.genericFailed"));
        }
      },
      onError: (err: unknown) => {
        setCaptureError(getErrorMessage(err) || t("payment.captureFailed"));
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captureOrderId]);

  // Derived, so no state has to be synchronised during render or mount.
  const sessionMissing = hydrated && !captureOrderId;
  const state: PageState = captureError || sessionMissing ? "error" : paymentData ? "success" : "loading";
  const errorMessage = captureError || (sessionMissing ? t("payment.sessionMissing") : "");

  if (state === "loading") {
    return (
      <main className="min-h-screen bg-[#F3F0E9] font-[var(--font-poppins)] text-[#183c2f]">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
          <span className="size-16 animate-spin rounded-full border-4 border-[#dfe8e4] border-t-[#2C798B]" />
          <h1 className="text-[22px] font-semibold text-[#183c2f]">{t("payment.loadingTitle")}</h1>
          <p className="max-w-sm text-[14px] text-[#667c74]">
            {t("payment.loadingBody")}
          </p>
        </div>
      </main>
    );
  }

  if (state === "success" && paymentData) {
    const bookingKind = resolveBookingKind(paymentData, bookingContext);
    const localizedKind = tArray<string>(`payment.kinds.${bookingKind}`);
    const copy = localizedKind.length >= 4
      ? { label: localizedKind[0], title: localizedKind[1], message: localizedKind[2], next: localizedKind[3], retryHref: bookingCopy[bookingKind].retryHref }
      : bookingCopy[bookingKind];
    const details: DetailRow[] = [
      { label: t("payment.detailLabels.bookingNumber"), value: paymentData.bookingNumber || bookingContext?.bookingNumber || "-", mono: true },
      { label: t("payment.detailLabels.bookingType"), value: copy.label, strong: true },
      { label: t("payment.detailLabels.paymentStatus"), value: paymentData.paymentStatusName, strong: true },
      { label: t("payment.detailLabels.amountPaid"), value: formatUsd(paymentData.amount), strong: true },
      { label: t("payment.detailLabels.transactionId"), value: paymentData.transactionId, mono: true },
      ...getContextDetails(bookingKind, paymentData, bookingContext, {
        property: t("payment.detailLabels.property"),
        checkIn: t("payment.detailLabels.checkIn"),
        checkOut: t("payment.detailLabels.checkOut"),
        guests: t("payment.detailLabels.guests"),
        transfer: t("payment.detailLabels.transfer"),
        pickupDate: t("payment.detailLabels.pickupDate"),
        pickupTime: t("payment.detailLabels.pickupTime"),
        passengers: t("payment.detailLabels.passengers"),
        purchaseId: t("payment.detailLabels.purchaseId"),
      }),
    ];

    return (
      <main className="min-h-screen bg-[#F3F0E9] font-[var(--font-poppins)] text-[#183c2f]">
        <section className="px-5 pb-12 pt-10 sm:px-8 lg:px-20 lg:py-20">
          <div className="mx-auto flex w-full max-w-[700px] flex-col items-center">
            <SuccessIcon />
            <h1 className="mt-[19.125px] text-center text-[24px] font-bold leading-[32px] tracking-[-0.03em] text-[#183c2f] lg:mt-6 lg:text-[36px] lg:leading-[42px]">
              {copy.title}
            </h1>
            <div className="flex items-center justify-center lg:mt-2">
              <p className="max-w-[280px] text-center text-[12px] leading-6 lg:max-w-none lg:text-[16px]">
                {copy.message}
              </p>
            </div>
            <section className="mt-4 flex w-full flex-col gap-[25px] rounded-2xl border border-[#dfe8e4] bg-white px-[17px] pb-[34px] pt-[49px] shadow-[0_8px_32px_rgba(31,77,61,0.06)] lg:mt-12 lg:gap-8 lg:p-[49px]">
              <dl className="grid grid-cols-2 gap-x-8 gap-y-6 lg:gap-y-12">
                {details.map((d) => (
                  <div key={d.label} className="min-w-0">
                    <dt className="text-[12px] font-medium leading-4 tracking-[0.02em] text-[#404944]">{d.label}</dt>
                    <dd className={`mt-2 break-all leading-6 ${d.strong ? "text-[12px] font-bold text-[#0b1c30] lg:text-[18px]" : d.mono ? "font-mono text-[11px] text-[#3d4d47] lg:text-[14px]" : "text-[14px] font-medium text-[#414847] lg:text-[18px]"}`}>
                      {d.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="h-px w-full bg-[#dfe8e4]" />
              <div className="flex w-full items-start gap-4 rounded-lg bg-[#f5f7f6] p-6 lg:gap-6">
                <InfoIcon />
                <div className="min-w-0">
                  <h2 className="text-[14px] font-bold leading-5 text-[#0b1c30]">{t("payment.whatsNext")}</h2>
                  <p className="mt-2 text-[12px] leading-5 text-[#404944] lg:text-[14px]">
                    {copy.next}
                  </p>
                </div>
              </div>
            </section>
            <Link
              href={href("/")}
              className="mt-4 flex h-12 w-full items-center justify-center rounded-full border border-[#2C798B] px-[33px] text-center text-[14px] font-bold leading-5 text-[#183c2f] transition hover:bg-[#f5f7f6] lg:mt-12 lg:w-auto"
            >
              {t("common.backToHome")}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const errorKind = resolveBookingKind(null, bookingContext);
  const errorCopy = bookingCopy[errorKind];

  return (
    <main className="min-h-screen bg-[#F3F0E9] font-[var(--font-poppins)] text-[#183c2f]">
      <section className="px-5 pb-12 pt-10 sm:px-8 lg:px-20 lg:py-20">
        <div className="mx-auto flex w-full max-w-[700px] flex-col items-center">
          <ErrorIcon />
          <h1 className="mt-[19.125px] text-center text-[24px] font-bold leading-[32px] tracking-[-0.03em] text-[#183c2f] lg:mt-6 lg:text-[36px] lg:leading-[42px]">
            {t("payment.failedTitle")}
          </h1>
          <div className="flex items-center justify-center lg:mt-2">
            <p className="max-w-[280px] text-center text-[12px] leading-6 text-[#667c74] lg:max-w-none lg:text-[16px]">
              {t("payment.failedBody")}
            </p>
          </div>
          {errorMessage && (
            <div className="mt-6 w-full rounded-2xl border border-[#fecaca] bg-red-50 px-[17px] py-4 text-center text-[13px] text-red-600">
              {errorMessage}
            </div>
          )}
          <div className="mt-6 flex w-full flex-col gap-3 lg:mt-10">
            <Link href={href(errorCopy.retryHref)} className="flex h-12 w-full items-center justify-center rounded-full bg-[#2C798B] text-[14px] font-bold leading-5 text-white transition hover:bg-[#183640]">
              {t("common.tryAgain")}
            </Link>
            <Link href={href("/")} className="flex h-12 w-full items-center justify-center rounded-full border border-[#2C798B] text-[14px] font-bold leading-5 text-[#183c2f] transition hover:bg-[#f5f7f6]">
              {t("common.backToHome")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-[#F3F0E9] font-[var(--font-poppins)]">
        <span className="size-10 animate-spin rounded-full border-4 border-[#dfe8e4] border-t-[#2C798B]" />
      </main>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

function SuccessIcon() {
  return (
    <div className="relative grid size-[153px] shrink-0 place-items-center lg:size-48" aria-hidden="true">
      <ConfettiPiece className="left-[29.13%] top-[19.13%] bg-[#ea9e93]" />
      <ConfettiPiece className="left-[59.13%] top-[14.14%] bg-[#6cf8bb]" />
      <ConfettiPiece className="left-[24.14%] top-[69.13%] bg-[#2C798B]" />
      <ConfettiPiece className="left-[74.14%] top-[59.13%] bg-[#80bea6]" />
      <ConfettiPiece className="left-[79.13%] top-[29.14%] bg-[#d59e52]" />
      <ConfettiPiece className="left-[59.13%] top-[79.14%] bg-[#2C798B]" />
      <span className="absolute size-[102px] rounded-full bg-[#eff4ff] opacity-50 lg:size-32" />
      <span className="relative grid size-[76.5px] place-items-center rounded-full bg-[#eff4ff] lg:size-24">
        <span className="grid size-[51px] place-items-center rounded-full bg-[#2C798B] lg:size-16">
          <svg className="h-[12.777px] w-[17.319px] lg:h-[16.033px] lg:w-[21.733px]" viewBox="0 0 22 17" fill="none">
            <path d="M7.77 16.03 0 8.46l2.96-2.89 4.81 4.69L19.04 0 22 2.89 7.77 16.03Z" fill="white" />
          </svg>
        </span>
      </span>
    </div>
  );
}

function ErrorIcon() {
  return (
    <div className="relative grid size-[153px] shrink-0 place-items-center lg:size-48" aria-hidden="true">
      <ConfettiPiece className="left-[29.13%] top-[19.13%] bg-[#fca5a5]" />
      <ConfettiPiece className="left-[59.13%] top-[14.14%] bg-[#f87171]" />
      <ConfettiPiece className="left-[24.14%] top-[69.13%] bg-[#ef4444]" />
      <ConfettiPiece className="left-[74.14%] top-[59.13%] bg-[#fca5a5]" />
      <ConfettiPiece className="left-[79.13%] top-[29.14%] bg-[#fecaca]" />
      <ConfettiPiece className="left-[59.13%] top-[79.14%] bg-[#f87171]" />
      <span className="absolute size-[102px] rounded-full bg-red-50 opacity-50 lg:size-32" />
      <span className="relative grid size-[76.5px] place-items-center rounded-full bg-red-50 lg:size-24">
        <span className="grid size-[51px] place-items-center rounded-full bg-red-500 lg:size-16">
          <svg className="size-6 text-white lg:size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      </span>
    </div>
  );
}

function ConfettiPiece({ className }: { className: string }) {
  return <span className={`absolute size-[9.016px] rotate-45 opacity-60 lg:size-[11.314px] ${className}`} />;
}

function InfoIcon() {
  return (
    <svg className="mt-1 h-5 w-[17px] shrink-0 text-[#2C798B]" viewBox="0 0 17 20" fill="none" aria-hidden="true">
      <path d="M8.5 0C3.82 0 0 3.58 0 8c0 2.3 1.04 4.38 2.69 5.84L1.7 20l5.09-4.11c.55.07 1.12.11 1.71.11 4.68 0 8.5-3.58 8.5-8s-3.82-8-8.5-8Zm-.9 5.2h1.8V7H7.6V5.2Zm0 3.2h1.8v5H7.6v-5Z" fill="currentColor" />
    </svg>
  );
}
