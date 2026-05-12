import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, User, FileText, Building2, Calendar } from "lucide-react";
import type { Route } from "./+types/search";
import { search } from "~/services/search.service";
import type { SearchResultItem } from "~/types/search";

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

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  doctor: User,
  article: FileText,
  department: Building2,
};

function ResultCard({ item }: { item: SearchResultItem }) {
  const Icon = TYPE_ICON[item.type] ?? FileText;

  return (
    <Link
      to={item.url}
      className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition group"
    >
      <div className="shrink-0 w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition line-clamp-1">
          {item.title}
        </h3>
        {item.subtitle && (
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{item.subtitle}</p>
        )}
        {item.publishedAt && (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            {new Date(item.publishedAt).toLocaleDateString("vi-VN")}
          </div>
        )}
        {item.thumbnail && (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-10 h-10 rounded-lg object-cover mt-2"
          />
        )}
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [input, setInput] = useState(query);
  const [tab, setTab] = useState<Tab>("all");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      setSearched(true);
      search(query)
        .then((res) => {
          const all = [...res.doctors, ...res.articles, ...res.departments];
          setResults(all);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim()) {
      setSearchParams({ q: input.trim() });
    }
  }

  const filtered = results.filter((r) => tab === "all" || r.type === tab);
  const counts: Record<Tab, number> = {
    all: results.length,
    doctor: results.filter((r) => r.type === "doctor").length,
    article: results.filter((r) => r.type === "article").length,
    department: results.filter((r) => r.type === "department").length,
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm uppercase tracking-widest text-green-100 mb-2">Tìm kiếm</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">Kết quả tìm kiếm</h1>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập từ khóa tìm kiếm..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-green-800 text-white rounded-xl font-medium hover:bg-green-900 transition shadow-lg cursor-pointer"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Đang tìm kiếm...</div>
        ) : searched && query ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Tìm thấy <strong className="text-green-600">{results.length}</strong> kết quả cho "
              <strong>{query}</strong>"
            </p>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                    tab === t
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {TAB_LABELS[t]}
                  {counts[t] > 0 && (
                    <span className="ml-1.5 opacity-70">({counts[t]})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium text-gray-500 mb-1">Không tìm thấy kết quả</p>
                <p className="text-sm">Thử tìm kiếm với từ khóa khác</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((item) => (
                  <ResultCard key={`${item.type}-${item.id}`} item={item} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-gray-500 mb-1">Tìm kiếm thông tin</p>
            <p className="text-sm">Nhập từ khóa để tìm bác sĩ, tin tức hoặc khoa phòng</p>
          </div>
        )}
      </div>
    </div>
  );
}
