import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import type { DepartmentDto } from "~/types/doctor";

const fallbackSpecialties = [
  { id: "khoa-kham-benh", name: "Khoa Khám bệnh" },
  { id: "khoa-noi-tong-hop", name: "Khoa Nội tổng hợp" },
  { id: "khoa-ngoai-tong-hop", name: "Khoa Ngoại tổng hợp" },
  { id: "khoa-phu-san", name: "Khoa Phụ sản" },
  { id: "khoa-nhi", name: "Khoa Nhi" },
];

interface SpecialtySectionProps {
  departments?: DepartmentDto[];
}

export default function SpecialtySection({ departments = [] }: SpecialtySectionProps) {
  const specialties = departments.length > 0
    ? departments
        .filter((department) => department.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .slice(0, 5)
        .map((department) => ({ id: department.id, name: department.name }))
    : fallbackSpecialties;

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* LEFT */}
      <div>
        <p className="text-green-600 font-semibold mb-2">ĐƠN VỊ</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Chuyên khoa
        </h2>
        <p className="text-gray-500 mb-8">
          Chăm sóc sức khỏe toàn diện cho gia đình bạn
        </p>

        <ul className="space-y-4">
          {specialties.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center border-b border-gray-200 pb-3 group cursor-pointer">
              <span className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-green-600 transition">
                {item.name}
              </span>
              <span className="text-xl text-gray-400 group-hover:text-green-600 transition">
                <ArrowRight className="w-6 h-6" />
              </span>
            </li>
          ))}
        </ul>

        <Link
          to="#"
          className="inline-block mt-8 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition">
          Xem tất cả
        </Link>
      </div>

      {/* RIGHT */}
      <div className="relative w-full flex justify-center">
        {/* ảnh lớn */}
        <div className="relative w-[320px] sm:w-[400px] md:w-[460px] h-[300px] sm:h-[340px] md:h-[380px] rounded-2xl overflow-hidden shadow-lg border">
          <img
            src="/images/doctor/doctor1.jpg"
            alt="doctor"
            className="object-cover w-full h-full"
          />
        </div>

        {/* ảnh nhỏ overlay */}
        <div className="absolute -bottom-10 -left-6 w-[180px] h-[120px] rounded-xl overflow-hidden shadow-lg border-4 border-white">
          <img
            src="/images/doctor/doctor1.jpg"
            alt="doctor"
            className="object-cover w-full h-full"
          />
        </div>

        <div className="absolute top-6 right-10 w-10 h-10 bg-yellow-400 rounded-full opacity-80"></div>
        <div className="absolute bottom-10 right-0 w-8 h-8 bg-green-500 rounded-full opacity-80"></div>
        <div className="absolute top-1/2 -right-6 w-6 h-6 bg-yellow-300 rounded-full opacity-80"></div>
      </div>
    </section>
  );
}
