"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const rectangleTransition = {
  duration: 5,
  repeat: Infinity,
  repeatType: "reverse" as const,
  ease: "easeInOut" as const,
};

function ImageWithAnimatedRectangles({
  src,
  alt,
  secondImage = false,
}: {
  src: string;
  alt: string;
  secondImage?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6 }}
      className="relative mx-auto flex w-full max-w-[394px] shrink-0 items-center justify-center lg:mx-0"
    >
      {/* Top rectangle: left to right, then back */}
      <motion.div
        animate={{ x: [0, secondImage ? 306 : 304] }}
        transition={rectangleTransition}
        className={`pointer-events-none absolute ${secondImage ? "-top-[18px] h-[56px] w-[56px]" : "-top-[20px] h-[75px] w-[58px]"
          } left-[16px] z-0 rounded-[14px] bg-[#367e96]`}
      />

      {/* Right rectangle: top to bottom, then back */}
      <motion.div
        animate={{ y: [0, 198] }}
        transition={rectangleTransition}
        className={`pointer-events-none absolute ${secondImage ? "-right-[24px] w-[65px]" : "-right-[24px] w-[62px]"
          } top-[16px] z-0 h-[92px] rounded-[14px] bg-[#367e96]`}
      />

      {/* Bottom rectangle: right to left, then back */}
      <motion.div
        animate={{ x: [secondImage ? 274 : 270, 0] }}
        transition={rectangleTransition}
        className={`pointer-events-none absolute ${secondImage ? "h-[60px] w-[88px]" : "h-[60px] w-[92px]"
          } -bottom-[20px] left-[16px] z-0 rounded-[14px] bg-[#367e96]`}
      />

      {/* Left rectangle: bottom to top, then back */}
      <motion.div
        animate={{ y: [198, 0] }}
        transition={rectangleTransition}
        className={`pointer-events-none absolute ${secondImage ? "-left-[26px] w-[62px]" : "-left-[26px] w-[62px]"
          } top-[16px] z-0 h-[92px] rounded-[14px] bg-[#367e96]`}
      />

      {/* Main image */}
      <div className="relative z-10 aspect-[394/322] w-full overflow-hidden rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 394px, 90vw"
          className="object-cover object-center"
          priority={!secondImage}
        />
      </div>
    </motion.div>
  );
}

export default function FacilitiesSection() {
  return (
    <section className="relative z-20 overflow-hidden bg-[#183640] px-5 py-16 font-[var(--font-poppins)] sm:px-8 sm:py-20 lg:px-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1240px]">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-[680px] text-center"
        >
          <h2 className="text-[28px] font-bold tracking-tight text-white sm:text-[34px] lg:text-[40px]">
            <span>Our </span>
            <span className="text-[#367e96]">Services</span>
          </h2>

          <p className="mx-auto mt-3 max-w-[620px] text-[13px] font-normal leading-relaxed text-[#c5cccf] sm:text-[14px] lg:text-[15px]">
            From finding the right property to closing the deal, we provide reliable
            real estate solutions built around your needs, budget, and goals.
          </p>
        </motion.div>

        {/* Services Rows */}
        <div className="mt-14 flex flex-col gap-16 sm:mt-18 sm:gap-20 lg:mt-24 lg:gap-28">
          {/* Row 1 */}
          <div className="flex flex-col items-center justify-between gap-12 lg:flex-row lg:gap-16 xl:gap-24">
            <ImageWithAnimatedRectangles
              src="/homepage/services/handshake.png"
              alt="Value You Can Trust"
            />

            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex max-w-[500px] flex-col text-center lg:text-left"
            >
              <h3 className="text-[24px] font-bold leading-tight text-white sm:text-[30px] lg:text-[34px]">
                Value You Can Trust
              </h3>
              <p className="mt-3.5 text-[14px] font-normal leading-relaxed text-[#c5cccf] sm:mt-4 sm:text-[15px] lg:text-[16px]">
                We focus on quality properties, competitive prices, and reliable
                service backed by real market experience.
              </p>
            </motion.div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col-reverse items-center justify-between gap-12 lg:flex-row lg:gap-16 xl:gap-24">
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex max-w-[500px] flex-col text-center lg:text-left"
            >
              <h3 className="text-[24px] font-bold leading-tight text-white sm:text-[30px] lg:text-[34px]">
                Locations That Fit Your Lifestyle
              </h3>
              <p className="mt-3.5 text-[14px] font-normal leading-relaxed text-[#c5cccf] sm:mt-4 sm:text-[15px] lg:text-[16px]">
                We help you find properties in locations that match your
                lifestyle, preferences, and daily needs.
              </p>
            </motion.div>

            <ImageWithAnimatedRectangles
              src="/homepage/services/building.png"
              alt="Locations That Fit Your Lifestyle"
              secondImage
            />
          </div>
        </div>
      </div>
    </section>
  );
}
