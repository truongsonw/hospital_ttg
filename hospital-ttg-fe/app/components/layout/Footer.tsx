import { Link } from "react-router";
import {
  Phone,
  MapPin,
  Clock,
  Flame,
  Mail,
  ArrowRight,
  CalendarCheck,
  UserRound,
  Search,
  ChevronRight,
} from "lucide-react";
import { useSiteSettings } from "~/context/site-settings.context";

export default function Footer() {
  const s = useSiteSettings();

  const siteName = s["site_name"] || "BỆNH VIỆN ĐA KHOA THẠCH THẤT";
  const logoUrl = s["logo_url"] || "/images/logo/logo.jpg";
  const address = s["address"] || "";
  const phone = s["phone"] || "";
  const hotline = s["hotline"] || "";
  const email = s["email"] || "";
  const workingHours = s["working_hours"] || "";
  const copyright = s["copyright"] || `Copyright © ${new Date().getFullYear()} - Bản quyền thuộc về Bệnh viện đa khoa Thạch Thất`;
  const facebook = s["facebook"] || "";
  const youtube = s["youtube"] || "";
  const zalo = s["zalo"] || "";
  const tiktok = s["tiktok"] || "";
  const wrapperClass = "mx-auto w-full max-w-7xl px-4";

  return (
    <footer className="bg-[#008046] text-white">
      {/* Top Yellow Bar */}
      {hotline && (
        <div className="bg-[#ffc52c] text-gray-800 py-3">
          <div className={`${wrapperClass} flex items-center`}>
            <p className="text-sm font-semibold flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Tổng đài <span className="font-bold ml-1">{hotline}</span>
            </p>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className={`${wrapperClass} py-12`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Hospital Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img
                src={logoUrl}
                alt="Logo"
                className="h-16 w-16 bg-white rounded-full p-2 object-cover"
              />
              <div>
                <h4 className="text-base font-bold uppercase">{siteName}</h4>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {address && (
                <div className="flex items-start gap-2">
                  <MapPin className="text-yellow-400 mt-1 w-4 h-4 shrink-0" />
                  <p>
                    <span className="font-semibold">Địa chỉ:</span> {address}
                  </p>
                </div>
              )}

              {phone && (
                <div className="flex items-start gap-2">
                  <Phone className="text-yellow-400 mt-1 w-4 h-4 shrink-0" />
                  <p>
                    <span className="font-semibold">Điện thoại:</span>{" "}
                    <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
                  </p>
                </div>
              )}

              {hotline && (
                <div className="flex items-start gap-2">
                  <Flame className="text-yellow-400 mt-1 w-4 h-4 shrink-0" />
                  <p>
                    <span className="font-semibold">Hotline:</span>{" "}
                    <a href={`tel:${hotline}`} className="hover:underline">{hotline}</a>
                  </p>
                </div>
              )}

              {email && (
                <div className="flex items-start gap-2">
                  <Mail className="text-yellow-400 mt-1 w-4 h-4 shrink-0" />
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    <a href={`mailto:${email}`} className="hover:underline">{email}</a>
                  </p>
                </div>
              )}

              {workingHours && (
                <div className="flex items-start gap-2">
                  <Clock className="text-yellow-400 mt-1 w-4 h-4 shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Lịch làm việc:</p>
                    <p className="text-green-200 whitespace-pre-line">{workingHours}</p>
                  </div>
                </div>
              )}

              {(facebook || youtube || zalo || tiktok) && (
                <div className="pt-2 flex flex-wrap gap-3">
                  {facebook && (
                    <a href={facebook} target="_blank" rel="noopener noreferrer"
                      className="text-xs uppercase tracking-wider text-yellow-300 hover:text-white transition">
                      Facebook
                    </a>
                  )}
                  {youtube && (
                    <a href={youtube} target="_blank" rel="noopener noreferrer"
                      className="text-xs uppercase tracking-wider text-yellow-300 hover:text-white transition">
                      YouTube
                    </a>
                  )}
                  {zalo && (
                    <a href={zalo} target="_blank" rel="noopener noreferrer"
                      className="text-xs uppercase tracking-wider text-yellow-300 hover:text-white transition">
                      Zalo
                    </a>
                  )}
                  {tiktok && (
                    <a href={tiktok} target="_blank" rel="noopener noreferrer"
                      className="text-xs uppercase tracking-wider text-yellow-300 hover:text-white transition">
                      TikTok
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <div className="space-y-4">
              {hotline && (
                <a
                  href={`tel:${hotline}`}
                  className="flex items-center justify-between border border-white/30 rounded-lg px-4 py-3 hover:bg-green-600 transition group">
                  <div className="flex items-center gap-3">
                    <Phone className="text-yellow-400 w-5 h-5" />
                    <span className="font-medium">Gọi đường dây nóng</span>
                  </div>
                  <ArrowRight className="text-yellow-400 w-5 h-5 group-hover:translate-x-1 transition" />
                </a>
              )}

              <Link
                to="/contact"
                className="flex items-center justify-between border border-white/30 rounded-lg px-4 py-3 hover:bg-green-600 transition group">
                <div className="flex items-center gap-3">
                  <CalendarCheck className="text-yellow-400 w-5 h-5" />
                  <span className="font-medium">Đặt lịch khám</span>
                </div>
                <ArrowRight className="text-yellow-400 w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                to="/doi-ngu-chuyen-gia"
                className="flex items-center justify-between border border-white/30 rounded-lg px-4 py-3 hover:bg-green-600 transition group">
                <div className="flex items-center gap-3">
                  <UserRound className="text-yellow-400 w-5 h-5" />
                  <span className="font-medium">Đội ngũ chuyên gia</span>
                </div>
                <ArrowRight className="text-yellow-400 w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                to="/tin-tuc"
                className="flex items-center justify-between border border-white/30 rounded-lg px-4 py-3 hover:bg-green-600 transition group">
                <div className="flex items-center gap-3">
                  <Search className="text-yellow-400 w-5 h-5" />
                  <span className="font-medium">Tin tức hoạt động</span>
                </div>
                <ArrowRight className="text-yellow-400 w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>

          {/* Column 3: Site Links */}
          <div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="hover:text-yellow-400 transition flex items-center gap-2">
                  <ChevronRight className="text-xs w-4 h-4 shrink-0" />
                  Giới thiệu bệnh viện
                </Link>
              </li>
              <li>
                <Link to="/ban-lanh-dao" className="hover:text-yellow-400 transition flex items-center gap-2">
                  <ChevronRight className="text-xs w-4 h-4 shrink-0" />
                  Ban lãnh đạo
                </Link>
              </li>
              <li>
                <Link to="/doi-ngu-chuyen-gia" className="hover:text-yellow-400 transition flex items-center gap-2">
                  <ChevronRight className="text-xs w-4 h-4 shrink-0" />
                  Đội ngũ bác sĩ
                </Link>
              </li>
              <li>
                <Link to="/tin-tuc" className="hover:text-yellow-400 transition flex items-center gap-2">
                  <ChevronRight className="text-xs w-4 h-4 shrink-0" />
                  Tin tức bệnh viện
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-yellow-400 transition flex items-center gap-2">
                  <ChevronRight className="text-xs w-4 h-4 shrink-0" />
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="py-4 border-t border-white/10">
        <div className={wrapperClass}>
          <p className="text-center text-sm text-green-200">{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
