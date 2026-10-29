"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useI18n } from "./I18nProvider";

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
      className="relative mx-auto flex w-full max-w-[440px] shrink-0 items-center justify-center sm:max-w-[480px] lg:mx-0 lg:max-w-[500px]"
    >
      {/* Top rectangle: left to right, then back */}
      <motion.div
        animate={{ x: [0, secondImage ? 386 : 380] }}
        transition={rectangleTransition}
        className={`pointer-events-none absolute ${
          secondImage ? "-top-[20px] h-[64px] w-[64px]" : "-top-[22px] h-[82px] w-[66px]"
        } left-[20px] z-0 rounded-[16px] bg-[#367e96]`}
      />

      {/* Right rectangle: top to bottom, then back */}
      <motion.div
        animate={{ y: [0, 235] }}
        transition={rectangleTransition}
        className={`pointer-events-none absolute ${
          secondImage ? "-right-[28px] w-[72px]" : "-right-[28px] w-[70px]"
        } top-[18px] z-0 h-[104px] rounded-[16px] bg-[#367e96]`}
      />

      {/* Bottom rectangle: right to left, then back */}
      <motion.div
        animate={{ x: [secondImage ? 346 : 340, 0] }}
        transition={rectangleTransition}
        className={`pointer-events-none absolute ${
          secondImage ? "h-[68px] w-[102px]" : "h-[68px] w-[108px]"
        } -bottom-[22px] left-[20px] z-0 rounded-[16px] bg-[#367e96]`}
      />

      {/* Left rectangle: bottom to top, then back */}
      <motion.div
        animate={{ y: [235, 0] }}
        transition={rectangleTransition}
        className={`pointer-events-none absolute ${
          secondImage ? "-left-[28px] w-[70px]" : "-left-[28px] w-[70px]"
        } top-[18px] z-0 h-[104px] rounded-[16px] bg-[#367e96]`}
      />

      {/* Main image - aspect 4/3 reveals 100% of the image without crop */}
      <div className="relative z-10 aspect-[4/3] w-full overflow-hidden rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] sm:rounded-[32px]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 500px, (min-width: 1024px) 480px, 90vw"
          className="object-cover object-center"
          priority={!secondImage}
        />
      </div>
    </motion.div>
  );
}

export default function OurServices() {
  const { t } = useI18n();

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
            <span>{t("home.services.titlePrefix")}</span>
            <span className="text-[#367e96]">{t("home.services.titleHighlight")}</span>
          </h2>

          <p className="mx-auto mt-3 max-w-[620px] text-[13px] font-normal leading-relaxed text-[#e2e8f0] sm:text-[14px] lg:text-[15px]">
            {t("home.services.subtitle")}
          </p>
        </motion.div>

        {/* Services Rows */}
        <div className="mt-14 flex flex-col gap-16 sm:mt-18 sm:gap-20 lg:mt-24 lg:gap-28 xl:gap-32">
          {/* Row 1 */}
          <div className="flex flex-col items-center justify-between gap-10 lg:flex-row lg:gap-14 xl:gap-20">
            <ImageWithAnimatedRectangles
              src="/homepage/services/handshake.jpg"
              alt={t("home.services.item1Title")}
            />

            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex max-w-[560px] flex-col text-center lg:text-start xl:max-w-[600px]"
            >
              <h3 className="text-[26px] font-semibold leading-[130%] tracking-normal text-white sm:text-[30px] lg:text-[35px]">
                {t("home.services.item1Title")}
              </h3>
              <p className="mt-4 text-[16px] font-normal leading-[1.35] tracking-normal text-white sm:text-[20px] lg:text-[23px] xl:text-[27px] xl:leading-[34px]">
                {t("home.services.item1Body")}
              </p>
            </motion.div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col-reverse items-center justify-between gap-10 lg:flex-row lg:gap-14 xl:gap-20">
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex max-w-[560px] flex-col text-center lg:text-start xl:max-w-[600px]"
            >
              <h3 className="text-[26px] font-semibold leading-[130%] tracking-normal text-white sm:text-[30px] lg:text-[35px]">
                {t("home.services.item2Title")}
              </h3>
              <p className="mt-4 text-[16px] font-normal leading-[1.35] tracking-normal text-white sm:text-[20px] lg:text-[23px] xl:text-[27px] xl:leading-[34px]">
                {t("home.services.item2Body")}
              </p>
            </motion.div>

            <ImageWithAnimatedRectangles
              src="/homepage/services/building.jpg"
              alt={t("home.services.item2Title")}
              secondImage
            />
          </div>
        </div>
      </div>
    </section>
  );
}
