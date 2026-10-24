"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Calendar, ArrowLeft } from "lucide-react";
import type { BlogItem, BlogSection } from "@/lib/types/blog";
import { getBlogSlug } from "@/lib/utils/blogSlug";
import { resolveApiImageUrl } from "@/lib/utils/imageUrl";
import { useI18n } from "./I18nProvider";
import { useHeaderStore } from "@/lib/headerStore";

const fallbackHeroImage = "/blog-single/hero.png";
const fallbackCardImage = "/blogs/blog-featured-default.png";
const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: smoothEase },
  },
};

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

function splitParagraphs(text: string): string[] {
  return text
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function formatDate(value: string, locale: string, fallback: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function BlogSinglePageContent({
  blog,
  relatedBlogs = [],
}: {
  blog: BlogItem;
  relatedBlogs?: BlogItem[];
}) {
  const shouldReduceMotion = useReducedMotion();
  const { locale, t, href } = useI18n();
  const setPageEntity = useHeaderStore((state) => state.setPageEntity);

  useEffect(() => {
    setPageEntity(blog.id, "blogs");
    return () => setPageEntity(null, null);
  }, [blog.id, setPageEntity]);

  const heroImage = resolveApiImageUrl(blog.featuredImageUrl) || fallbackHeroImage;
  const sections = [...(blog.blogSections ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
  const introParagraphs = splitParagraphs(blog.content || blog.summary || t("blogs.noContent"));

  const initial = shouldReduceMotion ? undefined : "hidden";
  const animate = shouldReduceMotion ? undefined : "visible";

  return (
    <main className="min-h-screen bg-[#F3F0E9] font-[var(--font-poppins)] text-[#183c2f]">
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-20 pt-5 sm:px-6 sm:pb-28 sm:pt-8 lg:px-8 xl:px-10">
        {/* Back Link & Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={href("/blogs")}
            className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#142d38] transition hover:text-[#2C798B]"
          >
            <ArrowLeft className="size-4" />
            <span>{t("common.allBlogs") || "All Articles"}</span>
          </Link>

          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 flex-wrap items-center gap-2 text-[13px] font-medium text-[#718288]"
          >
            <Link href={href("/")} className="transition hover:text-[#142d38]">
              {t("common.home") || "Home"}
            </Link>
            <span>/</span>
            <Link href={href("/blogs")} className="transition hover:text-[#142d38]">
              {t("common.blogs") || "Blogs"}
            </Link>
            <span>/</span>
            <span className="max-w-[220px] truncate text-[#142d38] sm:max-w-[360px]">{blog.title}</span>
          </nav>
        </div>

        {/* Primary White Card Container */}
        <article className="overflow-hidden rounded-[24px] border border-black/5 bg-[#FFFFFF] p-6 shadow-sm sm:rounded-[32px] sm:p-10 lg:p-14">
          {/* Header & Title */}
          <motion.header
            variants={shouldReduceMotion ? undefined : container}
            initial={initial}
            animate={animate}
            className="mx-auto max-w-[960px]"
          >
            <motion.h1
              variants={fadeUp}
              className="text-[28px] font-extrabold leading-[1.2] tracking-tight text-[#142d38] sm:text-[38px] lg:text-[46px]"
            >
              {blog.title}
            </motion.h1>

            {/* Editorial Lead Summary */}
            {blog.summary && (
              <motion.p
                variants={fadeUp}
                className="mt-4 border-l-4 border-[#2C798B] pl-4 text-[16px] font-medium leading-relaxed text-[#4b5b63] sm:text-[18px] lg:text-[20px]"
              >
                {blog.summary}
              </motion.p>
            )}

            {/* Metadata Bar */}
            <motion.div
              variants={fadeUp}
              className="mt-6 flex items-center border-y border-[#f0f0f0] py-3 text-[13.5px] text-[#718288]"
            >
              <div className="inline-flex items-center gap-2">
                <Calendar className="size-4 text-[#2C798B]" />
                <span>{formatDate(blog.createdAtUtc, locale, t("common.recently") || "Recently")}</span>
              </div>
            </motion.div>

            {/* Hero Photograph with full object-cover and crisp frame */}
            <motion.div
              variants={fadeUp}
              className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-[20px] border border-black/5 bg-[#e6edea] shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:rounded-[26px]"
            >
              <Image
                src={heroImage}
                alt={blog.title}
                fill
                priority
                sizes="(min-width: 1200px) 1100px, 100vw"
                className="object-cover object-center"
              />
            </motion.div>
          </motion.header>

          {/* 2-Column Editorial Layout (Main Reading Column + Sticky Quick Navigation) */}
          <div className="mx-auto mt-10 grid max-w-[1140px] grid-cols-1 gap-12 lg:grid-cols-[1fr_300px] xl:gap-16">
            {/* Left: Article Reading Body */}
            <div className="min-w-0 max-w-[760px]">
              {/* Introduction Paragraphs */}
              <div className="space-y-5 text-[16px] leading-[1.8] text-[#33464f] sm:text-[17.5px] sm:leading-[1.85]">
                {introParagraphs.map((paragraph, index) => (
                  <p key={`intro-${index}`}>{paragraph}</p>
                ))}
              </div>

              {/* Sections (clean, natural, without numbering) */}
              {sections.length > 0 && (
                <div className="mt-12 space-y-12 sm:mt-16 sm:space-y-16">
                  {sections.map((section) => {
                    const paragraphs = splitParagraphs(section.content);
                    const sectionImage = resolveApiImageUrl(section.imageUrl);

                    return (
                      <section
                        key={section.id}
                        id={`section-${section.id}`}
                        className="scroll-mt-28 border-t border-[#f0f0f0] pt-10 first:border-0 first:pt-0"
                      >
                        <h2 className="text-[22px] font-bold leading-snug text-[#142d38] sm:text-[28px] lg:text-[30px]">
                          {section.title}
                        </h2>

                        {/* Section image with full-bleed object-cover */}
                        {sectionImage && (
                          <div className="relative my-6 aspect-[16/9] w-full overflow-hidden rounded-[18px] border border-black/5 bg-[#e6edea] shadow-xs sm:rounded-[22px]">
                            <Image
                              src={sectionImage}
                              alt={section.title}
                              fill
                              sizes="(min-width: 1024px) 760px, 100vw"
                              className="object-cover object-center"
                            />
                          </div>
                        )}

                        {/* Section paragraphs */}
                        <div className="mt-5 space-y-4 text-[16px] leading-[1.8] text-[#33464f] sm:text-[17px] sm:leading-[1.85]">
                          {paragraphs.map((p, idx) => (
                            <p key={`${section.id}-${idx}`}>{p}</p>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Sticky Sidebar for Quick Jump & Sea Key Property booking CTA */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-6">
                {/* Table of Contents (if sections exist) */}
                {sections.length > 0 && (
                  <div className="rounded-[20px] border border-black/5 bg-[#F9F7F3] p-5 shadow-xs">
                    <p className="text-[12px] font-bold uppercase tracking-wider text-[#2C798B]">
                      In this article
                    </p>
                    <nav className="mt-3.5 space-y-2.5">
                      {sections.map((sec) => (
                        <a
                          key={sec.id}
                          href={`#section-${sec.id}`}
                          className="block text-[13.5px] font-medium leading-snug text-[#4d5e66] transition hover:translate-x-1 hover:text-[#142d38]"
                        >
                          {sec.title}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Sea Key Property Booking CTA Banner */}
                <div className="overflow-hidden rounded-[20px] border border-[#2C798B]/20 bg-[#183640] p-6 text-white shadow-sm">
                  <p className="text-[11.5px] font-semibold uppercase tracking-wider text-[#79cbd8]">
                    Sea Key Property
                  </p>
                  <h3 className="mt-2 text-[19px] font-bold leading-snug text-white">
                    Planning Your Trip to Hurghada?
                  </h3>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-white/80">
                    Discover handpicked luxury beachfront villas and modern holiday apartments.
                  </p>
                  <div className="mt-5 flex flex-col gap-2.5">
                    <Link
                      href={href("/rent")}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-[#2C798B] px-5 text-[13px] font-semibold text-white transition hover:bg-[#23606e]"
                    >
                      Browse Vacation Rentals
                    </Link>
                    <Link
                      href={href("/buy")}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-white/20 px-5 text-[13px] font-medium text-white transition hover:bg-white/10"
                    >
                      Properties For Sale
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </article>

        {/* Related Articles Section at the Bottom */}
        {relatedBlogs.length > 0 && (
          <section className="mt-16 sm:mt-20">
            <div className="mb-8 flex flex-col gap-1.5">
              <p className="text-[12.5px] font-bold uppercase tracking-wider text-[#2C798B]">
                {t("common.blogs") || "More to Explore"}
              </p>
              <h2 className="text-[26px] font-bold leading-tight text-[#142d38] sm:text-[32px]">
                Related Articles
              </h2>
            </div>

            {/* Same box cards matching the main blogs page */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedBlogs.map((relatedBlog) => (
                <RelatedBoxCard key={relatedBlog.id} blog={relatedBlog} locale={locale} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function RelatedBoxCard({ blog, locale }: { blog: BlogItem; locale: string }) {
  const { href, t } = useI18n();
  const imageSrc = resolveApiImageUrl(blog.featuredImageUrl) || fallbackCardImage;
  const excerpt = blog.summary || blog.content?.replace(/<[^>]+>/g, "").slice(0, 110) || "";
  const blogUrl = href(`/blogs/${getBlogSlug(blog)}`);

  return (
    <article className="group flex flex-col overflow-hidden rounded-[24px] border border-black/5 bg-[#FFFFFF] shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.09)]">
      {/* Top Image */}
      <Link href={blogUrl} className="relative aspect-[16/10] w-full overflow-hidden bg-[#e6edea]">
        <Image
          src={imageSrc}
          alt={blog.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-center transition duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <Link href={blogUrl} className="hover:underline">
            <h3 className="line-clamp-2 text-[17px] font-bold leading-snug text-[#142d38] sm:text-[19px]">
              {blog.title}
            </h3>
          </Link>
          {excerpt && (
            <p className="mt-2.5 line-clamp-2 text-[13.5px] leading-relaxed text-[#718288]">
              {excerpt}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#f0f0f0] pt-4">
          <div className="flex items-center gap-1.5 text-[12px] text-[#718288]">
            <Calendar className="size-3.5 text-[#2C798B]" />
            <span>{formatDate(blog.createdAtUtc, locale, t("common.recently") || "Recently")}</span>
          </div>
          <Link
            href={blogUrl}
            className="rounded-full border border-[#8a9a94] px-4 py-1.5 text-[12px] font-medium text-[#142d38] transition hover:border-[#142d38] hover:bg-[#142d38] hover:text-white"
          >
            read article
          </Link>
        </div>
      </div>
    </article>
  );
}
