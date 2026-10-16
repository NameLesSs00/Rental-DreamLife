"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

export interface LogoProps {
  /** "default" = #0D768E text and navy mark; "white" = pure white mark and white text */
  variant?: "default" | "white";
  /** Alias for variant="white" when placed on dark backgrounds */
  isDark?: boolean;
  /** Optional link destination; if not provided, renders as a div */
  href?: string;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  /** Custom width for the icon (default ~38px - 44px based on context) */
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
  iconHeight = 39,
  showText = true,
  priority = false,
  onClick,
}: LogoProps) {
  const isWhite = variant === "white" || isDark;

  const content = (
    <div
      className={`inline-flex items-center gap-2.5 transition-opacity hover:opacity-95 ${className}`}
      onClick={onClick}
    >
      <Image
        src="/logo.svg"
        alt="Dream Life Logo"
        width={62}
        height={52}
        priority={priority}
        unoptimized
        className={`h-9 w-auto shrink-0 object-contain sm:h-10 lg:h-11 ${
          isWhite ? "brightness-0 invert" : ""
        } ${iconClassName}`}
        style={{
          width: iconWidth ? `${iconWidth}px` : undefined,
          height: iconHeight ? `${iconHeight}px` : undefined,
        }}
      />

      {showText && (
        <span
          className={`font-dm-serif italic font-normal tracking-normal select-none leading-none ${
            isWhite ? "text-white" : "text-[#0D768E]"
          } text-[24px] sm:text-[26px] lg:text-[28px] ${textClassName}`}
          style={{
            fontFamily: "var(--font-dm-serif-display), 'DM Serif Display', serif",
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: "100%",
            letterSpacing: "0%",
          }}
        >
          Dream Life
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Dream Life Home" className="inline-flex shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}
