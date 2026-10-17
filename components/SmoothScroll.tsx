"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Keep native scrolling inside admin panel for maximum precision and speed
    if (pathname?.startsWith("/admin")) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      return;
    }

    if (!lenisRef.current) {
      // Pure lerp mode gives the signature fluid, floating inertia
      const lenis = new Lenis({
        lerp: 0.075, // Lower = floatier & smoother, Higher = more instant
        smoothWheel: true,
        wheelMultiplier: 1.05, // Slightly boosted for effortless glide
        touchMultiplier: 1.2,
        infinite: false,
        autoResize: true,
      });

      lenisRef.current = lenis;
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

      // High-performance requestAnimationFrame loop bound directly to browser vsync
      let rafId: number;
      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      return () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
        lenisRef.current = null;
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      };
    }

    // Reset scroll on page transition
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
