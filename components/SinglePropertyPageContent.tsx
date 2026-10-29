"use client";

import Image from "next/image";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PropertyImageGallery from "./PropertyImageGallery";
import PropertyBookingCard from "./PropertyBookingCard";
import ScrollAnimation from "./ScrollAnimation";
import {
  useCheckPropertyAvailabilityRange,
  useCheckPropertyDailyPrices,
  usePropertyById,
  usePropertyAvailability,
  usePropertyDailyPrices,
  usePropertyDailyPriceForDate,
} from "@/lib/hooks/useProperties";
import { API_BASE_URL } from "@/lib/api/config";
import { useCreateRentBooking } from "@/lib/hooks/useBooking";
import { useCreatePaypalOrder } from "@/lib/hooks/usePayment";
import { usePropertyCategories } from "@/lib/hooks/usePropertyCategory";
import { usePropertyCategoryItems } from "@/lib/hooks/usePropertyCategoryItem";
import { useLandmarks } from "@/lib/hooks/useAttributeGroupItem";
import type { Property, PropertyCategoryGroup } from "@/lib/types/property";
import type { PropertyCategory, PropertyCategoryItem } from "@/lib/types/propertyCategory";
import type { AttributeGroupItem } from "@/lib/types/attributeGroupItem";
import type { PriceInfo } from "@/lib/types/currency";
import { useReviews, usePropertyAverageRating, useCreateReview } from "@/lib/hooks/useReview";
import { savePaymentBookingContext } from "@/lib/utils/paymentBookingContext";
import { formatCurrency, formatPriceInfo, getPriceInfoAmount, getPriceInfoCurrency } from "@/lib/utils/currency";
import { useSelectedCurrency } from "@/lib/hooks/useSelectedCurrency";
import { DEFAULT_LANDMARK_ICON } from "@/lib/constants/landmarks";
import { getPropertyLandmarks } from "@/lib/utils/landmarks";
import { getPropertyCategoryGroupsFromValues } from "@/lib/utils/propertyCategoryValues";
import { toast } from "sonner";

const propertyTypeNames: Record<number, string> = {
  1: "Apartment",
  2: "Villa",
  3: "Studio",
  4: "Chalet",
  5: "Twin House",
  6: "Townhouse",
  7: "Duplex",
  8: "Penthouse",
  9: "Cabin",
  10: "Hotel",
  11: "2 Bedrooms",
  12: "1 Bedroom",
};

const propertyTypeKeyById: Record<number, string> = {
  1: "rent.apartment",
  2: "rent.villa",
  3: "rent.studio",
  4: "rent.chalet",
  5: "rent.twinHouse",
  6: "rent.townhouse",
  7: "rent.duplex",
  8: "rent.penthouse",
  9: "rent.cabin",
  10: "rent.hotel",
  11: "rent.twoBedrooms",
  12: "rent.oneBedroom",
};

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type CalendarDay = {
  day: number;
  date: string;
  price?: string;
  status?: "available" | "booked" | "today" | "past";
};

type BookingCalendarItem = {
  from: string;
  to: string;
  isBookable?: boolean;
};

type QuickFact = {
  label: string;
  icon: string;
};

type DetailRow = [string, string];

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

