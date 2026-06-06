import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowRight,
  Building2,
  Calendar,
  FileText,
  Search,
  Sparkles,
  Stethoscope,
  User,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import type { Route } from "./+types/search";
import { search } from "~/services/search.service";
import type { SearchResultItem } from "~/types/search";

const PAGE_SIZE = 10;

export function meta({ location }: Route.MetaArgs) {
  const params = new URLSearchParams(location.search);
  const q = params.get("q") ?? "";
  return [
    { title: q ? `Kết quả tìm kiếm: "${q}" | Hospital TTG` : "Tìm kiếm | Hospital TTG" },
    { name: "description", content: `Kết quả tìm kiếm cho "${q}"` },
  ];
}

type Tab = "all" | "doctor" | "article" | "department";

const TAB_LABELS: Record<Tab, string> = {
  all: "Tất cả",
  doctor: "Bác sĩ",
  article: "Tin tức",
  department: "Khoa",
};

const TAB_ICONS: Record<Tab, React.ComponentType<{ className?: string }>> = {
  all: Sparkles,
  doctor: Stethoscope,
  article: FileText,
  department: Building2,
};

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  doctor: User,
  article: FileText,
  department: Building2,
};

const TYPE_LABEL: Record<string, string> = {
  doctor: "Bác sĩ",
  article: "Tin tức",
  department: "Khoa",
};

function ResultCard({ item }: { item: SearchResultItem }) {
  const Icon = TYPE_ICON[item.type] ?? FileText;
  const typeLabel = TYPE_LABEL[item.type] ?? "Kết quả";

  return (
    <Link
      to={item.url}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-green-300 hover:shadow-xl"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100">
          <Icon className="h-3.5 w-3.5" />
          {typeLabel}
        </div>

        {item.publishedAt && (
          <div className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(item.publishedAt).toLocaleDateString("vi-VN")}
          </div>
        )}
      </div>

      <div className="flex flex-1 gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-sm">
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-lg font-bold text-slate-900 transition group-hover:text-green-700">
            {item.title}
          </h3>

          {item.subtitle ? (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{item.subtitle}</p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-400">Nhấn để xem thêm thông tin chi tiết.</p>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-green-700">Xem chi tiết</span>
            <ArrowRight className="h-4 w-4 text-green-600 transition group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {item.thumbnail && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          <img src={item.thumbnail} alt={item.title} className="h-40 w-full object-cover" />
        </div>
      )}
    </Link>
  );
}

