import { useMemo, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Menu, X, ChevronDown, Search } from "lucide-react";
import { useSiteSettings } from "~/context/site-settings.context";
import { usePublicMenus } from "~/context/public-menus.context";
import type { MenuDto } from "~/types/system";
import { resolveFileUrl } from "~/lib/storage-url";
import { getSearchSuggestions } from "~/services/search.service";
import type { SearchSuggestItem } from "~/types/search";

type HeaderMenuItem = {
  title: string;
  href?: string;
  children?: { title: string; href: string }[];
};

const fallbackMenuItems: HeaderMenuItem[] = [
  { title: "Trang chủ", href: "/" },
  {
    title: "Giới thiệu",
    children: [{ title: "Giới thiệu chung", href: "/about" }],
  },
  {
    title: "Đội ngũ bác sĩ",
    children: [
      { title: "Ban lãnh đạo", href: "/ban-lanh-dao" },
      { title: "Đội ngũ chuyên gia", href: "/doi-ngu-chuyen-gia" },
    ],
  },
  {
    title: "Tin tức",
    href: "/tin-tuc",
    children: [{ title: "Tất cả tin tức", href: "/tin-tuc" }],
  },
  { title: "Liên hệ", href: "/contact" },
];

function toHeaderItems(nodes: MenuDto[]): HeaderMenuItem[] {
  return nodes.map((n) => ({
    title: n.title,
    href: n.url ?? undefined,
    children: n.children?.length
      ? n.children.map((c) => ({ title: c.title, href: c.url ?? "#" }))
      : undefined,
  }));
}

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openSub, setOpenSub] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const s = useSiteSettings();
  const publicMenus = usePublicMenus();

  const menuItems = useMemo<HeaderMenuItem[]>(
    () => (publicMenus.length > 0 ? toHeaderItems(publicMenus) : fallbackMenuItems),
    [publicMenus],
  );

  const hotline = s["hotline"] || "0966101616";
  const logoUrl = resolveFileUrl(s["logo_url"]) || "/images/logo/logo.jpg";
  const siteName = s["site_name"] || "BỆNH VIỆN ĐA KHOA THẠCH THẤT";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(() => {
      getSearchSuggestions(searchQuery, 5)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  const handleSuggestionClick = (url: string) => {
    navigate(url);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const toggleSubMenu = (index: number) => {
    setOpenSub(openSub === index ? null : index);
  };

  return (
    <header className="w-full relative z-50">
      {/* TOP BAR */}
      <div className="bg-green-600 text-white text-sm">
        <div className="max-w-7xl mx-auto flex justify-end gap-3 px-4 py-2">
          <a
            href={`tel:${hotline}`}
            className="border border-white px-3 py-1 rounded-full hover:bg-white hover:text-green-600 transition">
            Đường dây nóng: {hotline}
          </a>
          <Link
            to="/contact"
            className="border border-white px-3 py-1 rounded-full hover:bg-white hover:text-green-600 transition">
            Đặt lịch khám
          </Link>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          {/* LOGO */}
          <Link to="/">
            <div className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt="Logo"
                width={60}
                height={60}
                className="w-[60px] h-[60px] object-cover"
              />
              <div>
                <h4 className="font-bold text-gray-800 text-sm sm:text-base uppercase">
                  {siteName}
                </h4>
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
          <div className="hidden lg:flex items-center relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="flex">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="border px-3 py-2 rounded-l-md focus:outline-none focus:border-green-600 h-10 w-52 transition"
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 rounded-r-md hover:bg-green-700 transition h-10 flex items-center justify-center cursor-pointer">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute right-0 top-full mt-1 w-[360px] bg-white shadow-xl border border-gray-100 rounded-xl z-50 overflow-hidden">
                <ul>
                  {suggestions.map((s, i) => (
                    <li key={i}>
                      <button
                        onClick={() => handleSuggestionClick(s.url)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 text-left transition cursor-pointer"
                      >
                        <Search className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{s.text}</p>
                          <p className="text-xs text-green-600">{s.type}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="border-t px-4 py-2">
                  <button
                    onClick={() => handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent)}
                    className="w-full text-center text-xs text-green-600 hover:text-green-700 font-medium cursor-pointer"
                  >
                    Xem tất cả kết quả cho "{searchQuery}"
                  </button>
                </div>
              </div>
            )}
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
      <nav className="hidden lg:block bg-white">
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
                  onClick={() => !item.children && setOpenMenu(false)}>
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
