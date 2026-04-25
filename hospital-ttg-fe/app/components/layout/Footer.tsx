import { Link } from "react-router";
import {
  Phone,
  MapPin,
  Clock,
  Flame,
  ArrowRight,
  CalendarCheck,
  UserRound,
  Search,
  ChevronRight,
} from "lucide-react";

export default function Footer() {
  return (
    // <!-- Footer -->
    <footer className="bg-[#008046] text-white">
      {/* <!-- Top Yellow Bar --> */}
      <div className="bg-[#ffc52c] text-gray-800 py-3">
        <div className="container mx-auto px-4 flex items-center">
          <p className="text-sm font-semibold flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            Tổng đài <span className="font-bold ml-1">1900.888.866</span>
          </p>
        </div>
      </div>

      {/* <!-- Main Footer Content --> */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* <!-- Column 1: Hospital Info --> */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative h-16 w-16">
                <img
                  src="/images/logo/logo.jpg"
                  alt="Logo"
                  className="h-16 w-16 bg-white rounded-full p-2 object-cover"
                />
              </div>
              <div>
                <h4 className="text-base font-bold">
                  BỆNH VIỆN ĐA KHOA THẠCH THẤT
                </h4>
                <p className="text-sm text-green-200">
                  THACH THAT GENERAL HOSPITAL
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="text-yellow-400 mt-1 w-4 h-4 shrink-0" />
                <p>
                  <span className="font-semibold">Địa chỉ:</span> Số
                  79, đường 420, xã Kim Quan, huyện Thạch Thất, TP.Hà
                  Nội
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="text-yellow-400 mt-1 w-4 h-4 shrink-0" />
                <p>
                  <span className="font-semibold">Tổng đài:</span> 024
                  33842217
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Flame className="text-yellow-400 mt-1 w-4 h-4 shrink-0" />
                <p>
                  <span className="font-semibold">Hotline:</span>{" "}
                  0966101616
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="text-yellow-400 mt-1 w-4 h-4 shrink-0" />
                <div>
                  <p className="font-semibold mb-2">Lịch làm việc:</p>
                  <div className="ml-4 space-y-1">
                    <p className="text-green-200">
                      Khoa Khám bệnh theo yêu cầu:
                    </p>
                    <ul className="list-disc list-inside ml-2 text-green-200">
                      <li>Thứ 2 - Thứ 6: 06:00 - 16:30</li>
                    </ul>
                    <p className="text-green-200 mt-2">
                      Khoa Khám bệnh: Thứ 2 — Thứ 6
                    </p>
                    <ul className="list-disc list-inside ml-2 text-green-200">
                      <li>Sáng: 07:00 - 12:00</li>
                      <li>Chiều: 13:30 - 16:30</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <!-- Column 2: Quick Links --> */}
          <div>
            <div className="space-y-4">
              <Link
                to="#"
                className="flex items-center justify-between border border-white/30 rounded-lg px-4 py-3 hover:bg-green-600 transition group">
                <div className="flex items-center gap-3">
                  <Phone className="text-yellow-400 w-5 h-5" />
                  <span className="font-medium">Gọi tổng đài</span>
                </div>
                <ArrowRight className="text-yellow-400 w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                to="#"
                className="flex items-center justify-between border border-white/30 rounded-lg px-4 py-3 hover:bg-green-600 transition group">
                <div className="flex items-center gap-3">
                  <CalendarCheck className="text-yellow-400 w-5 h-5" />
                  <span className="font-medium">Đặt lịch khám</span>
                </div>
                <ArrowRight className="text-yellow-400 w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                to="#"
                className="flex items-center justify-between border border-white/30 rounded-lg px-4 py-3 hover:bg-green-600 transition group">
                <div className="flex items-center gap-3">
                  <UserRound className="text-yellow-400 w-5 h-5" />
                  <span className="font-medium">
                    Hỏi đáp cùng chuyên gia
                  </span>
                </div>
                <ArrowRight className="text-yellow-400 w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                to="#"
                className="flex items-center justify-between border border-white/30 rounded-lg px-4 py-3 hover:bg-green-600 transition group">
                <div className="flex items-center gap-3">
                  <Search className="text-yellow-400 w-5 h-5" />
                  <span className="font-medium">
                    Tra cứu kết quả xét nghiệm
                  </span>
                </div>
                <ArrowRight className="text-yellow-400 w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>

          <div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="#"
                  className="hover:text-yellow-400 transition flex items-center gap-2">
                  <ChevronRight className="text-xs w-4 h-4 shrink-0" />
                  Về Bệnh viện đa khoa Thạch Thất
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-yellow-400 transition flex items-center gap-2">
                  <ChevronRight className="text-xs w-4 h-4 shrink-0" />
                  Đơn vị chuyên khoa
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-yellow-400 transition flex items-center gap-2">
                  <ChevronRight className="text-xs w-4 h-4 shrink-0" />
                  Đội ngũ bác sĩ
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-yellow-400 transition flex items-center gap-2">
                  <ChevronRight className="text-xs w-4 h-4 shrink-0" />
                  Tin hoạt động bệnh viện
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-yellow-400 transition flex items-center gap-2">
                  <ChevronRight className="text-xs w-4 h-4 shrink-0" />
                  Tin mới nhất
                </Link>
              </li>
            </ul>

          </div>
        </div>
      </div>

      <div className="py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-green-200">
            Copyright © 2026 - Bản quyền thuộc về Bệnh viện đa khoa Thạch Thất 
          </p>
        </div>
      </div>
    </footer>
  );
}
