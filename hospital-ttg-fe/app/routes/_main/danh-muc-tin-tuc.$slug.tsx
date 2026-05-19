import * as React from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { ChevronRight } from "lucide-react";
import ArticleGrid from "~/components/article/ArticleGrid";
import { getAllCategoriesList } from "~/services/category.service";
import { getPagedContents } from "~/services/content.service";
import type { CategoryDto, ContentDto, PagedApiResponse } from "~/types/article";

export function meta({ params }: { params: { slug: string } }) {
  return [
    { title: "Tin tức & Bài viết | Hospital TTG" },
    { name: "description", content: "Cập nhật tin tức y tế và hoạt động mới nhất" },
  ];
}

const TYPE_TABS = [
  { value: "", label: "Tất cả" },
  { value: "article", label: "Bài viết" },
  { value: "album", label: "Album ảnh" },
  { value: "video", label: "Video" },
  { value: "service", label: "Dịch vụ y khoa" },
];

export default function DanhMucTinTucPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = React.useState<PagedApiResponse<ContentDto[]> | null>(null);
  const [categories, setCategories] = React.useState<CategoryDto[]>([]);
  const [currentCategory, setCurrentCategory] = React.useState<CategoryDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  const type = searchParams.get("type") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const categoryMap = React.useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  React.useEffect(() => {
    getAllCategoriesList()
      .then((cats) => {
        setCategories(cats);
        const found = cats.find((c) => c.slug === slug);
        if (!found) {
          setNotFound(true);
        } else {
          setCurrentCategory(found);
        }
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  React.useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getPagedContents({ categorySlug: slug, type, status: "1", page, pageSize: 9 })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [slug, type, page]);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    navigate(`/danh-muc-tin-tuc/${slug}?${params.toString()}`, { replace: true });
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    navigate(`/danh-muc-tin-tuc/${slug}?${params.toString()}`, { replace: true });
  }

  if (notFound) {
    return (
      <div>
        <div className="bg-[#008046] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-green-200 text-sm mb-3">
              <Link to="/" className="hover:text-white transition">Trang chủ</Link>
              <ChevronRight className="size-3.5" />
              <Link to="/tin-tuc" className="hover:text-white transition">Tin tức</Link>
              <ChevronRight className="size-3.5" />
              <span className="text-white">Không tìm thấy</span>
            </nav>
            <h1 className="text-3xl font-bold text-white">Danh mục không tồn tại</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Không tìm thấy danh mục</h2>
          <p className="text-gray-500 mb-6">Danh mục này có thể đã bị xóa hoặc đường dẫn không đúng.</p>
          <Link
            to="/tin-tuc"
            className="inline-block bg-[#008046] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-green-700 transition"
          >
            Quay lại danh sách tin tức
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-[#008046] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-green-200 text-sm mb-3">
            <Link to="/" className="hover:text-white transition">Trang chủ</Link>
            <ChevronRight className="size-3.5" />
            <Link to="/tin-tuc" className="hover:text-white transition">Tin tức</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white">{currentCategory?.name ?? "..."}</span>
          </nav>
          <h1 className="text-3xl font-bold text-white">{currentCategory?.name ?? "Tin tức"}</h1>
          {currentCategory && (
            <p className="text-green-100 mt-1 text-sm">
              Cập nhật tin tức và bài viết về {currentCategory.name.toLowerCase()}
            </p>
          )}
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
                      {type === tab.value && <ChevronRight className="size-3.5 text-[#008046]" />}
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
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        to={`/danh-muc-tin-tuc/${cat.slug}`}
                        className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100 last:border-0 flex items-center justify-between transition block ${
                          slug === cat.slug
                            ? "text-[#008046] font-semibold bg-green-50"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {cat.name}
                        {slug === cat.slug && <ChevronRight className="size-3.5 text-[#008046]" />}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <ArticleGrid
              data={data}
              loading={loading}
              categoryMap={categoryMap}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
