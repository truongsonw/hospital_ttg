import { useState } from "react";
import { Link } from "react-router";
import { Menu, X, Search as SearchIcon, ChevronDown } from "lucide-react";

const menuItems = [
  { title: "Trang chủ", href: "/" },
  {
    title: "Giới thiệu",
    children: [
      {
        title: "Giới thiệu chung",
        href: "/introduce/general_introduction",
      },
      { title: "Ban lãnh đạo", href: "/introduce/management" },
    ],
  },
  {
    title: "Tin tức",
    href: "/tin-tuc",
    children: [
      { title: "Tất cả tin tức", href: "/tin-tuc" },
      { title: "Tin nội bộ", href: "/tin-tuc?type=article&categoryId=" },
      { title: "Câu chuyện bệnh nhân", href: "/news/patient_story" },
    ],
  },
  {
    title: "Thông tin hoạt động",
    children: [
      { title: "Hoạt động chuyên môn", href: "/operational_information/professional_activities" },
      { title: "Hoạt động Quản lý Chất lượng", href: "/operational_information/quality_management_activities" },
      { title: "Hoạt động Công tác xã hội", href: "/operational_information/social_work_activities" },
    ],
  },
  {
    title: "Dịch vụ y khoa",
    children: [
      { title: "Giá DVKTYT", href: "/medical_services/psychological_counseling_services" },
      { title: "Dịch vụ tư vấn tâm lý", href: "/medical_services/service_price" },
      { title: "Chụp X-quang", href: "/medical_services/x-ray" },
    ],
  },
  {
    title: "Thư viện",
    children: [
      { title: "Ảnh", href: "/library/image" },
      { title: "Video", href: "/library/video" },
    ],
  },
  {
    title: "Tuyển dụng & Thông báo",
    children: [
      { title: "Tuyển dụng", href: "/recruitment_announcements/recruitment" },
      { title: "Thông báo", href: "/recruitment_announcements/notification" },
    ],
  },
  { title: "Liên hệ", href: "/contact" },
];

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openSub, setOpenSub] = useState<number | null>(null);

  const toggleSubMenu = (index: number) => {
    setOpenSub(openSub === index ? null : index);
  };
  return (
    <header className="w-full relative z-50">
      {/* TOP BAR */}
      <div className="bg-green-600 text-white text-sm">
        <div className="max-w-7xl mx-auto flex justify-end gap-3 px-4 py-2">
          <a
            href="tel:0966101616"
            className="border border-white px-3 py-1 rounded-full hover:bg-white hover:text-green-600 transition">
            Đường dây nóng: 0966101616
          </a>
          <a
            href="#"
            className="border border-white px-3 py-1 rounded-full hover:bg-white hover:text-green-600 transition">
            Đặt lịch khám
          </a>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          {/* LOGO */}
          <Link to="/">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo/logo.jpg"
                alt="Logo"
                width={60}
                height={60}
                className="w-[60px] h-[60px] object-cover"
              />
              <div>
                <h4 className="font-bold text-gray-800 text-sm sm:text-base">
                  BỆNH VIỆN ĐA KHOA THẠCH THẤT
                </h4>
                <p className="hidden sm:block text-green-600 text-xs">
                  THACH THAT GENERAL HOSPITAL
                </p>
              </div>
            </div>
          </Link>
          <div className="hidden lg:block flex-1 px-6">
            <div className="relative h-[60px] w-full">
              <img
                src="/images/image_header/image_header.jpg"
                alt="Slogan"
                className="object-contain h-full w-full"
              />
            </div>
          </div>
          {/* SEARCH (Desktop only) */}
          <div className="hidden lg:flex items-center">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="border px-3 py-2 rounded-l-md focus:outline-none focus:border-green-600 h-10"
            />
            <button className="bg-green-600 text-white px-4 rounded-r-md hover:bg-green-700 transition h-10 flex items-center justify-center">
              Tìm
            </button>
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setOpenMenu(true)}
            className="lg:hidden text-green-600 p-2">
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* DESKTOP NAV */}
      <nav className="hidden lg:block bg-white ">
        <ul className="max-w-7xl mx-auto flex justify-center gap-8 py-4 text-[15px] font-medium">
          {menuItems.map((item, index) => (
            <li key={index} className="relative group">
              <Link
                to={item.href || "#"}
                className="text-gray-700 text-[17px] hover:text-green-600 transition flex items-center gap-1">
                {item.title}
                {item.children && (
                  <span className="text-xs transition-transform group-hover:rotate-180">
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </span>
                )}
              </Link>

              {/* SUBMENU */}
              {item.children && (
                <div
                  className="
                    absolute left-0 top-full pt-3
                    pointer-events-none
                    opacity-0 translate-y-2
                    transition-all duration-500
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                    will-change-transform
                    group-hover:opacity-100
                    group-hover:translate-y-0
                    group-hover:pointer-events-auto
                  ">
                  <ul className="bg-white text-gray-700 text-[17px] shadow-xl rounded-xl min-w-[230px] border border-gray-100 py-2">
                    {item.children.map((sub, i) => (
                      <li key={i}>
                        <Link
                          to={sub.href}
                          className="block px-5 py-2 hover:bg-green-50 hover:text-green-600 transition-colors duration-200">
                          {sub.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 z-50 ${
          openMenu ? "translate-x-0" : "translate-x-full"
        }`}>
        <div className="flex justify-between items-center p-4 border-b">
          <span className="font-semibold text-green-600">Menu</span>
          <button onClick={() => setOpenMenu(false)} className="p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        <ul className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <div className="flex justify-between items-center">
                <Link
                  to={item.href || "#"}
                  className="block py-2 text-gray-800 flex-1"
                  onClick={() =>
                    !item.children && setOpenMenu(false)
                  }>
                  {item.title}
                </Link>

                {item.children && (
                  <button
                    onClick={() => toggleSubMenu(index)}
                    className={`p-2 transition-transform duration-300 ${
                      openSub === index ? "rotate-180" : ""
                    }`}>
                    <ChevronDown className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* SUBMENU ACCORDION */}
              {item.children && (
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openSub === index ? "max-h-96 mt-2" : "max-h-0"
                  }`}>
                  <ul className="pl-4 space-y-2">
                    {item.children.map((sub, i) => (
                      <li key={i}>
                        <Link
                          to={sub.href}
                          className="block py-1 text-gray-600 hover:text-green-600"
                          onClick={() => setOpenMenu(false)}>
                          {sub.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* OVERLAY */}
      {openMenu && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setOpenMenu(false)}
        />
      )}
    </header>
  );
}