function SummaryCard({ label, value, active = false }: { label: string; value: number; active?: boolean }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 shadow-sm transition ${
        active
          ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-2 text-2xl font-bold ${active ? "text-green-700" : "text-slate-900"}`}>{value}</div>
    </div>
  );
}

interface SearchMetadata {
  page: number;
  pageSize: number;
  totalDoctors: number;
  totalArticles: number;
  totalDepartments: number;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const currentPage = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const [input, setInput] = useState(query);
  const [tab, setTab] = useState<Tab>("all");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchMeta, setSearchMeta] = useState<SearchMetadata>({
    page: 1,
    pageSize: 10,
    totalDoctors: 0,
    totalArticles: 0,
    totalDepartments: 0,
  });

  useEffect(() => {
    setInput(query);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    search(query, currentPage, PAGE_SIZE)
      .then((res) => {
        const all = [...res.doctors, ...res.articles, ...res.departments];
        setResults(all);
        setSearchMeta({
          page: res.page,
          pageSize: res.pageSize,
          totalDoctors: res.totalDoctors,
          totalArticles: res.totalArticles,
          totalDepartments: res.totalDepartments,
        });
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query, currentPage]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextQuery = input.trim();
    if (!nextQuery) return;
    setSearchParams({ q: nextQuery, page: "1" });
  }

  const counts: Record<Tab, number> = useMemo(
    () => ({
      all: searchMeta.totalDoctors + searchMeta.totalArticles + searchMeta.totalDepartments,
      doctor: searchMeta.totalDoctors,
      article: searchMeta.totalArticles,
      department: searchMeta.totalDepartments,
    }),
    [searchMeta],
  );

  const filtered = useMemo(
    () => results.filter((r) => tab === "all" || r.type === tab),
    [results, tab],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(
      Math.max(
        tab === "all"
          ? counts.all
          : tab === "doctor"
            ? counts.doctor
            : tab === "article"
              ? counts.article
              : counts.department,
        0,
      ) / PAGE_SIZE,
    ),
  );

  function updatePage(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("q", query);
    params.set("page", String(nextPage));
    setSearchParams(params);
  }

  function renderPageNumbers() {
    const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    return Array.from(pages)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-green-600">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_28%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-green-50 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Tra cứu nhanh thông tin trên Hospital TTG
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Tìm kiếm bác sĩ, tin tức và chuyên khoa dễ dàng hơn
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-green-50/90 sm:text-base">
              Nhập từ khóa để xem kết quả rõ ràng, trực quan và dễ lọc hơn theo từng nhóm nội dung.
            </p>

            <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-3xl">
              <div className="flex flex-col gap-3 rounded-3xl border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ví dụ: tim mạch, bác sĩ demo, nội soi..."
                    className="h-14 w-full rounded-2xl border border-white/20 bg-white px-12 pr-4 text-base text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-green-300"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-white px-6 text-sm font-semibold text-green-700 transition hover:bg-green-50 cursor-pointer sm:px-7"
                >
                  Tìm kiếm ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-52 animate-pulse rounded-3xl border border-slate-200 bg-white" />
              ))}
            </div>
          </div>
        ) : searched && query ? (
          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="text-sm font-medium text-green-700">Kết quả tìm kiếm</div>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                    Từ khóa: <span className="text-green-700">“{query}”</span>
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Tìm thấy <span className="font-semibold text-slate-900">{counts.all}</span> kết quả phù hợp.
                    Hiện đang hiển thị tối đa <span className="font-semibold text-slate-900">{searchMeta.pageSize}</span> kết quả mỗi nhóm ở trang <span className="font-semibold text-slate-900">{searchMeta.page}</span>.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
                  <SummaryCard label="Tất cả" value={counts.all} active={tab === "all"} />
                  <SummaryCard label="Bác sĩ" value={counts.doctor} active={tab === "doctor"} />
                  <SummaryCard label="Tin tức" value={counts.article} active={tab === "article"} />
                  <SummaryCard label="Khoa" value={counts.department} active={tab === "department"} />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap gap-3">
                {(Object.keys(TAB_LABELS) as Tab[]).map((t) => {
                  const Icon = TAB_ICONS[t];
                  const active = tab === t;

                  return (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition cursor-pointer ${
                        active
                          ? "border-green-600 bg-green-600 text-white shadow-md"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{TAB_LABELS[t]}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/15" : "bg-white text-slate-500"}`}>
                        {counts[t]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Search className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">Không có kết quả trong nhóm này</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  Hãy thử chọn nhóm khác hoặc thay đổi từ khóa để tìm được nội dung phù hợp hơn.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {filtered.map((item) => (
                    <ResultCard key={`${item.type}-${item.id}`} item={item} />
                  ))}
                </div>

                {counts.all > PAGE_SIZE && (
                  <div className="rounded-3xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-600">
                        Trang <span className="font-semibold text-slate-900">{currentPage}</span> / <span className="font-semibold text-slate-900">{totalPages}</span>
                      </p>

                      <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href={currentPage > 1 ? `?q=${encodeURIComponent(query)}&page=${currentPage - 1}` : "#"}
                              text="Trang trước"
                              className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                              onClick={(e) => {
                                if (currentPage <= 1) {
                                  e.preventDefault();
                                  return;
                                }
                                e.preventDefault();
                                updatePage(currentPage - 1);
                              }}
                            />
                          </PaginationItem>

                          {renderPageNumbers().map((page, index, arr) => (
                            <Fragment key={page}>
                              {index > 0 && arr[index - 1] !== page - 1 ? (
                                <PaginationItem>
                                  <span className="flex h-9 items-center px-2 text-slate-400">...</span>
                                </PaginationItem>
                              ) : null}
                              <PaginationItem>
                                <PaginationLink
                                  href={`?q=${encodeURIComponent(query)}&page=${page}`}
                                  isActive={page === currentPage}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    updatePage(page);
                                  }}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            </Fragment>
                          ))}

                          <PaginationItem>
                            <PaginationNext
                              href={currentPage < totalPages ? `?q=${encodeURIComponent(query)}&page=${currentPage + 1}` : "#"}
                              text="Trang sau"
                              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                              onClick={(e) => {
                                if (currentPage >= totalPages) {
                                  e.preventDefault();
                                  return;
                                }
                                e.preventDefault();
                                updatePage(currentPage + 1);
                              }}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
              <Search className="h-9 w-9" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-slate-900">Bắt đầu tìm kiếm thông tin</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Nhập tên bác sĩ, chuyên khoa hoặc bài viết bạn quan tâm để tra cứu nhanh và chính xác hơn.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
