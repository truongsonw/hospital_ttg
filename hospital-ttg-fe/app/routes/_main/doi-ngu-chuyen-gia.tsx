import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import type { Route } from "./+types/doi-ngu-chuyen-gia";
import { getPagedDoctors } from "~/services/doctor.service";
import { getAllDepartments } from "~/services/department.service";
import type { DoctorDto, DepartmentDto } from "~/types/doctor";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Đội ngũ chuyên gia | Hospital TTG" },
    { name: "description", content: "Đội ngũ bác sĩ và chuyên gia Bệnh viện Đa khoa Thạch Thất" },
  ];
}

const PAGE_SIZE = 12;

type FilterType = { type: "all" } | { type: "group"; id: string } | { type: "dept"; id: string };

function DeptFilter({
  departments,
  filter,
  onChange,
}: {
  departments: DepartmentDto[];
  filter: FilterType;
  onChange: (f: FilterType) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const topLevel = departments.filter((d) => !d.parentId);
  const getChildren = (parentId: string) => departments.filter((d) => d.parentId === parentId);
  const standalone = departments.filter(
    (d) => !d.parentId && getChildren(d.id).length === 0
  );
  const groups = topLevel.filter((d) => getChildren(d.id).length > 0);

  const isActive = (f: FilterType) => {
    if (filter.type === "all" && f.type === "all") return true;
    if (filter.type === "group" && f.type === "group") return filter.id === f.id;
    if (filter.type === "dept" && f.type === "dept") return filter.id === f.id;
    return false;
  };

  const btnBase = "w-full text-left px-3 py-2 text-sm rounded-lg transition cursor-pointer";
  const btnActive = "bg-green-600 text-white font-medium";
  const btnInactive = "text-gray-700 hover:bg-gray-100";

  return (
    <div className="space-y-1">
      {/* Tất cả */}
      <button
        onClick={() => onChange({ type: "all" })}
        className={`${btnBase} ${isActive({ type: "all" }) ? btnActive : btnInactive}`}
      >
        Tất cả bác sĩ
      </button>

      {/* Groups with children */}
      {groups.map((group) => {
        const children = getChildren(group.id);
        const open = expanded[group.id] ?? true;
        const groupActive = filter.type === "group" && filter.id === group.id;

        return (
          <div key={group.id}>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onChange({ type: "group", id: group.id })}
                className={`${btnBase} flex-1 font-semibold ${groupActive ? btnActive : btnInactive}`}
              >
                {group.name}
              </button>
              <button
                onClick={() => setExpanded((p) => ({ ...p, [group.id]: !open }))}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer shrink-0"
              >
                {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            {open && (
              <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-3">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => onChange({ type: "dept", id: child.id })}
                    className={`${btnBase} ${isActive({ type: "dept", id: child.id }) ? btnActive : btnInactive}`}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Standalone departments (no parent, no children) */}
      {standalone.map((d) => (
        <button
          key={d.id}
          onClick={() => onChange({ type: "dept", id: d.id })}
          className={`${btnBase} ${isActive({ type: "dept", id: d.id }) ? btnActive : btnInactive}`}
        >
          {d.name}
        </button>
      ))}
    </div>
  );
}

export default function DoctorListPage() {
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState<FilterType>({ type: "all" });
  const [loading, setLoading] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof getPagedDoctors>[0] = {
        search: search || undefined,
        page,
        pageSize: PAGE_SIZE,
      };
      if (filter.type === "group") params.groupId = filter.id;
      if (filter.type === "dept") params.departmentId = filter.id;

      const res = await getPagedDoctors(params);
      setDoctors(res.data ?? []);
      setTotalPages(res.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
  useEffect(() => { getAllDepartments(true).then(setDepartments).catch(() => {}); }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function handleFilterChange(f: FilterType) {
    setFilter(f);
    setPage(1);
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 py-14 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          <p className="text-sm uppercase tracking-widest opacity-80 mb-2">Bác sĩ</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Đội ngũ chuyên gia</h1>
          <p className="text-green-100 max-w-xl mx-auto text-base">
            Hơn 1.000 bác sĩ và chuyên gia y tế tận tâm phục vụ tại Bệnh viện Đa khoa Thạch Thất.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm bác sĩ..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition cursor-pointer">
            Tìm
          </button>
        </form>

        <div className="flex gap-8">
          {/* Sidebar filter */}
          <aside className="w-56 shrink-0 hidden md:block">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Lọc theo khoa</p>
            <DeptFilter departments={departments} filter={filter} onChange={handleFilterChange} />
          </aside>

          {/* Doctor grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center py-20 text-gray-400">Đang tải...</div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-20 text-gray-400">Không tìm thấy bác sĩ nào.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {doctors.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/doi-ngu-chuyen-gia/${doc.id}`}
                    className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-green-200 transition"
                  >
                    <div className="relative w-full aspect-[3/4] bg-gray-100">
                      {doc.avatarUrl ? (
                        <img src={doc.avatarUrl} alt={doc.fullName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">👤</div>
                      )}
                    </div>
                    <div className="p-4">
                      {doc.departmentName && (
                        <p className="text-xs text-green-600 font-medium mb-1 truncate">{doc.departmentName}</p>
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
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition cursor-pointer">
                  ← Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`px-4 py-2 border rounded-lg text-sm transition cursor-pointer ${p === page ? "bg-green-600 text-white border-green-600" : "hover:bg-gray-50"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition cursor-pointer">
                  Sau →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
