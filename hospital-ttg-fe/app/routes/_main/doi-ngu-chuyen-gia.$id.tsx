import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ChevronRight } from "lucide-react";
import type { Route } from "./+types/doi-ngu-chuyen-gia.$id";
import { getDoctorById } from "~/services/doctor.service";
import type { DoctorDto } from "~/types/doctor";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: "Thông tin bác sĩ | Hospital TTG" },
  ];
}

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<DoctorDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDoctorById(id)
      .then(setDoctor)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-400">
        Đang tải...
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-gray-500">
        <p>Không tìm thấy thông tin bác sĩ.</p>
        <Link to="/doi-ngu-chuyen-gia" className="text-green-600 underline text-sm">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-green-600 transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/doi-ngu-chuyen-gia" className="hover:text-green-600 transition">Đội ngũ chuyên gia</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-800 font-medium truncate max-w-48">{doctor.fullName}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left — Avatar & Info Card */}
          <div className="md:col-span-1">
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="aspect-[3/4] bg-gray-100">
                {doctor.avatarUrl ? (
                  <img
                    src={doctor.avatarUrl}
                    alt={doctor.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">👤</div>
                )}
              </div>
              <div className="p-5 space-y-3">
                {doctor.departmentName && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Khoa</p>
                    <p className="text-sm font-medium text-green-700">{doctor.departmentName}</p>
                  </div>
                )}
                {doctor.specialty && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Chuyên khoa</p>
                    <p className="text-sm text-gray-700">{doctor.specialty}</p>
                  </div>
                )}
                {doctor.position && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Chức vụ</p>
                    <p className="text-sm text-gray-700">{doctor.position}</p>
                  </div>
                )}
              </div>
            </div>

            <Link
              to="/doi-ngu-chuyen-gia"
              className="mt-4 flex items-center gap-1 text-sm text-green-600 hover:underline"
            >
              ← Xem tất cả bác sĩ
            </Link>
          </div>

          {/* Right — Detail */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {doctor.academicTitle && (
                <span className="text-gray-500 font-normal mr-1">{doctor.academicTitle}</span>
              )}
              {doctor.fullName}
            </h1>
            {doctor.position && (
              <p className="text-green-600 font-medium mb-6">{doctor.position}</p>
            )}

            {doctor.bio ? (
              <div
                className="prose prose-green max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: doctor.bio }}
              />
            ) : (
              <p className="text-gray-400 italic">Chưa có thông tin giới thiệu.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
