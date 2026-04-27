import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { getFeaturedDoctors } from "~/services/doctor.service";
import type { DoctorDto } from "~/types/doctor";

export default function DoctorSlider() {
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [visible, setVisible] = useState(4);
  const [current, setCurrent] = useState(4);
  const [transition, setTransition] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    getFeaturedDoctors(8).then(setDoctors).catch(() => {});
  }, []);

  const isLoopable = doctors.length > visible;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisible(1);
      else if (window.innerWidth < 1024) setVisible(2);
      else setVisible(4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const slideWidth = 100 / visible;

  const sliderData = useMemo(() => {
    if (!isLoopable || doctors.length === 0) return doctors;
    const clone = visible;
    return [
      ...doctors.slice(-clone),
      ...doctors,
      ...doctors.slice(0, clone),
    ];
  }, [doctors, visible, isLoopable]);

  const next = () => { if (isLoopable) setCurrent((p) => p + 1); };
  const prev = () => { if (isLoopable) setCurrent((p) => p - 1); };

  useEffect(() => {
    if (paused || !isLoopable) return;
    const timer = setInterval(() => setCurrent((p) => p + 1), 3000);
    return () => clearInterval(timer);
  }, [paused, isLoopable]);

  useEffect(() => {
    if (!isLoopable) return;
    const total = doctors.length;
    if (current >= total + visible) {
      setTimeout(() => { setTransition(false); setCurrent(visible); }, 500);
    }
    if (current < visible) {
      setTimeout(() => { setTransition(false); setCurrent(total + visible - 1); }, 500);
    }
  }, [current, visible, isLoopable, doctors.length]);

  useEffect(() => {
    if (!transition) requestAnimationFrame(() => setTransition(true));
  }, [transition]);

  useEffect(() => {
    setCurrent(isLoopable ? visible : 0);
  }, [visible, isLoopable]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <div>
          <p className="text-green-600 font-semibold text-sm uppercase">Bác sĩ</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">Đội ngũ chuyên gia</h2>
          <p className="text-gray-600 mt-2 max-w-xl">
            Hơn 1.000 bác sĩ và hơn 4.300 nhân viên y tế tận tâm phục vụ.
          </p>
        </div>
        <Link
          to="/doi-ngu-chuyen-gia"
          className="px-5 py-2 border border-green-600 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition text-sm"
        >
          Tìm bác sĩ
        </Link>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : (
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {isLoopable && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10 cursor-pointer text-gray-700 hover:text-green-600 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10 cursor-pointer text-gray-700 hover:text-green-600 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div
            className={`flex ${transition ? "transition-transform duration-500 ease-in-out" : ""}`}
            style={{ transform: `translateX(-${current * slideWidth}%)` }}
          >
            {sliderData.map((doc, i) => (
              <div key={i} style={{ width: `${slideWidth}%` }} className="px-3 shrink-0">
                <Link
                  to={`/doi-ngu-chuyen-gia/${doc.id}`}
                  className="block bg-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
                >
                  <div className="relative w-full h-[320px]">
                    {doc.avatarUrl ? (
                      <img src={doc.avatarUrl} alt={doc.fullName} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">👤</div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-gray-600 text-sm">{doc.position ?? doc.departmentName ?? ""}</p>
                    <h3 className="font-semibold text-lg mt-1">
                      {doc.academicTitle ? `${doc.academicTitle} ${doc.fullName}` : doc.fullName}
                    </h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
