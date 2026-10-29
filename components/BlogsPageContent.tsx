"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useBlogs } from "@/lib/hooks/useBlog";
import type { BlogItem } from "@/lib/types/blog";
import { resolveApiImageUrl } from "@/lib/utils/imageUrl";
import { getBlogSlug } from "@/lib/utils/blogSlug";
import { useI18n } from "./I18nProvider";
import PageHero from "@/components/PageHero";

const fallbackImage = "/blogs/blog-featured-default.png";

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: smoothEase,
    },
  },
};

const breadcrumbVariants: Variants = {
  hidden: { opacity: 0, y: -6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: smoothEase,
    },
  },
};

function formatDate(value: string, locale: string, fallback: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function BlogsPageContent() {
  const { locale, href, t } = useI18n();
  const shouldReduceMotion = useReducedMotion();
  const [page] = useState(1);
  const pageSize = 12;

  const initial = shouldReduceMotion ? undefined : "hidden";
  const animate = shouldReduceMotion ? undefined : "visible";

  const { data, isLoading, isError } = useBlogs(
    {
      IsPublished: true,
      PageNumber: page,
      PageSize: pageSize,
      SortBy: "displayOrder",
      IsDescending: false,
    },
    locale
  );

  const blogs = data?.items ?? [];

  return (
    <main className="min-h-screen bg-[#F3F0E9] font-[var(--font-poppins)] text-[#183c2f]">
      {/* 1. Hero Section: Unified PageHero with identical spacing and height */}
      <PageHero
        imageSrc="/blogs/blog-hero-bg.png"
        imageAlt={t("common.blogs") || "Blogs"}
        title={
          locale === "en" ? (
            <>
              A Better Way To<br />
              Feel At Home
            </>
          ) : (
            t("about.heroTitle") || "A Better Way To Feel At Home"
          )
        }
        subtitle={
          t("about.heroSubtitle") ||
          "We Connect you with handpicked homes and seamless rental experience, whatever you want to be."
        }
        maxTitleWidth="max-w-[560px]"
        maxSubtitleWidth="max-w-[620px]"
        priority
      />

      {/* Main Content Layout aligned with max-w-[1536px] matching About and Contact */}
      <div className="mx-auto w-full max-w-[1536px] px-4 pb-24 sm:px-6 sm:pb-28 lg:px-10">
        {/* Breadcrumb Navigation with subtle fade/slide in */}
        <motion.nav
          variants={breadcrumbVariants}
          initial={initial}
          animate={animate}
          aria-label="Breadcrumb"
          className="mt-8 mb-6 flex items-center gap-1.5 text-[14px] font-semibold text-[#142d38]"
        >
          <Link href={href("/")} className="hover:underline">
            {t("common.home") || "Home"}
          </Link>
          <span className="text-[#8a9a94]">/</span>
          <span className="text-[#718288]">{t("common.blogs") || "Blogs"}</span>
        </motion.nav>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2C798B] border-t-transparent" />
            <p className="text-[14px] text-[#656566]">{t("buy.loading") || "Loading..."}</p>
          </div>
        ) : isError ? (
          <motion.div
            variants={cardVariants}
            initial={initial}
            animate={animate}
            className="py-20 text-center"
          >
            <h2 className="text-[20px] font-semibold text-[#183c2f]">{t("blogs.unableTitle") || "Unable to load blogs"}</h2>
            <p className="mt-2 text-[14px] text-[#656566]">{t("blogs.unableBody") || "Please check your connection and try again."}</p>
          </motion.div>
        ) : blogs.length === 0 ? (
          <motion.div
            variants={cardVariants}
            initial={initial}
            animate={animate}
            className="rounded-2xl border border-dashed border-[#d8e0dd] bg-white py-24 text-center"
          >
            <p className="text-[18px] font-semibold text-[#183c2f]">{t("blogs.emptyTitle") || "No articles found"}</p>
            <p className="mt-2 text-[14px] text-[#656566]">{t("blogs.emptyBody") || "Check back soon for new articles and lifestyle stories."}</p>
          </motion.div>
        ) : (
          /* Staggered entrance animation for all blog cards */
          <motion.div
            variants={containerVariants}
            initial={initial}
            animate={animate}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {blogs.map((blog) => (
              <StandardBlogCard key={blog.id} blog={blog} locale={locale} />
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}

function StandardBlogCard({ blog, locale }: { blog: BlogItem; locale: string }) {
  const { href, t } = useI18n();
  const imageSrc = resolveApiImageUrl(blog.featuredImageUrl) || fallbackImage;
  const excerpt = blog.summary || blog.content?.replace(/<[^>]+>/g, "").slice(0, 110) || "";
  const blogUrl = href(`/blogs/${getBlogSlug(blog)}`);

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -5, transition: { duration: 0.22, ease: "easeOut" } }}
      className="group flex flex-col overflow-hidden rounded-[24px] border border-black/5 bg-[#FFFFFF] shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-shadow duration-300 hover:shadow-[0_14px_32px_rgba(0,0,0,0.1)]"
    >
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
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(blog.createdAtUtc, locale, t("common.recently") || "Recently")}</span>
          </div>
          <Link
            href={blogUrl}
            className="rounded-full border border-[#8a9a94] px-4 py-1.5 text-[12px] font-medium text-[#142d38] transition hover:border-[#142d38] hover:bg-[#142d38] hover:text-white"
          >
            {t("common.readArticle") || "read article"}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
