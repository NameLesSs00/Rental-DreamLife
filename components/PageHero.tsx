"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { ReactNode } from "react";

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: smoothEase },
  },
};

export interface PageHeroProps {
  imageSrc: string;
  imageAlt: string;
  title: ReactNode;
  subtitle?: ReactNode;
  overlayGradient?: string;
  maxTitleWidth?: string;
  maxSubtitleWidth?: string;
  priority?: boolean;
}

export default function PageHero({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  overlayGradient,
  maxTitleWidth = "max-w-[640px]",
  maxSubtitleWidth = "max-w-[620px]",
  priority = true,
}: PageHeroProps) {
  const shouldReduceMotion = useReducedMotion();

  const initial = shouldReduceMotion ? undefined : "hidden";
  const animate = shouldReduceMotion ? undefined : "visible";

  return (
    <section className="mx-auto w-full max-w-[1780px] px-3 pt-5 sm:px-6 sm:pt-8 lg:px-8">
      <motion.div
        variants={fadeUp}
        initial={initial}
        animate={animate}
        className="relative min-h-[420px] w-full overflow-hidden rounded-[24px] border border-black/5 shadow-sm sm:min-h-[480px] sm:rounded-[32px] lg:min-h-[540px] xl:min-h-[580px]"
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={priority}
          sizes="(min-width: 1780px) 1740px, 100vw"
          className="object-cover object-center"
        />

        {overlayGradient && (
          <div className={`pointer-events-none absolute inset-0 ${overlayGradient}`} />
        )}

        {/* Hero Content: Vertically Centered with inner alignment container */}
        <div className="absolute inset-0 z-10 flex flex-col justify-center">
          <div className="mx-auto w-full max-w-[1536px] px-4 sm:px-6 lg:px-10">
            <h1
              className={`font-[var(--font-poppins)] text-[34px] font-bold leading-[1.12] tracking-[0%] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-[44px] sm:leading-[1.1] lg:text-[52px] lg:leading-[55px] xl:text-[60px] ${maxTitleWidth}`}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={`mt-3.5 font-[var(--font-poppins)] text-[16px] font-semibold leading-[120%] tracking-[0%] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] sm:text-[18px] lg:text-[20px] xl:text-[22px] ${maxSubtitleWidth}`}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
