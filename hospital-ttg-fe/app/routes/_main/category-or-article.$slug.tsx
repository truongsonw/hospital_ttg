import * as React from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { ChevronRight } from "lucide-react";
import ArticleGrid from "~/components/article/ArticleGrid";
import { getAllCategoriesList } from "~/services/category.service";
import { getPagedContents } from "~/services/content.service";
import type { CategoryDto, ContentDto, PagedApiResponse } from "~/types/article";

const TYPE_TABS = [
  { value: "", label: "Tất cả" },
  { value: "article", label: "Bài viết" },
  { value: "album", label: "Album ảnh" },
  { value: "video", label: "Video" },
  { value: "service", label: "Dịch vụ y khoa" },
];

function CategoryPage({
  slug,
  currentCategory,
  categories,
}: {
  slug: string;
  currentCategory: CategoryDto;
  categories: CategoryDto[];
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = React.useState<PagedApiResponse<ContentDto[]> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const type = searchParams.get("type") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const categoryMap = React.useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  React.useEffect(() => {
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
    navigate(`/${slug}?${params.toString()}`, { replace: true });
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    navigate(`/${slug}?${params.toString()}`, { replace: true });
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-[#008046] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-green-200 text-sm mb-3">
            <Link to="/" className="hover:text-white transition">Trang chủ</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white">{currentCategory.name}</span>
          </nav>
          <h1 className="text-3xl font-bold text-white">{currentCategory.name}</h1>
          <p className="text-green-100 mt-1 text-sm">
            Cập nhật tin tức và bài viết về {currentCategory.name.toLowerCase()}
          </p>
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
                        to={`/${cat.slug}`}
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

export default function CategoryOrArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [categories, setCategories] = React.useState<CategoryDto[]>([]);
  const [currentCategory, setCurrentCategory] = React.useState<CategoryDto | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

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
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="grid grid-cols-3 gap-6 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !currentCategory) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-6xl mb-4">🔍</p>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Không tìm thấy trang</h2>
        <p className="text-gray-500 mb-6">Trang này có thể đã bị xóa hoặc đường dẫn không đúng.</p>
        <Link
          to="/"
          className="inline-block bg-[#008046] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-green-700 transition"
        >
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <CategoryPage
      slug={slug!}
      currentCategory={currentCategory}
      categories={categories}
    />
  );
}