function getNights(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T00:00:00`).getTime();
  const end = new Date(`${checkOut}T00:00:00`).getTime();
  return Math.max(0, Math.round((end - start) / 86400000));
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as {
    response?: { data?: { errors?: string[]; message?: string } };
  };
  return apiError.response?.data?.errors?.[0] || apiError.response?.data?.message || fallback;
}

function resolveApiImageUrl(url?: string | null) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/([^:]\/)\/+/g, "$1");
  }
  const cleanBase = API_BASE_URL.replace(/\/+$/, "");
  const cleanPath = trimmed.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}

function normalizeLookupKey(value: string) {
  return value.trim().toLowerCase();
}

import DynamicAmenityIcon from "./DynamicAmenityIcon";
import { useI18n } from "./I18nProvider";
import { useHeaderStore } from "@/lib/headerStore";

export default function SinglePropertyPageContent({ id }: { id: string }) {
  const { t, href, locale } = useI18n();
  const searchParams = useSearchParams();
  const [selectedCurrency] = useSelectedCurrency(searchParams.get("Currency"));
  const { data: property, isLoading } = usePropertyById(id, locale, selectedCurrency);
  const { data: includeCategories = [] } = usePropertyCategories(locale);
  const { data: includeItems = [] } = usePropertyCategoryItems(locale);
  const { data: landmarkItems = [] } = useLandmarks(locale);
  const { data: averageData } = usePropertyAverageRating(id);
  const setPageEntity = useHeaderStore((state) => state.setPageEntity);

  useEffect(() => {
    setPageEntity(id, "rent");
    return () => setPageEntity(null, null);
  }, [id, setPageEntity]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-20 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="size-8 animate-spin rounded-full border-3 border-[#183c2f] border-t-transparent" />
          <span className="text-[15px] font-medium text-[#183c2f]">{t("property.loading")}</span>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-20 text-center">
        <h2 className="text-[20px] font-bold text-[#183c2f]">{t("property.notFoundTitle")}</h2>
        <p className="mt-2 text-[14px] text-[#667c74]">{t("property.notFoundBody")}</p>
        <Link
          href={href("/rent")}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#183c2f] px-6 text-[14px] font-semibold text-white transition hover:bg-[#2C798B]"
        >
          {t("property.browse")}
        </Link>
      </div>
    );
  }

  return (
    <PropertyDetailView
      property={property}
      includeCategories={includeCategories}
      includeItems={includeItems}
      landmarkItems={landmarkItems}
      averageRating={averageData?.averageRating ?? 0}
      totalReviews={averageData?.totalReviews ?? 0}
      selectedCurrency={selectedCurrency}
    />
  );
}

function PropertyDetailView({
  property,
  includeCategories,
  includeItems,
  landmarkItems,
  averageRating,
  totalReviews,
  selectedCurrency,
}: {
  property: Property;
  includeCategories: PropertyCategory[];
  includeItems: PropertyCategoryItem[];
  landmarkItems: AttributeGroupItem[];
  averageRating: number;
  totalReviews: number;
  selectedCurrency: string;
}) {
  const { t, locale } = useI18n();
  const propertyId = property.id;
  const propertyName = property.name;
  const basePrice = getPriceInfoAmount(property.basePriceInfo, property.basePrice || 0);
  const currencyCode = getPriceInfoCurrency(property.basePriceInfo, selectedCurrency);
  const conversionRate = property.basePriceInfo?.conversionRate ?? 1;
  const capacity = property.capacity || 1;

  // ─── Booking State ───
  const today = new Date();
  const todayString = formatLocalDate(today);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const [monthsToShow, setMonthsToShow] = useState(2);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [formError, setFormError] = useState("");
  const [hasAcceptedRules, setHasAcceptedRules] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    person: Math.min(1, capacity),
  });
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // Restore saved booking draft on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const timer = window.setTimeout(() => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlCheckIn = urlParams.get("checkIn") || urlParams.get("from");
        const urlCheckOut = urlParams.get("checkOut") || urlParams.get("to");
        const urlPerson = Number(urlParams.get("person") || urlParams.get("MinCapacity") || urlParams.get("minCapacity"));

        const saved = localStorage.getItem(`rent_booking_draft_${propertyId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            setBookingForm((prev) => ({
              fullName: typeof parsed.fullName === "string" ? parsed.fullName : prev.fullName,
              email: typeof parsed.email === "string" ? parsed.email : prev.email,
              phone: typeof parsed.phone === "string" ? parsed.phone : prev.phone,
              person: typeof parsed.person === "number" ? Math.min(Math.max(1, parsed.person), capacity) : prev.person,
            }));

            if (typeof parsed.checkIn === "string" && parsed.checkIn >= todayString) {
              setCheckIn(parsed.checkIn);
            }
            if (typeof parsed.checkOut === "string" && parsed.checkOut > todayString) {
              setCheckOut(parsed.checkOut);
            }
            if (typeof parsed.hasAcceptedRules === "boolean") {
              setHasAcceptedRules(parsed.hasAcceptedRules);
            }
          }
        }

        // If URL search params provided dates from vacation homes filter, use them
        if (urlCheckIn && urlCheckIn >= todayString) {
          setCheckIn(urlCheckIn);
        }
        if (urlCheckOut && (!urlCheckIn || urlCheckOut > urlCheckIn)) {
          setCheckOut(urlCheckOut);
        }
        if (Number.isFinite(urlPerson) && urlPerson >= 1) {
          setBookingForm((prev) => ({
            ...prev,
            person: Math.min(Math.max(1, urlPerson), capacity),
          }));
        }
      } catch (err) {
        console.warn("Could not restore booking draft", err);
      } finally {
        setHasRestoredDraft(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [propertyId, capacity, todayString]);

  // Persist booking draft whenever user changes data
  useEffect(() => {
    if (typeof window === "undefined" || !hasRestoredDraft) return;

    const storageKey = `rent_booking_draft_${propertyId}`;
    const hasData =
      bookingForm.fullName.trim() !== "" ||
      bookingForm.email.trim() !== "" ||
      bookingForm.phone.trim() !== "" ||
      checkIn !== "" ||
      checkOut !== "" ||
      hasAcceptedRules;

    try {
      if (hasData) {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            fullName: bookingForm.fullName,
            email: bookingForm.email,
            phone: bookingForm.phone,
            person: bookingForm.person,
            checkIn,
            checkOut,
            hasAcceptedRules,
          })
        );
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (err) {
      console.warn("Could not save booking draft", err);
    }
  }, [bookingForm, checkIn, checkOut, hasAcceptedRules, hasRestoredDraft, propertyId]);

  const { mutate: createRentBooking, isPending: isCreatingBooking } = useCreateRentBooking();
  const { mutate: createPaypalOrder, isPending: isCreatingOrder } = useCreatePaypalOrder();
  const {
    mutateAsync: checkDailyPrices,
    data: priceCheck,
    isPending: isCheckingPrice,
    reset: resetPriceCheck,
  } = useCheckPropertyDailyPrices();
  const { mutateAsync: checkAvailabilityRange, isPending: isCheckingAvailability } = useCheckPropertyAvailabilityRange();
  const isPending = isCreatingBooking || isCreatingOrder || isCheckingPrice || isCheckingAvailability;

  const startDate = todayString;
  const endDate = formatLocalDate(new Date(currentYear, currentMonth + monthsToShow, 0));
  const { data: availabilityData } = usePropertyAvailability(propertyId, startDate, endDate);
  const bookings = (availabilityData?.bookingCalendar || []) as BookingCalendarItem[];

  // ─── Real Per-Night Price from Daily Prices API ───
  const effectivePriceDate = checkIn || todayString;
  const { data: singleDailyPrice } = usePropertyDailyPriceForDate(propertyId, effectivePriceDate, selectedCurrency);
  const { data: dailyPricesData } = usePropertyDailyPrices({
    propertyId,
    startDate,
    endDate,
    currency: selectedCurrency,
  });

  const dailyPricesByDate = useMemo(() => {
    const map = new Map<string, { date: string; price?: number; priceInfo?: PriceInfo | null }>();
    (dailyPricesData?.prices || []).forEach((item) => {
      if (item.date) {
        map.set(item.date, item);
      }
    });
    return map;
  }, [dailyPricesData]);

  const singlePriceInfo = singleDailyPrice?.priceInfo;
  const rangePriceItem = dailyPricesByDate.get(effectivePriceDate);
  const activePriceInfo = singlePriceInfo || rangePriceItem?.priceInfo || property.basePriceInfo || null;

  const activeNightPrice = useMemo(() => {
    if (singlePriceInfo?.amount != null) return singlePriceInfo.amount;
    if (rangePriceItem?.priceInfo?.amount != null) return rangePriceItem.priceInfo.amount;
    if (typeof rangePriceItem?.price === "number" && rangePriceItem.price > 0) return rangePriceItem.price;
    return basePrice;
  }, [singlePriceInfo, rangePriceItem, basePrice]);

  const isDateBooked = (dateString: string) => {
    const overlappingBooking = bookings.find((booking) => dateString >= booking.from && dateString < booking.to);
    return Boolean(overlappingBooking && overlappingBooking.isBookable === false);
  };

  const rangeHasBookedDate = (from: string, to: string, calendar = bookings) => {
    let cursor = from;
    while (cursor < to) {
      const overlappingBooking = calendar.find((booking) => cursor >= booking.from && cursor < booking.to);
      if (overlappingBooking && overlappingBooking.isBookable === false) return true;
      cursor = addDays(cursor, 1);
    }
    return false;
  };

  const selectDate = (day: CalendarDay) => {
    if (day.status === "past" || day.status === "booked") return;
    setFormError("");

    if (!checkIn || checkOut || day.date <= checkIn) {
      setCheckIn(day.date);
      setCheckOut("");
      return;
    }

    if (rangeHasBookedDate(checkIn, day.date)) {
      setFormError(t("booking.errors.unavailableRange"));
      return;
    }

    setCheckOut(day.date);
  };

  const handleCheckInChange = (newCheckIn: string) => {
    setFormError("");
    setCheckIn(newCheckIn);
    if (checkOut && checkOut <= newCheckIn) {
      setCheckOut("");
    } else if (checkOut && rangeHasBookedDate(newCheckIn, checkOut)) {
      setCheckOut("");
      setFormError(t("booking.errors.unavailableSelected"));
    }
  };

  const handleCheckOutChange = (newCheckOut: string) => {
    setFormError("");
    if (!checkIn) {
      setFormError(t("booking.errors.selectCheckIn"));
      return;
    }
    if (newCheckOut <= checkIn) {
      setFormError(t("booking.errors.checkoutAfter"));
      return;
    }
    if (rangeHasBookedDate(checkIn, newCheckOut)) {
      setFormError(t("booking.errors.unavailableSelected"));
      return;
    }
    setCheckOut(newCheckOut);
  };

  const clearDates = () => {
    setCheckIn("");
    setCheckOut("");
    setFormError("");
  };

  const scrollToCalendar = () => {
    const el = document.getElementById("availability-calendar");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getDaysForMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      const dateString = formatLocalDate(date);
      const isPast = dateString < todayString;
      const isBooked = isDateBooked(dateString);
      const isToday = dateString === todayString;

      let status: CalendarDay["status"] = "available";
      if (isPast) status = "past";
      else if (isBooked) status = "booked";
      else if (isToday) status = "today";

      const priceItem = dailyPricesByDate.get(dateString);
      const price = priceItem
        ? formatPriceInfo(priceItem.priceInfo, priceItem.price, currencyCode)
        : undefined;

      return { day: i + 1, date: dateString, status, price };
    });
  };

  const months = useMemo(
    () =>
      Array.from({ length: monthsToShow }, (_, index) => {
        const monthDate = new Date(currentYear, currentMonth + index, 1);
        return {
          title: monthDate.toLocaleString(locale, { month: "long", year: "numeric" }),
          startOffset: monthDate.getDay(),
          days: getDaysForMonth(monthDate.getFullYear(), monthDate.getMonth()),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthsToShow, bookings, todayString, dailyPricesByDate],
  );

  useEffect(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      resetPriceCheck();
      return;
    }

    let isCurrent = true;

    checkDailyPrices({
      propertyId,
      payload: { checkIn, checkOut },
    }).catch((error) => {
      if (!isCurrent) return;
      const message = getApiErrorMessage(error, t("booking.errors.priceCheckFailed"));
      setFormError(message);
    });

    return () => {
      isCurrent = false;
    };
  }, [checkDailyPrices, checkIn, checkOut, propertyId, resetPriceCheck]);

  const nights = checkIn && checkOut ? getNights(checkIn, checkOut) : 0;
  const estimatedTotal = checkIn && checkOut && priceCheck?.isPriceAvailable ? priceCheck.totalPrice * conversionRate : nights * activeNightPrice;
  const missingDates = priceCheck?.missingDates || [];
  const isPriceUnavailable = Boolean(checkIn && checkOut && priceCheck && !priceCheck.isPriceAvailable);

  const submitBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (!checkIn || !checkOut) {
      const message = t("booking.errors.dates");
      setFormError(message);
      toast.error(message);
      return;
    }

    if (checkOut <= checkIn) {
      const message = t("booking.errors.checkoutAfter");
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!bookingForm.fullName.trim()) {
      const message = t("booking.errors.nameRequired", { defaultValue: "Please enter your full name." });
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!bookingForm.email.trim()) {
      const message = t("booking.errors.emailRequired", { defaultValue: "Please enter your email address." });
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!bookingForm.phone.trim()) {
      const message = t("booking.errors.phoneRequired", { defaultValue: "Please enter your phone number." });
      setFormError(message);
      toast.error(message);
      return;
    }

    if (bookingForm.person > capacity) {
      const message = t("booking.errors.capacity", { count: capacity });
      setFormError(message);
      toast.error(message);
      return;
    }

    /* Optional house rules check (commented out for later use):
    if (!hasAcceptedRules) {
      const message = t("booking.errors.rulesRequired", { defaultValue: "Please agree to the house rules and cancellation policy to proceed." });
      setFormError(message);
      toast.error(message);
      return;
    }
    */

    try {
      const latestAvailability = await checkAvailabilityRange({ propertyId, startDate: checkIn, endDate: checkOut });
      const latestBookings = (latestAvailability?.bookingCalendar || []) as BookingCalendarItem[];

      if (rangeHasBookedDate(checkIn, checkOut, latestBookings)) {
        const message = t("booking.errors.unavailableRange");
        setFormError(message);
        toast.error(message);
        return;
      }

      const latestPriceCheck = await checkDailyPrices({
        propertyId,
        payload: { checkIn, checkOut },
      });

      if (!latestPriceCheck?.isPriceAvailable) {
        const missing = latestPriceCheck?.missingDates?.length
          ? ` ${t("booking.pricingMissing", { dates: latestPriceCheck.missingDates.join(", ") })}`
          : "";
        const message = t("booking.errors.priceUnavailable", { missing });
        setFormError(message);
        toast.error(message);
        return;
      }
    } catch (error) {
      const message = getApiErrorMessage(error, t("booking.errors.verifyFailed"));
      setFormError(message);
      toast.error(message);
      return;
    }

    createRentBooking(
      {
        propertyId,
        fullName: bookingForm.fullName.trim(),
        email: bookingForm.email.trim(),
        phone: bookingForm.phone.trim(),
        person: bookingForm.person,
        checkIn,
        checkOut,
        bookingSource: "Website",
      },
      {
        onSuccess: (res) => {
          if (!res.isSuccess || !res.data?.bookingId) {
            const message = res.errors?.[0] || res.message || t("booking.errors.createUnavailable");
            setFormError(message);
            toast.error(message);
            return;
          }

          createPaypalOrder(
            { bookingId: res.data.bookingId },
            {
              onSuccess: (orderRes) => {
                localStorage.setItem("paypal_order_id", orderRes.orderId);
                try {
                  localStorage.removeItem(`rent_booking_draft_${propertyId}`);
                } catch {
                  // Ignore
                }
                savePaymentBookingContext({
                  kind: "rent",
                  bookingId: res.data.bookingId,
                  bookingNumber: res.data.bookingNumber,
                  propertyId,
                  propertyName,
                  checkIn,
                  checkOut,
                  guests: bookingForm.person,
                });
                window.location.href = orderRes.approvalUrl;
              },
              onError: (error) => {
                const message = getApiErrorMessage(error, t("booking.errors.paymentStartFailed"));
                setFormError(message);
                toast.error(message);
              },
            }
          );
        },
        onError: (error) => {
          const message = getApiErrorMessage(error, t("booking.errors.createFailed"));
          setFormError(message);
          toast.error(message);
        },
      }
    );
  };

  // ─── Image Gallery and Info Setup ───
  const propertyWithOptionalCover = property as Property & { coverImageUrl?: string | null };
  const galleryImages = (property.images || [])
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((img) => ({
      src: resolveApiImageUrl(img.imageUrl),
      alt: property.name,
    }));
  const fallbackImage =
    resolveApiImageUrl(propertyWithOptionalCover.coverImageUrl) ||
    resolveApiImageUrl(property.category?.imageUrl) ||
    "/rent/property-card.png";
  if (galleryImages.length === 0) {
    galleryImages.push({ src: fallbackImage, alt: property.name });
  }

  const categoryNameById = new Map(includeCategories.map((category) => [category.id, category.name]));
  const categoryIconByName = new Map<string, string | null>(
    includeCategories.map((category) => [
      normalizeLookupKey(category.name),
      category.defaultIcon || category.icon || null,
    ])
  );
  const itemIconByName = new Map<string, string | null>();
  const itemIconByCategoryAndName = new Map<string, string | null>();
  includeItems.forEach((item) => {
    itemIconByName.set(normalizeLookupKey(item.name), item.icon ?? null);
    const categoryName = categoryNameById.get(item.propertyCategoryId);
    if (categoryName) {
      itemIconByCategoryAndName.set(`${normalizeLookupKey(categoryName)}::${normalizeLookupKey(item.name)}`, item.icon ?? null);
    }
  });

  const basicAmenities: { name: string; icon: string | null }[] = [];
  const amenityCategories = getPropertyCategoryGroupsFromValues(property, includeCategories, includeItems);
  amenityCategories.forEach((cat) => {
    cat.items.forEach((item) => {
      if (basicAmenities.length < 6) {
        const categoryKey = normalizeLookupKey(cat.categoryName);
        const itemKey = normalizeLookupKey(item);
        const icon = itemIconByCategoryAndName.get(`${categoryKey}::${itemKey}`) ?? itemIconByName.get(itemKey) ?? null;
        basicAmenities.push({ name: item, icon });
      }
    });
  });

  const selectedLandmarks = getPropertyLandmarks(property, landmarkItems);

  return (
    <main className="bg-[#F3F0E9] pb-24 font-[var(--font-poppins)] text-[#183c2f] lg:pb-12">
      <section className="px-4 pb-12 pt-5 sm:px-6 lg:px-16 lg:pb-8 lg:pt-10">
        <div className="mx-auto w-full max-w-[1282px]">
          {/* ─── Top Mosaic Gallery (Above Title, per Figma design) ─── */}
          <div className="min-w-0">
            <ScrollAnimation delay={0} className="min-w-0">
              <PropertyImageGallery images={galleryImages} variant="mosaic" className="mx-auto max-w-[1282px]" />
            </ScrollAnimation>
          </div>

          {/* ─── Property Title & Subtitle Directly Under Gallery ─── */}
          <ScrollAnimation delay={0.05}>
            <header className="mt-8 lg:mt-10">
              <h1 className="text-[28px] font-medium leading-[32px] tracking-[0%] text-[#183c2f] lg:text-[45px] lg:leading-[35px]">
                {property.name}
              </h1>
              <p className="mt-2.5 text-[14px] text-[#718288] lg:text-[16px]">
                {property.description
                  ? property.description.split("\n")[0].slice(0, 100)
                  : t("property.tagline", { defaultValue: "Enjoy a luxurious place You can relax and unwind there." })}
              </p>
            </header>
          </ScrollAnimation>

          {/* ─── Top 2-Column Section on Desktop: Left Showcase & Right Sticky Booking Card ─── */}
          <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1.72fr)_380px] xl:grid-cols-[minmax(0,1.72fr)_420px] lg:gap-10 xl:gap-12 lg:items-start">
            {/* ─── Left Column: Overview & About Property ─── */}
            <div className="min-w-0 space-y-7">
              {/* 1. Property Overview Cards (Price/Specs Box & Basic Amenities Box) */}
              <ScrollAnimation delay={0.05}>
                <PropertyOverviewCard
                  property={property}
                  basicAmenities={basicAmenities}
                  activePriceInfo={activePriceInfo}
                  activeNightPrice={activeNightPrice}
                  currencyCode={currencyCode}
                />
              </ScrollAnimation>

              {/* 2. Description (About Property) */}
              <ScrollAnimation delay={0.05}>
                <DescriptionSection text={property.description} />
              </ScrollAnimation>
            </div>

            {/* ─── Right Column: Sticky Booking Sidebar on Desktop / Stacked on Mobile ─── */}
            <aside className="min-w-0 lg:sticky lg:top-24 self-start">
              <PropertyBookingCard
                idPrefix="main"
                propertyId={property.id}
                propertyName={property.name}
                basePrice={basePrice}
                nightPrice={activeNightPrice}
                currencyCode={currencyCode}
                capacity={capacity}
                rating={averageRating}
                totalReviews={totalReviews}
                todayString={todayString}
                checkIn={checkIn}
                checkOut={checkOut}
                nights={nights}
                onCheckInChange={handleCheckInChange}
                onCheckOutChange={handleCheckOutChange}
                onClearDates={clearDates}
                bookingForm={bookingForm}
                setBookingForm={setBookingForm}
                hasAcceptedRules={hasAcceptedRules}
                setHasAcceptedRules={setHasAcceptedRules}
                formError={formError}
                isPending={isPending}
                isCheckingPrice={isCheckingPrice}
                isPriceUnavailable={isPriceUnavailable}
                estimatedTotal={estimatedTotal}
                missingDates={missingDates}
                onSubmitBooking={submitBooking}
                onScrollToCalendar={scrollToCalendar}
              />
            </aside>
          </div>

          {/* ─── Full-Width Widgets: More Amenities, Terms & Conditions, Landmarks & Availability Calendar ─── */}
          <div className="mt-10 space-y-9 lg:mt-12 lg:space-y-10">
            {/* 3. More Amenities (Full Width) */}
            <ScrollAnimation delay={0.05}>
              <AmenitiesSection
                categories={amenityCategories}
                categoryIconByName={categoryIconByName}
                itemIconByName={itemIconByName}
                itemIconByCategoryAndName={itemIconByCategoryAndName}
              />
            </ScrollAnimation>

            {/* 4. Terms & Conditions (Full Width) */}
            <ScrollAnimation delay={0.05}>
              <TermsAndConditionsSection property={property} />
            </ScrollAnimation>

            {/* 5. Info Area (Landmarks - Full Width) */}
            {selectedLandmarks.length > 0 && (
              <ScrollAnimation delay={0.05}>
                <LandmarksSection landmarks={selectedLandmarks} />
              </ScrollAnimation>
            )}

            {/* 6. Interactive Calendar (Full Width) */}
            <ScrollAnimation delay={0.05}>
              <AvailabilityCalendarSection
                checkIn={checkIn}
                checkOut={checkOut}
                onSelectDate={selectDate}
                onClearDates={clearDates}
                months={months}
                monthsToShow={monthsToShow}
                setMonthsToShow={setMonthsToShow}
                nights={nights}
              />
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* ─── Reviews & Ratings Section (Figma 2-Column Section at Bottom) ─── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-[1282px] px-4 sm:px-6 lg:px-16">
          <ScrollAnimation delay={0.05}>
            <ReviewsSection propertyId={property.id} propertyName={property.name} />
          </ScrollAnimation>
        </div>
      </section>

      {/* ─── Mobile Sticky Bottom Bar (Screens < 1024px) ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#dfe8e4] bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-[1282px] items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[18px] font-bold text-[#183c2f]">{formatCurrency(activeNightPrice, currencyCode)}</span>
              <span className="text-[12px] text-[#667c74]">/ {t("common.night")}</span>
            </div>
            <p className="text-[11px] font-medium text-[#8a9a94]">
              {checkIn && checkOut
                ? t("property.staySummary", {
                  checkIn,
                  checkOut,
                  nights,
                  nightLabel: nights === 1 ? t("common.night") : t("common.nights"),
                })
                : t("booking.selectDates")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("booking-card-main") || document.getElementById("booking-card-mobile") || document.getElementById("booking-card");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#2C798B] px-6 text-[14px] font-semibold text-white shadow-md transition hover:bg-[#183640] active:scale-95"
          >
            {t("common.bookNow")}
          </button>
        </div>
      </div>
    </main>
  );
}

function PropertyOverviewCard({
  property,
  basicAmenities,
  activePriceInfo,
  activeNightPrice,
  currencyCode,
}: {
  property: Property;
  basicAmenities: { name: string; icon: string | null }[];
  activePriceInfo?: PriceInfo | null;
  activeNightPrice?: number;
  currencyCode?: string;
}) {
  const { t, locale } = useI18n();

  const locationText =
    [property.address?.street, property.address?.area, property.address?.city, property.address?.country]
      .filter(Boolean)
      .join(", ") || t("home.featured.locationMissing") || (locale === "ar" ? "الغردقة، مصر" : "Hurghada, Egypt");

  const typeKey = property.propertyType ? propertyTypeKeyById[property.propertyType] : undefined;
  const propertyTypeName = typeKey
    ? t(typeKey)
    : property.propertyTypeName || (property.propertyType ? propertyTypeNames[property.propertyType] : t("rent.apartment")) || t("rent.apartment");

  const areaUnit = locale === "ar" ? "م²" : "m²";

  const displayedPrice = activeNightPrice ?? getPriceInfoAmount(property.basePriceInfo, property.basePrice || 0);

  return (
    <div className={`grid gap-4 sm:gap-5 ${basicAmenities.length > 0 ? "md:grid-cols-2 md:items-stretch" : "grid-cols-1"}`}>
      {/* ─── Box 1: Price, Location & Specs ─── */}
      <article className="flex flex-col justify-between rounded-2xl border border-[#dfe8e4] bg-white p-5 shadow-[0_2px_12px_rgba(24,60,47,0.03)] sm:p-6">
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <p className="text-[24px] font-bold text-[#183c2f] lg:text-[28px]">
                {formatPriceInfo(activePriceInfo, displayedPrice, currencyCode)}
              </p>
              <span className="text-[13px] text-[#667c74]">/ {t("common.night")}</span>
            </div>
            <p className="text-[13px] text-[#667c74]">
              {property.size ? `${property.size} ${areaUnit}` : `175 ${areaUnit}`}
            </p>
          </div>

          <p className="mt-2.5 flex items-start gap-2 text-[12.5px] leading-5 text-[#667c74]">
            <Image
              src="/homepage/properties/icons/location.svg"
              alt=""
              width={16}
              height={16}
              className="mt-0.5 size-4 shrink-0"
            />
            <span className="min-w-0 break-words">{locationText}</span>
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#eef2f0] pt-3 text-[12px] text-[#40544c]">
          <span className="inline-flex items-center gap-1.5">
            <Image src="/homepage/properties/icons/size.svg" alt="" width={15} height={15} className="size-[15px] opacity-70" />
            <span>{propertyTypeName}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Image src="/billing/icons/tenant.svg" alt="" width={15} height={15} className="size-[15px] opacity-70" />
            <span>{property.capacity || 2} {t("property.guests")}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Image src="/homepage/properties/icons/bed.svg" alt="" width={15} height={15} className="size-[15px] opacity-70" />
            <span>{property.bedroomNo || 1} {Number(property.bedroomNo || 1) === 1 ? t("property.bedroom") : t("property.bedrooms")}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Image src="/homepage/properties/icons/bath.svg" alt="" width={15} height={15} className="size-[15px] opacity-70" />
            <span>{property.bathroomNo || 1} {Number(property.bathroomNo || 1) === 1 ? t("buy.bathroom", { defaultValue: "Bathroom" }) : t("buy.bathrooms", { defaultValue: "Bathrooms" })}</span>
          </span>
        </div>
      </article>

      {/* ─── Box 2: Basic Amenities in its own box ─── */}
      {basicAmenities.length > 0 && (
        <article className="flex flex-col justify-center rounded-2xl border border-[#dfe8e4] bg-white p-5 shadow-[0_2px_12px_rgba(24,60,47,0.03)] sm:p-6">
          <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 w-full">
            {basicAmenities.map((amenity, i) => (
              <div key={i} className="flex items-center gap-2.5 min-w-0">
                {amenity.icon ? (
                  <DynamicAmenityIcon icon={amenity.icon} width={18} height={18} className="size-[18px] shrink-0 object-contain text-[#2C798B]" />
                ) : (
                  <Image src="/icons/amenities/amenities-title.svg" alt="" width={18} height={18} className="size-[18px] shrink-0" />
                )}
                <span className="text-[12.5px] font-medium leading-snug text-[#344840] break-words">
                  {amenity.name}
                </span>
              </div>
            ))}
          </div>
        </article>
      )}
    </div>
  );
}

