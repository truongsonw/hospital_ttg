import * as React from "react";
import { Link, useParams } from "react-router";
import { Calendar, Eye, Tag, ChevronRight, Flame } from "lucide-react";
import { getContentBySlug, getPagedContents, incrementViewCount } from "~/services/content.service";
import { getAllCategoriesList } from "~/services/category.service";
import type { CategoryDto, ContentDto } from "~/types/article";

const TYPE_LABELS: Record<string, string> = {
  article: "Bài viết",
  album: "Album ảnh",
  video: "Video",
};

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function RelatedCard({ item }: { item: ContentDto }) {
  return (
    <Link
      to={`/tin-tuc/${item.slug}`}
      className="group flex gap-3 items-start py-3 border-b border-gray-100 last:border-0"
    >
      <div className="shrink-0 w-20 h-16 rounded-lg overflow-hidden bg-gray-100">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-green-50 text-xl">📰</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-[#008046] transition-colors leading-snug">
          {item.title}
        </p>
        <p className="text-xs text-gray-400 mt-1">{formatDate(item.publishedAt)}</p>
      </div>
    </Link>
  );
}

export default function TinTucDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = React.useState<ContentDto | null>(null);
  const [related, setRelated] = React.useState<ContentDto[]>([]);
  const [categories, setCategories] = React.useState<CategoryDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  const categoryMap = React.useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  React.useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    Promise.all([
      getContentBySlug(slug),
      getAllCategoriesList(),
    ]).then(([article, cats]) => {
      if (!article) {
        setNotFound(true);
        return;
      }
      setContent(article);
      setCategories(cats);

      // Load related articles (same type, exclude current)
      getPagedContents({ type: article.contentType, status: "1", page: 1, pageSize: 5 })
        .then((res) => {
          setRelated((res.data ?? []).filter((a) => a.id !== article.id).slice(0, 4));
        })
        .catch(() => {});

      // Increment view count non-blocking
      incrementViewCount(article.id).catch(() => {});
    }).catch(() => {
      setNotFound(true);
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4 max-w-3xl">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-8 bg-gray-200 rounded w-full" />
          <div className="h-8 bg-gray-200 rounded w-4/5" />
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${85 + (i % 3) * 5}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !content) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-6xl mb-4">🔍</p>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Không tìm thấy bài viết</h2>
        <p className="text-gray-500 mb-6">Bài viết có thể đã bị xóa hoặc đường dẫn không đúng.</p>
        <Link
          to="/tin-tuc"
          className="inline-block bg-[#008046] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-green-700 transition"
        >
          Quay lại danh sách tin tức
        </Link>
      </div>
    );
  }

  const categoryName = categoryMap[content.categoryId] ?? "";
  const tags = content.tags ? content.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div>
      {/* Hero */}
      <div className="bg-[#008046] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-green-200 text-sm flex-wrap">
            <Link to="/" className="hover:text-white transition">Trang chủ</Link>
            <ChevronRight className="size-3.5 shrink-0" />
            <Link to="/tin-tuc" className="hover:text-white transition">Tin tức</Link>
            <ChevronRight className="size-3.5 shrink-0" />
            <span className="text-white line-clamp-1">{content.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Main article */}
          <article className="flex-1 min-w-0">
            {/* Category & Hot badge */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {categoryName && (
                <span className="text-xs font-semibold text-[#008046] bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  {categoryName}
                </span>
              )}
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {TYPE_LABELS[content.contentType] ?? content.contentType}
              </span>
              {content.isHot && (
                <span className="flex items-center gap-1 text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                  <Flame className="size-3" /> Nổi bật
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
              {content.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 flex-wrap">
              {content.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  {formatDate(content.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Eye className="size-4" />
                {content.viewCount.toLocaleString("vi-VN")} lượt xem
              </span>
            </div>

            {/* Intro */}
            {content.intro && (
              <p className="text-gray-600 text-base leading-relaxed italic border-l-4 border-[#008046] pl-4 mb-6 bg-green-50 py-3 pr-3 rounded-r-lg">
                {content.intro}
              </p>
            )}

            {/* Body */}
            {content.body && (
              <div
                className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-[#008046] prose-img:rounded-xl prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: content.body }}
              />
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-8 pt-6 border-t border-gray-200">
                <Tag className="size-4 text-gray-400" />
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/tin-tuc?tags=${encodeURIComponent(tag)}`}
                    className="text-xs bg-gray-100 hover:bg-green-100 hover:text-[#008046] text-gray-600 px-3 py-1 rounded-full transition"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* File attachment */}
            {content.fileAttach && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                <span className="text-2xl">📎</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">File đính kèm</p>
                  <a
                    href={content.fileAttach}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#008046] hover:underline"
                  >
                    Tải xuống
                  </a>
                </div>
              </div>
            )}

            {/* Back link */}
            <div className="mt-10">
              <Link
                to="/tin-tuc"
                className="inline-flex items-center gap-2 text-sm text-[#008046] hover:text-green-700 font-medium transition"
              >
                ← Quay lại danh sách tin tức
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0 space-y-6">
            {related.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-[#008046] text-white font-semibold text-sm">
                  Bài viết liên quan
                </div>
                <div className="px-4">
                  {related.map((item) => (
                    <RelatedCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* CTA booking */}
            <div className="bg-gradient-to-br from-[#008046] to-green-700 rounded-xl p-5 text-white text-center shadow-md">
              <p className="text-lg font-bold mb-1">Đặt lịch khám</p>
              <p className="text-sm text-green-100 mb-4">Liên hệ ngay để được tư vấn và đặt lịch khám bệnh</p>
              <a
                href="tel:02433842217"
                className="inline-block bg-white text-[#008046] font-semibold text-sm px-5 py-2 rounded-full hover:bg-green-50 transition"
              >
                📞 024 33842217
              </a>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
