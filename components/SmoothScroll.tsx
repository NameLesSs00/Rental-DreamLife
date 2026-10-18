"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Initialize Lenis once and maintain a continuous RAF loop
  useEffect(() => {
    const isReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isReduced || pathname?.startsWith("/admin")) {
      return;
    }

    const lenis = new Lenis({
      duration: 0.85, // Time-based duration: 100% frame-rate independent across 60Hz, 120Hz, 144Hz+
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Instant initial response with smooth exponential glide
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9, // Tuned for notched mouse wheels on Windows PCs (prevents runaway drift)
      touchMultiplier: 1.0, // Preserves natural precision trackpad physics
      syncTouch: false,
      infinite: false,
      autoResize: true,
    });

    lenisRef.current = lenis;
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    }
    rafIdRef.current = requestAnimationFrame(raf);

    // Watch for dynamic changes to reduced motion in OS settings
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches && lenisRef.current) {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
    mediaQuery.addEventListener?.("change", handleMotionChange);

    return () => {
      mediaQuery.removeEventListener?.("change", handleMotionChange);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lenis.destroy();
      lenisRef.current = null;
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  // Handle route transitions cleanly without tearing down the instance
  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      if (lenisRef.current) {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        lenisRef.current.destroy();
        lenisRef.current = null;
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      }
      return;
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
      requestAnimationFrame(() => {
        lenisRef.current?.resize();
      });
    }
  }, [pathname]);

  return null;
}
