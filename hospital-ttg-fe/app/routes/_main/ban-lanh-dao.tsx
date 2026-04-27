import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/ban-lanh-dao";
import { getManagementDoctors } from "~/services/doctor.service";
import type { DoctorDto } from "~/types/doctor";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ban lãnh đạo | Hospital TTG" },
    { name: "description", content: "Bộ máy lãnh đạo Bệnh viện Đa khoa Thạch Thất" },
  ];
}

export default function ManagementPage() {
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getManagementDoctors()
      .then(setDoctors)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 py-14 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          <p className="text-sm uppercase tracking-widest opacity-80 mb-2">Giới thiệu</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Ban lãnh đạo</h1>
          <p className="text-green-100 max-w-xl mx-auto text-base">
            Bộ máy quản lý và lãnh đạo Bệnh viện Đa khoa Thạch Thất.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Đang tải...</div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Chưa có thông tin lãnh đạo.</div>
        ) : (
          <>
            {/* Top leader — first item centered */}
            {doctors[0] && (
              <div className="flex justify-center mb-10">
                <DoctorCard doc={doctors[0]} large />
              </div>
            )}

            {/* Remaining leaders */}
            {doctors.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {doctors.slice(1).map((doc) => (
                  <DoctorCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/doi-ngu-chuyen-gia"
            className="inline-flex items-center gap-2 text-sm text-green-600 hover:underline"
          >
            Xem toàn bộ đội ngũ bác sĩ →
          </Link>
        </div>
      </div>
    </div>
  );
}

function DoctorCard({ doc, large = false }: { doc: DoctorDto; large?: boolean }) {
  return (
    <Link
      to={`/doi-ngu-chuyen-gia/${doc.id}`}
      className={`group block rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-green-200 transition ${large ? "w-56" : ""}`}
    >
      <div className={`w-full bg-gray-100 ${large ? "aspect-[3/4]" : "aspect-[3/4]"}`}>
        {doc.avatarUrl ? (
          <img
            src={doc.avatarUrl}
            alt={doc.fullName}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">👤</div>
        )}
      </div>
      <div className={`text-center ${large ? "p-5" : "p-4"}`}>
        {doc.academicTitle && (
          <p className="text-xs text-gray-400 mb-0.5">{doc.academicTitle}</p>
        )}
        <h3 className={`font-bold text-gray-900 leading-snug ${large ? "text-base" : "text-sm"}`}>
          {doc.fullName}
        </h3>
        {doc.position && (
          <p className={`text-green-600 font-medium mt-1 ${large ? "text-sm" : "text-xs"}`}>
            {doc.position}
          </p>
        )}
        {doc.departmentName && (
          <p className="text-xs text-gray-400 mt-0.5">{doc.departmentName}</p>
        )}
      </div>
    </Link>
  );
}
