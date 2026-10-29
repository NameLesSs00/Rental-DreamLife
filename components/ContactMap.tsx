"use client";

import { useI18n } from "./I18nProvider";
import { siteConfig } from "@/lib/site";
import { MapPin, ExternalLink } from "lucide-react";

export default function ContactMap() {
  const { t, locale } = useI18n();
  // El Kawther, Hurghada coordinates (near Metro Market & Al Safra Al Shamiya)
  const lat = 27.1895;
  const lng = 33.8236;
  const addressLabel = t("footer.address") || siteConfig.address.label;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${addressLabel}, Hurghada`)}`;
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=16&ie=UTF8&iwloc=&hl=${locale}&output=embed`;

  return (
    <div className="relative flex h-full min-h-[460px] w-full flex-col overflow-hidden rounded-[20px] border border-[#d8e0dd] bg-[#eef2f0] shadow-xs">
      {/* Interactive Google Map iframe */}
      <iframe
        title="Sea Key Property Office Location - El Kawther, Hurghada"
        src={mapUrl}
        width="100%"
        height="100%"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full min-h-[460px] w-full border-0 object-cover"
      />

      {/* Floating Location Card Overlay */}
      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 sm:inset-x-6 sm:bottom-6">
        <div className="pointer-events-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-start gap-3 min-w-0">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#2C798B] text-white">
              <MapPin className="size-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[14px] font-bold text-[#183640]">
                {siteConfig.name}
              </h4>
              <p className="text-[12.5px] leading-relaxed text-[#718288] line-clamp-2">
                {addressLabel}
              </p>
            </div>
          </div>
          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#183640] px-4 py-2 text-[12.5px] font-semibold text-white shadow-xs transition hover:bg-[#2C798B]"
          >
            <span>{t("contact.openInMaps") || "Open in Google Maps"}</span>
            <ExternalLink className="size-3.5 rtl:rotate-180" />
          </a>
        </div>
      </div>
    </div>
  );
}
