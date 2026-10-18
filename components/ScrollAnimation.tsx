"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollAnimationProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}

export default function ScrollAnimation({
  children,
  delay = 0,
  className = "",
  direction = "up",
  distance = 18,
}: ScrollAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  const getInitialPosition = () => {
    if (shouldReduceMotion) return { x: 0, y: 0 };
    switch (direction) {
      case "up":
        return { y: distance, x: 0 };
      case "down":
        return { y: -distance, x: 0 };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      case "none":
        return { x: 0, y: 0 };
    }
  };

  const initialPosition = getInitialPosition();

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0, ...initialPosition }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -25px 0px", amount: 0.05 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.42,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      style={{
        willChange: "transform, opacity",
        transform: "translateZ(0)",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
