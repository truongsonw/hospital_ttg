import * as React from "react";
import { Link } from "react-router";
import { Flame, Eye, Calendar, ChevronRight } from "lucide-react";
import type { ContentDto } from "~/types/article";

interface ArticleGridProps {
  data: { data: ContentDto[]; pageNumber: number; totalPages: number; totalRecords: number } | null;
  loading: boolean;
  categoryMap: Record<string, string>;
  onPageChange: (page: number) => void;
}

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function ArticleCard({ item, categoryName }: { item: ContentDto; categoryName: string }) {
  return (
    <Link
      to={`/${item.slug}.html`}
      className="group flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
            <span className="text-4xl">📰</span>
          </div>
        )}
        {item.isHot && (
          <span className="absolute top-2 left-2 flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            <Flame className="size-3" /> Nổi bật
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        {categoryName && (
          <span className="text-xs font-semibold text-[#008046] uppercase tracking-wide mb-2">
            {categoryName}
          </span>
        )}
        <h3 className="text-gray-900 font-semibold text-base leading-snug line-clamp-2 group-hover:text-[#008046] transition-colors mb-2">
          {item.title}
        </h3>
        {item.intro && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-3 flex-1">{item.intro}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {formatDate(item.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="size-3" />
            {item.viewCount.toLocaleString("vi-VN")}
          </span>
        </div>
      </div>
    </Link>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition"
      >
        ‹
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg border text-sm font-medium transition ${
            p === currentPage
              ? "bg-[#008046] text-white border-[#008046]"
              : "hover:bg-gray-50"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition"
      >
        ›
      </button>
    </div>
  );
}

export default function ArticleGrid({ data, loading, categoryMap, onPageChange }: ArticleGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <span className="text-5xl mb-4">📭</span>
        <p className="text-base font-medium">Không có bài viết nào</p>
        <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc quay lại sau</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          Tìm thấy <span className="font-semibold text-gray-800">{data.totalRecords}</span> bài viết
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.data.map((item) => (
          <ArticleCard key={item.id} item={item} categoryName={categoryMap[item.categoryId] ?? ""} />
        ))}
      </div>
      <Pagination
        currentPage={data.pageNumber}
        totalPages={data.totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
}
