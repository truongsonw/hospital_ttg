import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import type { DepartmentDto } from "~/types/doctor";
import type { HomePageSectionDto } from "~/types/home";
import { resolveFileUrl } from "~/lib/storage-url";

interface SpecialtySectionProps {
  section?: HomePageSectionDto;
  departments?: DepartmentDto[];
  images?: string[];
}

export default function SpecialtySection({
  section,
  departments = [],
  images = [],
}: SpecialtySectionProps) {
  const specialties = departments
    .filter((d) => d.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const subtitle = section?.subtitle ?? "ĐƠN VỊ";
  const title = section?.title ?? "Chuyên khoa";
  const description = section?.description ?? "Chăm sóc sức khỏe toàn diện cho gia đình bạn";
  const buttonText = section?.buttonText ?? "Xem tất cả";
  const buttonUrl = section?.buttonUrl ?? "#";

  const primaryImage = images[0] ? resolveFileUrl(images[0]) : undefined;
  const secondaryImage = images[1] ? resolveFileUrl(images[1]) : undefined;

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* LEFT */}
      <div>
        {subtitle && <p className="text-green-600 font-semibold mb-2">{subtitle}</p>}
        {title && <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>}
        {description && <p className="text-gray-500 mb-8">{description}</p>}

        {specialties.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-500">
            Chưa có chuyên khoa nào được chọn hiển thị.
          </div>
        ) : (
          <ul className="space-y-4">
            {specialties.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center border-b border-gray-200 pb-3 group">
                <Link
                  to={`/chuyen-khoa/${item.slug}`}
                  className="flex flex-1 items-center justify-between gap-4">
                  <span className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-green-600 transition">
                    {item.name}
                  </span>
                  <span className="text-xl text-gray-400 group-hover:text-green-600 transition">
                    <ArrowRight className="w-6 h-6" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {buttonText && (
          <Link
            to={buttonUrl}
            className="inline-block mt-8 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition">
            {buttonText}
          </Link>
        )}
      </div>

      {/* RIGHT */}
      <div className="relative w-full flex justify-center">
        {primaryImage ? (
          <div className="relative w-[320px] sm:w-[400px] md:w-[460px] h-[300px] sm:h-[340px] md:h-[380px] rounded-2xl overflow-hidden shadow-lg border">
            <img
              src={primaryImage}
              alt={title ?? "Chuyên khoa"}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <div className="w-[320px] sm:w-[400px] md:w-[460px] h-[300px] sm:h-[340px] md:h-[380px] rounded-2xl border border-dashed border-green-100 bg-green-50 flex items-center justify-center text-sm text-green-700">
            Hospital TTG
          </div>
        )}

        {secondaryImage && (
          <div className="absolute -bottom-10 -left-6 w-[180px] h-[120px] rounded-xl overflow-hidden shadow-lg border-4 border-white">
            <img
              src={secondaryImage}
              alt={title ?? "Chuyên khoa"}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="absolute top-6 right-10 w-10 h-10 bg-yellow-400 rounded-full opacity-80"></div>
        <div className="absolute bottom-10 right-0 w-8 h-8 bg-green-500 rounded-full opacity-80"></div>
        <div className="absolute top-1/2 -right-6 w-6 h-6 bg-yellow-300 rounded-full opacity-80"></div>
      </div>
    </section>
  );
}
