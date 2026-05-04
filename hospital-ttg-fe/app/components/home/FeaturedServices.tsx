import { Link } from "react-router";

export interface ServiceItem {
  title: string;
  image?: string | null;
  href?: string;
  excerpt?: string | null;
  date?: string | null;
  category?: string | null;
}

export interface FeaturedServicesData {
  subtitle?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  emptyText?: string;
  services: ServiceItem[];
}

interface FeaturedServicesProps {
  data: FeaturedServicesData;
}

export default function FeaturedServices({ data }: FeaturedServicesProps) {
  const { subtitle, title, description, buttonText, buttonHref, emptyText, services } = data;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      {subtitle && <p className="text-green-600 font-semibold mb-2">{subtitle}</p>}
      {title && <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>}
      {description && <p className="text-gray-500 mb-8">{description}</p>}

      {/* Grid */}
      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">
          {emptyText ?? "Chưa có dữ liệu hiển thị."}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((item, index) => {
            const content = (
              <>
                <div className="relative w-full h-[160px] overflow-hidden bg-green-50">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-green-700">
                      Hospital TTG
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {item.category && (
                    <p className="mb-2 text-xs font-semibold uppercase text-green-600">
                      {item.category}
                    </p>
                  )}
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 group-hover:text-green-600 transition line-clamp-2">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {item.excerpt}
                    </p>
                  )}
                  {item.date && (
                    <p className="mt-3 text-xs text-gray-400">
                      {new Date(item.date).toLocaleDateString("vi-VN")}
                    </p>
                  )}
                </div>
              </>
            );

            const className = "bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition overflow-hidden group cursor-pointer";
            return item.href ? (
              <Link key={`${item.href}-${index}`} to={item.href} className={className}>
                {content}
              </Link>
            ) : (
              <div key={`${item.title}-${index}`} className={className}>
                {content}
              </div>
            );
          })}
        </div>
      )}

      {/* Button */}
      {buttonText && (
        <div className="flex justify-center mt-10">
          <Link
            to={buttonHref ?? "#"}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition shadow-md hover:shadow-lg cursor-pointer"
          >
            {buttonText}
          </Link>
        </div>
      )}
    </section>
  );
}
