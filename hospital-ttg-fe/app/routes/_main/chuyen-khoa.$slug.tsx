import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ChevronRight } from "lucide-react";
import type { Route } from "./+types/chuyen-khoa.$slug";
import { getDepartmentBySlug, getAllDepartments } from "~/services/department.service";
import { getPagedDoctors } from "~/services/doctor.service";
import type { DepartmentDto, DoctorDto } from "~/types/doctor";
import { resolveFileUrl } from "~/lib/storage-url";

export function meta({ params, data }: Route.MetaArgs) {
  const name = (data as { department?: DepartmentDto } | undefined)?.department?.name;
  return [
    { title: name ? `${name} | Hospital TTG` : "Chuyên khoa | Hospital TTG" },
  ];
}

export default function ChuyenKhoaDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [department, setDepartment] = useState<DepartmentDto | null>(null);
  const [allDepartments, setAllDepartments] = useState<DepartmentDto[]>([]);
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);

    Promise.all([
      getDepartmentBySlug(slug),
      getAllDepartments(true),
    ]).then(([dept, depts]) => {
      if (!dept) {
        setError(true);
        return;
      }
      setDepartment(dept);
      setAllDepartments(depts);

      // Load doctors for this department
      getPagedDoctors({ departmentSlug: slug, page: 1, pageSize: 20 })
        .then((res) => setDoctors(res.data ?? []))
        .catch(() => {});
    }).catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-400">
        Đang tải...
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-gray-500">
        <p>Không tìm thấy chuyên khoa.</p>
        <Link to="/chuyen-khoa" className="text-green-600 underline text-sm">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const siblings = allDepartments.filter(
    (d) => d.parentId === department.parentId && d.id !== department.id
  );
  const children = allDepartments.filter((d) => d.parentId === department.id);

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <Link to="/" className="hover:text-green-600 transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link to="/chuyen-khoa" className="hover:text-green-600 transition">Chuyên khoa</Link>
          {department.parentId && (
            <>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <Link
                to={`/chuyen-khoa/${allDepartments.find((d) => d.id === department.parentId)?.slug}`}
                className="hover:text-green-600 transition"
              >
                {allDepartments.find((d) => d.id === department.parentId)?.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-gray-800 font-medium">{department.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Department Info */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{department.name}</h1>
          {department.description && (
            <p className="text-gray-600 leading-relaxed max-w-3xl">{department.description}</p>
          )}
        </div>

        {/* Child departments */}
        {children.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Các khoa con</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {children.map((child) => (
                <Link
                  key={child.id}
                  to={`/chuyen-khoa/${child.slug}`}
                  className="rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-green-300 transition"
                >
                  <p className="font-medium text-gray-800">{child.name}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Doctors */}
        {doctors.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Bác sĩ</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {doctors.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/doi-ngu-chuyen-gia/${doc.slug}`}
                  className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-green-200 transition"
                >
                  <div className="relative w-full aspect-[3/4] bg-gray-100">
                    {doc.avatarUrl ? (
                      <img
                        src={resolveFileUrl(doc.avatarUrl)}
                        alt={doc.fullName}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">👤</div>
                    )}
                  </div>
                  <div className="p-4">
                    {doc.specialty && (
                      <p className="text-xs text-green-600 font-medium mb-1 truncate">{doc.specialty}</p>
                    )}
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                      {doc.academicTitle && <span className="text-gray-500 font-normal">{doc.academicTitle} </span>}
                      {doc.fullName}
                    </h3>
                    {doc.position && <p className="text-xs text-gray-500 mt-1 truncate">{doc.position}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sibling departments */}
        {siblings.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Các khoa khác</h2>
            <div className="flex flex-wrap gap-3">
              {siblings.map((sib) => (
                <Link
                  key={sib.id}
                  to={`/chuyen-khoa/${sib.slug}`}
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-green-400 hover:text-green-600 transition"
                >
                  {sib.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-10">
          <Link
            to="/chuyen-khoa"
            className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline"
          >
            ← Quay lại danh sách chuyên khoa
          </Link>
        </div>
      </div>
    </div>
  );
}
