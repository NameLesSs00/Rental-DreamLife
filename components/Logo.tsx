"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

export interface LogoProps {
  /** "default" = dark text / normal colors; "white" = pure white text for dark backgrounds */
  variant?: "default" | "white";
  /** Alias for variant="white" when placed on dark backgrounds */
  isDark?: boolean;
  /** Optional link destination; if not provided, renders as a div */
  href?: string;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  /** Custom width for the icon (default ~44px) */
  iconWidth?: number;
  iconHeight?: number;
  /** Option to hide the text wordmark */
  showText?: boolean;
  priority?: boolean;
  onClick?: () => void;
}

export default function Logo({
  variant = "default",
  isDark = false,
  href,
  className = "",
  iconClassName = "",
  textClassName = "",
  iconWidth = 46,
  iconHeight = 46,
  showText = true,
  priority = false,
  onClick,
}: LogoProps) {
  const isWhite = variant === "white" || isDark;

  const content = (
    <div
      className={`inline-flex items-center gap-2.5 sm:gap-3 transition-opacity hover:opacity-95 ${className}`}
      onClick={onClick}
    >
      <div className="relative shrink-0 overflow-hidden rounded-full">
        <Image
          src={isWhite ? "/logo-white.svg" : "/logo.svg"}
          alt="Sea Key Property Logo"
          width={92}
          height={92}
          priority={priority}
          unoptimized
          className={`h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 shrink-0 object-contain drop-shadow-sm ${iconClassName}`}
          style={{
            width: iconWidth ? `${iconWidth}px` : undefined,
            height: iconHeight ? `${iconHeight}px` : undefined,
          }}
        />
      </div>

      {showText && (
        <div className={`flex flex-col justify-center leading-none select-none ${textClassName}`}>
          <span
            className={`font-[var(--font-poppins),'Poppins',sans-serif] text-[17px] sm:text-[19px] font-bold tracking-[0.03em] uppercase ${
              isWhite ? "text-white" : "text-[#12382e]"
            }`}
          >
            SEA KEY
          </span>
          <span
            className={`font-[var(--font-poppins),'Poppins',sans-serif] text-[9.5px] sm:text-[10px] font-semibold tracking-[0.28em] uppercase mt-1 ${
              isWhite ? "text-white" : "text-[#12382e]"
            }`}
          >
            PROPERTY
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Sea Key Property Home" className="inline-flex shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}

