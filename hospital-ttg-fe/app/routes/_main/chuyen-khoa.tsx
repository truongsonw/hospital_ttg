import { useState, useEffect } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/chuyen-khoa";
import { getAllDepartments } from "~/services/department.service";
import type { DepartmentDto } from "~/types/doctor";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chuyên khoa | Hospital TTG" },
    { name: "description", content: "Danh sách các chuyên khoa của Bệnh viện Đa khoa Thạch Thất" },
  ];
}

export default function ChuyenKhoaPage() {
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllDepartments(true)
      .then(setDepartments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const topLevel = departments.filter((d) => !d.parentId);
  const getChildren = (parentId: string) => departments.filter((d) => d.parentId === parentId);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 py-14 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          <p className="text-sm uppercase tracking-widest opacity-80 mb-2">Dịch vụ</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Chuyên khoa</h1>
          <p className="text-green-100 max-w-xl mx-auto text-base">
            Các chuyên khoa chính của Bệnh viện Đa khoa Thạch Thất.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topLevel.map((dept) => {
              const children = getChildren(dept.id);
              return (
                <div key={dept.id} className="rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-200 transition">
                  <Link to={`/chuyen-khoa/${dept.slug}`} className="block p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg text-gray-900">{dept.name}</h3>
                      <span className="text-green-600 text-sm">→</span>
                    </div>
                    {dept.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{dept.description}</p>
                    )}
                  </Link>
                  {children.length > 0 && (
                    <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
                      <div className="flex flex-wrap gap-2">
                        {children.slice(0, 4).map((child) => (
                          <Link
                            key={child.id}
                            to={`/chuyen-khoa/${child.slug}`}
                            className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 hover:border-green-400 hover:text-green-600 transition"
                          >
                            {child.name}
                          </Link>
                        ))}
                        {children.length > 4 && (
                          <span className="text-xs text-gray-400 px-2 py-1">+{children.length - 4}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
