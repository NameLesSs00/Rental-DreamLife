"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useBlogs } from "@/lib/hooks/useBlog";
import type { BlogItem } from "@/lib/types/blog";
import { resolveApiImageUrl } from "@/lib/utils/imageUrl";
import { getBlogSlug } from "@/lib/utils/blogSlug";
import { useI18n } from "./I18nProvider";

const fallbackImage = "/blogs/blog-featured-default.png";

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
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { data, isLoading, isError } = useBlogs({
    IsPublished: true,
    PageNumber: page,
    PageSize: pageSize,
    SortBy: "displayOrder",
    IsDescending: false,
  });

  const blogs = data?.items ?? [];
  const featuredBlog = blogs[0];
  const gridBlogs = blogs.length > 1 ? blogs.slice(1) : [];

  return (
    <main className="bg-[#fbfbf9] font-[var(--font-poppins)] text-[#183c2f]">
      {/* Hero Section */}
      <BlogsHero />

      {/* Main Content Layout */}
      <div className="mx-auto max-w-[1536px] px-4 pb-24 pt-6 sm:px-6 lg:px-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-[14px] font-semibold text-[#142d38]">
          <Link href={href("/")} className="hover:underline">
            {t("common.home") || "Home"}
          </Link>
          <span className="text-[#8a9a94]">/</span>
          <span className="text-[#718288]">{t("common.blogs") || "Blogs"}</span>
        </nav>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2C798B] border-t-transparent" />
            <p className="text-[14px] text-[#656566]">{t("buy.loading") || "Loading..."}</p>
          </div>
        ) : isError ? (
          <div className="py-20 text-center">
            <h2 className="text-[20px] font-semibold text-[#183c2f]">Unable to load blogs</h2>
            <p className="mt-2 text-[14px] text-[#656566]">Please check your connection and try again.</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d8e0dd] bg-white py-24 text-center">
            <p className="text-[18px] font-semibold text-[#183c2f]">No articles found</p>
            <p className="mt-2 text-[14px] text-[#656566]">Check back soon for new articles and lifestyle stories.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Featured Horizontal Card */}
            {featuredBlog && (
              <FeaturedBlogCard blog={featuredBlog} locale={locale} />
            )}

            {/* 3-Column Blog Cards Grid */}
            {gridBlogs.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gridBlogs.map((blog) => (
                  <StandardBlogCard key={blog.id} blog={blog} locale={locale} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function BlogsHero() {
  return (
    <section className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6">
      <div className="relative h-[280px] sm:h-[360px] md:h-[420px] lg:h-[480px] w-full overflow-hidden rounded-[20px] sm:rounded-[28px] shadow-sm">
        <Image
          src="/blogs/blog-hero-bg.png"
          alt="A Better Way To Feel At Home"
          fill
          priority
          sizes="(max-width: 1536px) 100vw, 1536px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-transparent flex items-center p-6 sm:p-12 lg:p-16">
          <div className="max-w-2xl">
            <h1 className="text-[28px] sm:text-[42px] lg:text-[52px] font-extrabold leading-[1.12] text-white tracking-tight drop-shadow-xs">
              A Better Way To<br />
              Feel At Home
            </h1>
            <p className="mt-3 sm:mt-4 max-w-[480px] text-[13.5px] sm:text-[15.5px] leading-relaxed text-white/95 font-medium drop-shadow-xs">
              We Connect you with handpicked homes and seamless rental experience, whatever you want to be.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedBlogCard({ blog, locale }: { blog: BlogItem; locale: string }) {
  const { href, t } = useI18n();
  const imageSrc = resolveApiImageUrl(blog.featuredImageUrl) || fallbackImage;
  const excerpt = blog.summary || blog.content?.replace(/<[^>]+>/g, "").slice(0, 160) || "";
  const blogUrl = href(`/blogs/${getBlogSlug(blog)}`);

  return (
    <article className="overflow-hidden rounded-[24px] border border-[#e2e8e6] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left Image */}
        <Link href={blogUrl} className="relative min-h-[260px] sm:min-h-[340px] w-full overflow-hidden bg-[#e6edea]">
          <Image
            src={imageSrc}
            alt={blog.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-center transition duration-500 hover:scale-105"
          />
        </Link>

        {/* Right Content */}
        <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div>
            <span className="inline-flex items-center rounded-full bg-[#79cbd8] px-3.5 py-1 text-[12px] font-semibold text-white">
              Rental Tips
            </span>
            <Link href={blogUrl} className="mt-4 block hover:underline">
              <h2 className="text-[22px] sm:text-[26px] lg:text-[30px] font-bold leading-snug text-[#142d38]">
                {blog.title}
              </h2>
            </Link>
            {excerpt && (
              <p className="mt-3 text-[14px] sm:text-[15px] leading-relaxed text-[#656566] line-clamp-3">
                {excerpt}
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[#f0f0f0] pt-4">
            <div className="flex items-center gap-2 text-[12.5px] text-[#718288]">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{formatDate(blog.createdAtUtc, locale, t("common.recently") || "Recently")}</span>
            </div>
            <Link
              href={blogUrl}
              className="rounded-full border border-[#8a9a94] px-4 py-1.5 text-[12.5px] font-medium text-[#142d38] transition hover:border-[#142d38] hover:bg-[#142d38] hover:text-white"
            >
              read article
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function StandardBlogCard({ blog, locale }: { blog: BlogItem; locale: string }) {
  const { href, t } = useI18n();
  const imageSrc = resolveApiImageUrl(blog.featuredImageUrl) || fallbackImage;
  const excerpt = blog.summary || blog.content?.replace(/<[^>]+>/g, "").slice(0, 100) || "";
  const blogUrl = href(`/blogs/${getBlogSlug(blog)}`);

  return (
    <article className="group flex flex-col overflow-hidden rounded-[20px] border border-[#e2e8e6] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
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
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <Link href={blogUrl} className="hover:underline">
            <h3 className="line-clamp-2 text-[17px] sm:text-[18px] font-bold leading-snug text-[#142d38]">
              {blog.title}
            </h3>
          </Link>
          {excerpt && (
            <p className="mt-2 text-[13px] leading-relaxed text-[#718288] line-clamp-2">
              {excerpt}
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[#f5f5f5] pt-3.5">
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
            className="rounded-full border border-[#8a9a94] px-3.5 py-1 text-[12px] font-medium text-[#142d38] transition hover:border-[#142d38] hover:bg-[#142d38] hover:text-white"
          >
            read article
          </Link>
        </div>
      </div>
    </article>
  );
}