function DescriptionSection({ text }: { text: string }) {
  const { t } = useI18n();

  return (
    <section>
      <SectionTitle>{t("buy.aboutProperty", { defaultValue: "About Property" })}</SectionTitle>
      <p className="mt-5 whitespace-pre-line text-[14px] leading-[1.9] text-[#656566] lg:mt-7 lg:text-[16px] lg:leading-[25px]">
        {text || t("property.noDescription")}
      </p>
    </section>
  );
}

function AmenitiesSection({
  categories,
  categoryIconByName,
  itemIconByName,
  itemIconByCategoryAndName,
}: {
  categories: PropertyCategoryGroup[];
  categoryIconByName: Map<string, string | null>;
  itemIconByName: Map<string, string | null>;
  itemIconByCategoryAndName: Map<string, string | null>;
}) {
  const { t } = useI18n();

  if (!categories || categories.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#dfe8e4] bg-white px-5 pb-5 pt-3.5 shadow-[0_2px_12px_rgba(24,60,47,0.03)] sm:px-6 sm:pb-6 sm:pt-4">
      <div className="flex items-center gap-3">
        <Image src="/icons/amenities/amenities-title.svg" alt="" width={26} height={26} className="object-contain" />
        <SectionTitle>{t("buy.moreAmenities", { defaultValue: "More Amenities" })}</SectionTitle>
      </div>
      <div className="mt-5 grid gap-6">
        {categories.map((cat) => (
          <div key={cat.categoryName}>
            <h3 className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#f5f7f6] px-3 text-[14px] font-semibold text-[#183c2f]">
              <DynamicAmenityIcon
                icon={categoryIconByName.get(normalizeLookupKey(cat.categoryName))}
                width={18}
                height={18}
                className="size-[18px] object-contain"
              />
              {cat.categoryName}
            </h3>
            <ul className="mt-3 grid gap-x-4 gap-y-2.5 text-[14px] leading-5 text-[#556960] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {cat.items?.map((item, index) => {
                const categoryKey = normalizeLookupKey(cat.categoryName);
                const itemKey = normalizeLookupKey(item);
                const icon = itemIconByCategoryAndName.get(`${categoryKey}::${itemKey}`) ?? itemIconByName.get(itemKey);

                return (
                  <li key={`${item}-${index}`} className="flex items-center gap-2.5">
                    <DynamicAmenityIcon
                      icon={icon}
                      width={16}
                      height={16}
                      className="size-4 shrink-0 object-contain"
                    />
                    <span>{item}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function TermsAndConditionsSection({ property }: { property: Property }) {
  const { t } = useI18n();
  const listing = property.listingDetails;

  return (
    <section className="rounded-2xl border border-[#dfe8e4] bg-white p-5 shadow-[0_2px_12px_rgba(24,60,47,0.03)] sm:p-6">
      <div className="flex items-center gap-3">
        <svg className="size-6 text-[#2C798B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <SectionTitle>{t("property.termsAndConditions", { defaultValue: "Terms & Conditions" })}</SectionTitle>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* House Rules */}
        <div>
          <h3 className="text-[14px] font-bold text-[#183c2f]">{t("property.houseRules", { defaultValue: "House Rules" })}</h3>
          <ul className="mt-3 space-y-2.5 text-[13px] text-[#556960]">
            <li className="flex items-center gap-2">
              <span className="grid size-4 place-items-center rounded-full bg-[#e8f4f0] text-[11px] font-bold text-[#2C798B]">✓</span>
              <span>{t("property.smokingAllowed", { defaultValue: "Smoking Allowed" })}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="grid size-4 place-items-center rounded-full bg-[#e8f4f0] text-[11px] font-bold text-[#2C798B]">✓</span>
              <span>{t("property.petsAllowed", { defaultValue: "Pets Allowed" })}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="grid size-4 place-items-center rounded-full bg-[#e8f4f0] text-[11px] font-bold text-[#2C798B]">✓</span>
              <span>{t("property.partyAllowed", { defaultValue: "Party Allowed" })}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="grid size-4 place-items-center rounded-full bg-[#e8f4f0] text-[11px] font-bold text-[#2C798B]">✓</span>
              <span>{t("property.childrenAllowed", { defaultValue: "Children Allowed" })}</span>
            </li>
          </ul>
        </div>

        {/* Cancellation Policy */}
        <div>
          <h3 className="text-[14px] font-bold text-[#183c2f]">{t("property.cancellationPolicy", { defaultValue: "Cancellation Policy" })}</h3>
          <p className="mt-3 text-[13px] leading-relaxed text-[#556960]">
            {listing?.cancellation || property.rulesCancellation || t("property.cancellationDefault", { defaultValue: "Free cancellation for 48 hours. Contact the owner to cancel the booking." })}
          </p>
        </div>

        {/* Other Rules */}
        <div>
          <h3 className="text-[14px] font-bold text-[#183c2f]">{t("property.otherRules", { defaultValue: "Other Rules" })}</h3>
          <p className="mt-3 text-[13px] leading-relaxed text-[#556960]">
            {property.notes || t("property.otherRulesDefault", { defaultValue: "No parties or events. Self check-in with the lockbox." })}
          </p>
          {(listing?.checkInHour || listing?.checkOutHour) && (
            <p className="mt-2 text-[12px] font-medium text-[#718288]">
              {listing?.checkInHour ? `${t("property.checkInLabel")}: ${listing.checkInHour}` : ""}
              {listing?.checkInHour && listing?.checkOutHour ? " • " : ""}
              {listing?.checkOutHour ? `${t("property.checkOutLabel")}: ${listing.checkOutHour}` : ""}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function LandmarksSection({ landmarks }: { landmarks: AttributeGroupItem[] }) {
  if (landmarks.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#dfe8e4] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(24,60,47,0.03)]">
      <div className="flex items-center gap-2">
        <Image src={DEFAULT_LANDMARK_ICON} alt="" width={22} height={22} className="size-[22px] object-contain" />
        <SectionTitle>Info Area</SectionTitle>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {landmarks.map((landmark) => (
          <article key={landmark.id} className="flex min-w-0 items-center gap-3 rounded-xl bg-[#f5f7f6] px-4 py-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-[#2C798B]">
              <Image src={DEFAULT_LANDMARK_ICON} alt="" width={16} height={16} className="size-4 object-contain" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-[13px] font-semibold text-[#183c2f]">{landmark.key}</h3>
              <p className="mt-0.5 text-[12px] font-medium text-[#667c74]">{landmark.value}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AvailabilityCalendarSection({
  checkIn,
  checkOut,
  onSelectDate,
  onClearDates,
  months,
  monthsToShow,
  setMonthsToShow,
  nights,
}: {
  checkIn: string;
  checkOut: string;
  onSelectDate: (day: CalendarDay) => void;
  onClearDates: () => void;
  months: Array<{
    title: string;
    startOffset: number;
    days: CalendarDay[];
  }>;
  monthsToShow: number;
  setMonthsToShow: (count: number) => void;
  nights: number;
}) {
  const { t } = useI18n();

  return (
    <section
      id="availability-calendar"
      className="scroll-mt-24 rounded-2xl border border-[#dfe8e4] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(24,60,47,0.03)]"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#edf2ef] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="size-6 bg-[#2C798B]"
              style={{
                WebkitMask: "url('/billing/icons/calendar.svg') center / contain no-repeat",
                mask: "url('/billing/icons/calendar.svg') center / contain no-repeat",
              }}
            />
            <SectionTitle>{t("property.availability", { defaultValue: "Availability" })}</SectionTitle>
          </div>
          <p className="mt-1 text-[13px] text-[#667c74]">
            {checkIn && checkOut
              ? t("property.selectedRange", { checkIn, checkOut, nights, nightLabel: nights === 1 ? t("common.night") : t("common.nights") })
              : checkIn
                ? t("property.checkInOnly", { checkIn })
                : t("property.selectDatesCalendar")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(checkIn || checkOut) && (
            <button
              type="button"
              onClick={onClearDates}
              className="rounded-full border border-[#dfe8e4] bg-white px-3 py-1 text-[12px] font-medium text-[#667c74] hover:border-[#2C798B] hover:text-[#183c2f]"
            >
              {t("common.clearDates")}
            </button>
          )}

          <div className="inline-flex rounded-full border border-[#dfe8e4] bg-[#f8faf9] p-1">
            {[1, 2].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setMonthsToShow(count)}
                className={`h-8 rounded-full px-3 text-[12px] font-semibold transition ${monthsToShow === count ? "bg-[#2C798B] text-white" : "text-[#667c74] hover:text-[#183c2f]"
                  }`}
              >
                {t("property.oneMonth", { count })}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`mt-6 grid gap-6 ${monthsToShow > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
        {months.map((month) => (
          <CalendarMonth
            key={month.title}
            {...month}
            checkIn={checkIn}
            checkOut={checkOut}
            onSelectDate={onSelectDate}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 border-t border-[#edf2ef] pt-4 text-[11px] leading-4 text-[#6f8793]">
        <Legend label={t("property.past")} className="bg-[#f1f5f8]" />
        <Legend label={t("property.today")} className="border border-[#2C798B] bg-white" />
        <Legend label={t("property.booked")} className="bg-[#e9eef3]" />
        <Legend label={t("property.selected")} className="bg-[#2C798B]" />
      </div>
    </section>
  );
}

function CalendarMonth({
  title,
  startOffset,
  days,
  checkIn,
  checkOut,
  onSelectDate,
}: {
  title: string;
  startOffset: number;
  days: CalendarDay[];
  checkIn: string;
  checkOut: string;
  onSelectDate: (day: CalendarDay) => void;
}) {
  return (
    <div className="min-w-0">
      <h3 className="text-center text-[13px] font-bold leading-5 text-[#101d28]">{title}</h3>
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {weekdays.map((day) => (
          <span key={day} className="grid h-5 place-items-center text-[9px] font-bold text-[#101d28]">
            {day}
          </span>
        ))}

        {Array.from({ length: startOffset }, (_, index) => (
          <span key={`empty-${index}`} aria-hidden="true" className="h-[38px] lg:h-[42px]" />
        ))}

        {days.map((calendarDay) => (
          <CalendarDayButton
            key={calendarDay.date}
            day={calendarDay}
            checkIn={checkIn}
            checkOut={checkOut}
            onSelectDate={onSelectDate}
          />
        ))}
      </div>
    </div>
  );
}

function CalendarDayButton({
  day,
  checkIn,
  checkOut,
  onSelectDate,
}: {
  day: CalendarDay;
  checkIn: string;
  checkOut: string;
  onSelectDate: (day: CalendarDay) => void;
}) {
  const isDisabled = day.status === "past" || day.status === "booked";
  const isRangeEdge = day.date === checkIn || day.date === checkOut;
  const isInRange = Boolean(checkIn && checkOut && day.date > checkIn && day.date < checkOut);
  const stateClass = isRangeEdge
    ? "border-[#2C798B] bg-[#2C798B] font-bold text-white shadow-[0_4px_12px_rgba(46,111,87,0.18)]"
    : isInRange
      ? "border-[#2C798B] bg-[#2C798B] font-bold text-white"
      : day.status === "available"
        ? "border-[#2C798B] bg-[#f5f7f6] font-bold text-[#2C798B] shadow-[0_1px_0_rgba(46,111,87,0.08)] hover:bg-[#eef7f3]"
        : day.status === "booked"
          ? "border-[#dfe7ee] bg-[#edf2f6] text-[#7e8c98]"
          : day.status === "today"
            ? "border-[#2C798B] bg-white text-[#2C798B] hover:bg-[#eef7f3]"
            : "border-[#dfe7ee] bg-white text-[#2f3a48]";

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onSelectDate(day)}
      className={`flex h-[38px] min-w-0 flex-col items-center justify-center rounded-md border text-center text-[10px] leading-none transition lg:h-[42px] ${isDisabled ? "cursor-not-allowed" : ""
        } ${stateClass}`}
    >
      <span className={day.status === "available" || isRangeEdge ? "font-bold" : ""}>
        {day.day}
      </span>
      {day.price && (
        <span className="mt-0.5 text-[6px] font-bold leading-none text-current">
          {day.price}
        </span>
      )}
    </button>
  );
}

function Legend({ label, className }: { label: string; className: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-2.5 rounded-sm ${className}`} />
      {label}
    </span>
  );
}

function ReviewsSection({ propertyId, propertyName }: { propertyId: string; propertyName: string }) {
  const { t, locale } = useI18n();
  const { data: averageData } = usePropertyAverageRating(propertyId);
  const { data: reviewsData, isLoading: isLoadingReviews } = useReviews({
    SearchTerm: propertyName,
    PageSize: 10,
    SortBy: "createdAtUtc",
    IsDescending: true,
  });

  const reviews = reviewsData?.items ?? [];
  const average = averageData?.averageRating ?? 0;
  const totalReviews = averageData?.totalReviews ?? reviews.length;
  const [displayCount, setDisplayCount] = useState(3);

  const visibleReviews = reviews.slice(0, displayCount);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10 lg:items-start">
      {/* ─── Left Column: Reviews & comments ─── */}
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <svg className="size-6 text-[#2C798B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <SectionTitle>{t("reviews.sectionTitle", { defaultValue: "Reviews & comments" })}</SectionTitle>
        </div>

        {/* Rating summary - only shown when there are real reviews */}
        {totalReviews > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[20px] font-bold text-[#183c2f] sm:text-[22px]">
              {average.toFixed(1)} {locale === "ar" ? "من 5" : "out of 5"}
            </span>
            <div className="flex text-[#2C798B] text-[18px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= Math.round(average) ? "text-[#2C798B]" : "text-[#d1dcd6]"}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="mt-6 space-y-4">
          {isLoadingReviews ? (
            <div className="flex h-28 items-center justify-center">
              <span className="size-6 animate-spin rounded-full border-2 border-[#183c2f] border-t-transparent" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-[#dfe8e4] bg-white p-6 text-center shadow-xs">
              <p className="text-[14px] font-semibold text-[#183c2f]">{t("reviews.emptyTitle")}</p>
              <p className="mt-1 text-[13px] text-[#667c74]">{t("reviews.emptySubtitle")}</p>
            </div>
          ) : (
            visibleReviews.map((review) => {
              const initial = (review.customerName || "G").charAt(0).toUpperCase();
              return (
                <article
                  key={review.id}
                  className="rounded-2xl border border-[#dfe8e4] bg-white p-5 shadow-[0_2px_10px_rgba(24,60,47,0.02)] transition hover:border-[#2C798B]/50"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e8eeec] text-[14px] font-bold text-[#183c2f]">
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <h4 className="text-[15px] font-bold text-[#183c2f]">
                          {review.customerName || t("reviews.verifiedGuest")}
                        </h4>
                        <span className="text-[12px] text-[#8a9a94]">
                          {new Date(review.createdAtUtc).toLocaleDateString(locale === "ar" ? "ar-EG" : locale, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-[#556960] whitespace-pre-wrap">
                        {review.comment}
                      </p>
                      <div className="mt-2 flex text-[#2C798B] text-[14px]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= review.rate ? "text-[#2C798B]" : "text-[#d1dcd6]"}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {reviews.length > visibleReviews.length && (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setDisplayCount((prev) => prev + 3)}
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#2C798B] transition hover:text-[#183c2f]"
            >
              <span>{t("reviews.loadMore") || "Load more"}</span>
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ─── Right Column: Share your opinion ─── */}
      <div className="min-w-0">
        <AddReviewForm propertyName={propertyName} />
      </div>
    </div>
  );
}

function AddReviewForm({ propertyName }: { propertyName: string }) {
  const { t } = useI18n();
  const [bookingNumber, setBookingNumber] = useState("");
  const [rate, setRate] = useState(5);
  const [hoverRate, setHoverRate] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { mutate: submitReview, isPending } = useCreateReview();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedBooking = bookingNumber.trim();
    if (!trimmedBooking) {
      setErrorMessage(t("reviews.errorBookingRequired"));
      return;
    }
    if (!comment.trim()) {
      setErrorMessage(t("reviews.errorCommentRequired"));
      return;
    }

    submitReview(
      {
        bookingNumber: trimmedBooking,
        rate,
        comment: comment.trim(),
      },
      {
        onSuccess: () => {
          setSuccessMessage(t("reviews.successMessage"));
          toast.success(t("reviews.successToast"));
          setBookingNumber("");
          setComment("");
          setRate(5);
        },
        onError: (err: unknown) => {
          const errorData = err as { response?: { data?: { errors?: string[]; message?: string } } };
          const rawError =
            errorData?.response?.data?.errors?.[0] ||
            errorData?.response?.data?.message ||
            "";

          let friendlyError = t("reviews.errorGeneric");

          if (rawError.toLowerCase().includes("completed")) {
            friendlyError = t("reviews.errorBookingNotCompleted");
          } else if (rawError.toLowerCase().includes("already") || rawError.toLowerCase().includes("unique")) {
            friendlyError = t("reviews.errorAlreadySubmitted");
          } else if (rawError.toLowerCase().includes("not found")) {
            friendlyError = t("reviews.errorBookingNotFound");
          } else if (rawError) {
            friendlyError = rawError;
          }

          setErrorMessage(friendlyError);
          toast.error(friendlyError);
        },
      }
    );
  }

  const ratingDescriptions: Record<number, string> = {
    5: t("reviews.rating5"),
    4: t("reviews.rating4"),
    3: t("reviews.rating3"),
    2: t("reviews.rating2"),
    1: t("reviews.rating1"),
  };

  return (
    <section id="add-review-section" className="scroll-mt-24 rounded-2xl border border-[#dfe8e4] bg-white p-5 shadow-[0_2px_12px_rgba(24,60,47,0.03)] sm:p-7">
      <h3 className="text-[20px] font-bold text-[#183c2f] sm:text-[22px]">
        {t("reviews.shareOpinion", { defaultValue: "Share your opinion" })}
      </h3>

      {errorMessage && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-[14px] text-amber-900">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 size-5 shrink-0 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p className="font-semibold">{t("reviews.noticeTitle")}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-amber-800">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-[14px] text-green-800">
          <p className="font-semibold">{t("reviews.receivedTitle")}</p>
          <p className="mt-0.5 text-[13px]">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Your Rating */}
        <div>
          <label className="block text-[13px] font-semibold text-[#183c2f]">
            {t("reviews.yourRating", { defaultValue: "Your Rating" })}
          </label>
          <div className="mt-1.5 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRate(star)}
                  onMouseEnter={() => setHoverRate(star)}
                  onMouseLeave={() => setHoverRate(null)}
                  className="p-1 text-[24px] leading-none transition hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${star} star`}
                >
                  <span className={star <= (hoverRate ?? rate) ? "text-[#2C798B]" : "text-[#d1dcd6]"}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            <span className="text-[12.5px] font-medium text-[#656566]">
              {ratingDescriptions[hoverRate ?? rate]}
            </span>
          </div>
        </div>

        {/* Booking Number / Name input */}
        <div>
          <label className="block text-[13px] font-semibold text-[#183c2f]">
            {t("reviews.nameOptional", { defaultValue: "Booking Number" })} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={bookingNumber}
            onChange={(e) => setBookingNumber(e.target.value)}
            placeholder={t("reviews.bookingNumberPlaceholder", { defaultValue: "Enter your booking number" })}
            required
            className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfdfc] px-4 text-[13.5px] text-[#183c2f] outline-none transition placeholder:text-[#aab4b0] focus:border-[#2C798B] focus:bg-white"
          />
        </div>

        {/* Review comment */}
        <div>
          <label className="block text-[13px] font-semibold text-[#183c2f]">
            {t("reviews.yourReview", { defaultValue: "Your review" })} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("reviews.feedbackPlaceholder", { defaultValue: "Write your review here...." })}
            required
            rows={4}
            className="mt-1.5 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfdfc] p-3.5 text-[13.5px] text-[#183c2f] outline-none transition placeholder:text-[#aab4b0] focus:border-[#2C798B] focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2C798B] px-6 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#183640] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t("reviews.submitting")}
            </>
          ) : (
            t("reviews.submit", { defaultValue: "Submit" })
          )}
        </button>
      </form>
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[18px] font-medium leading-[32px] tracking-[0%] text-[#183c2f] lg:text-[25px] lg:leading-[25px]">
      {children}
    </h2>
  );
}
