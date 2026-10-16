"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBlogs } from "@/lib/hooks/useBlog";
import type { BlogItem } from "@/lib/types/blog";
import { resolveApiImageUrl } from "@/lib/utils/imageUrl";
import { getBlogSlug } from "@/lib/utils/blogSlug";
import { useI18n } from "@/components/I18nProvider";

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function BlogInsightsSection() {
  const { t, locale, href } = useI18n();
  const { data, isLoading, isError } = useBlogs({
    IsPublished: true,
    PageNumber: 1,
    PageSize: 3,
    SortBy: "displayOrder",
    IsDescending: false,
  });

  const blogs = data?.items ?? [];

  return (
    <section className="bg-white px-5 py-14 font-[var(--font-poppins)] sm:px-8 sm:py-18 lg:px-14 lg:py-20">
      <div className="mx-auto max-w-[1320px]">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className="h-[2.5px] w-8 sm:w-12 rounded-full bg-[#2C798B]" />
            <h2 className="text-[22px] font-bold tracking-tight text-[#2C798B] sm:text-[28px] lg:text-[34px]">
              From Property to Lifestyle
            </h2>
            <span className="h-[2.5px] w-8 sm:w-12 rounded-full bg-[#2C798B]" />
          </div>
          <p className="mt-2 text-[14px] sm:text-[15px] font-medium text-[#2C798B]">
            Stay updated on the latest real-estate trends.
          </p>
        </motion.div>

        {/* Articles Content from API */}
        <div className="mt-10 sm:mt-12">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[380px] animate-pulse rounded-2xl border border-[#e2e8e6] bg-[#f8faf9]"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-[#e2e8e6] bg-[#fafbfb] py-12 text-center text-[14px] text-[#718288]">
              {t("blogs.unableHome") || "Unable to load articles at this time."}
            </div>
          ) : blogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d8e0dd] bg-[#fafbfb] py-14 text-center text-[15px] text-[#718288]">
              <p className="font-semibold text-[#183640]">No articles published yet</p>
              <p className="mt-1 text-[13px] text-[#86979d]">Check back soon for new articles and market trends.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <ArticleCard key={blog.id} blog={blog} locale={locale} />
              ))}
            </div>
          )}
        </div>

        {/* View more button */}
        {blogs.length > 0 && (
          <div className="mt-10 flex justify-center sm:mt-12">
            <Link
              href={href("/blogs")}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#183640]/40 bg-white px-8 text-[14px] font-medium text-[#183640] transition hover:bg-[#183640] hover:text-white"
            >
              {t("common.viewMore") || "View more"}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function ArticleCard({ blog, locale }: { blog: BlogItem; locale: string }) {
  const { href } = useI18n();
  const imageSrc = resolveApiImageUrl(blog.featuredImageUrl) || "/homepage/blogs/articles.png";
  const excerpt = blog.summary || blog.content || "";
  const blogUrl = href(`/blogs/${getBlogSlug(blog)}`);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#e2e8e6] bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      {/* Article Image */}
      <Link href={blogUrl} className="relative aspect-[16/10] w-full overflow-hidden bg-[#eef3f1]">
        <Image
          src={imageSrc}
          alt={blog.title}
          fill
          sizes="(min-width: 1280px) 31vw, (min-width: 768px) 45vw, 100vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Article Body */}
      <div className="flex flex-1 flex-col p-5">
        <Link href={blogUrl} className="hover:underline">
          <h3 className="line-clamp-1 text-[16px] sm:text-[17px] font-bold text-[#183640]">
            {blog.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-[13px] sm:text-[13.5px] leading-relaxed text-[#718288]">
          {excerpt}
        </p>

        {/* Footer row: Date + Read article */}
        <div className="mt-auto pt-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12.5px] sm:text-[13px] font-medium text-[#183640]">
            <svg
              className="size-4 shrink-0 text-[#183640]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(blog.createdAtUtc, locale)}</span>
          </div>

          <Link
            href={blogUrl}
            className="inline-flex items-center justify-center rounded-full border border-[#183640]/30 px-3.5 py-1 text-[12px] font-medium text-[#183640] transition hover:border-[#183640] hover:bg-[#183640] hover:text-white"
          >
            read article
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
