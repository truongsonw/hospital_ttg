import * as React from "react";
import { Link, useSearchParams } from "react-router";
import { IconFlame, IconEye, IconCalendar, IconChevronRight } from "@tabler/icons-react";
import { getAllCategoriesList } from "~/services/category.service";
import { getPagedContents } from "~/services/content.service";
import type { CategoryDto, ContentDto, PagedApiResponse } from "~/types/article";

export function meta() {
  return [
    { title: "Tin tức & Bài viết | Hospital TTG" },
    { name: "description", content: "Cập nhật tin tức y tế và hoạt động mới nhất của Bệnh viện Đa khoa Thạch Thất" },
  ];
}

const TYPE_TABS = [
  { value: "", label: "Tất cả" },
  { value: "article", label: "Bài viết" },
  { value: "album", label: "Album ảnh" },
  { value: "video", label: "Video" },
];

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function ArticleCard({ item, categoryName }: { item: ContentDto; categoryName: string }) {
  return (
    <Link
      to={`/tin-tuc/${item.slug}`}
      className="group flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Thumbnail */}
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
            <IconFlame className="size-3" /> Nổi bật
          </span>
        )}
      </div>

      {/* Content */}
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
            <IconCalendar className="size-3" />
            {formatDate(item.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <IconEye className="size-3" />
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

export default function TinTucPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = React.useState<PagedApiResponse<ContentDto[]> | null>(null);
  const [categories, setCategories] = React.useState<CategoryDto[]>([]);
  const [loading, setLoading] = React.useState(true);

  const type = searchParams.get("type") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const categoryMap = React.useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  function setParam(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
      return next;
    });
  }

  function setPage(p: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(p));
      return next;
    });
  }

  React.useEffect(() => {
    getAllCategoriesList().then(setCategories).catch(() => {});
  }, []);

  React.useEffect(() => {
    setLoading(true);
    getPagedContents({ type, categoryId, status: "1", page, pageSize: 9 })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [type, categoryId, page]);

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-[#008046] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-green-200 text-sm mb-3">
            <Link to="/" className="hover:text-white transition">Trang chủ</Link>
            <IconChevronRight className="size-3.5" />
            <span className="text-white">Tin tức</span>
          </nav>
          <h1 className="text-3xl font-bold text-white">Tin tức &amp; Bài viết</h1>
          <p className="text-green-100 mt-1 text-sm">Cập nhật thông tin y tế và hoạt động mới nhất</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0 space-y-6">
            {/* Type filter */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-[#008046] text-white font-semibold text-sm">Loại nội dung</div>
              <ul>
                {TYPE_TABS.map((tab) => (
                  <li key={tab.value}>
                    <button
                      onClick={() => setParam("type", tab.value)}
                      className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100 last:border-0 flex items-center justify-between transition ${
                        type === tab.value
                          ? "text-[#008046] font-semibold bg-green-50"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {tab.label}
                      {type === tab.value && <IconChevronRight className="size-3.5 text-[#008046]" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Category filter */}
            {categories.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-[#008046] text-white font-semibold text-sm">Danh mục</div>
                <ul>
                  <li>
                    <button
                      onClick={() => setParam("categoryId", "")}
                      className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100 flex items-center justify-between transition ${
                        !categoryId ? "text-[#008046] font-semibold bg-green-50" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Tất cả danh mục
                      {!categoryId && <IconChevronRight className="size-3.5 text-[#008046]" />}
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setParam("categoryId", cat.id)}
                        className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100 last:border-0 flex items-center justify-between transition ${
                          categoryId === cat.id
                            ? "text-[#008046] font-semibold bg-green-50"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {cat.name}
                        {categoryId === cat.id && <IconChevronRight className="size-3.5 text-[#008046]" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {loading ? (
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
            ) : !data?.data?.length ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <span className="text-5xl mb-4">📭</span>
                <p className="text-base font-medium">Không có bài viết nào</p>
                <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc quay lại sau</p>
              </div>
            ) : (
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
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
