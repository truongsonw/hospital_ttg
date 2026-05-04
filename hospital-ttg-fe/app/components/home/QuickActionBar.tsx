import React, { useState } from "react";
import BookingModal from "./BookingModal";
import { Phone, Calendar, ClipboardList } from "lucide-react";
import type { HomePageContactDto, HomePageQuickActionDto } from "~/types/home";

interface ActionItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  isBooking?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  phone: <Phone className="w-6 h-6" />,
  calendar: <Calendar className="w-6 h-6" />,
  "clipboard-list": <ClipboardList className="w-6 h-6" />,
};

interface QuickActionBarProps {
  actions?: HomePageQuickActionDto[];
  contact?: HomePageContactDto;
}

function normalizeActions(
  actions: HomePageQuickActionDto[] | undefined,
  contact: HomePageContactDto | undefined,
): ActionItem[] {
  const normalized = (actions ?? [])
    .filter((action) => action.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((action) => ({
      icon: iconMap[action.icon ?? ""] ?? <ClipboardList className="w-6 h-6" />,
      title: action.title,
      description: action.description ?? "",
      href: action.url ?? undefined,
      isBooking: action.kind === "booking",
    }));

  if (normalized.length > 0) return normalized;

  const hotline = contact?.hotline || "1900.888.866";
  const tel = hotline.replace(/\D/g, "");
  return [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Gọi tổng đài",
      description: `Đặt lịch khám nhanh qua tổng đài ${hotline}`,
      href: tel ? `tel:${tel}` : undefined,
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Đặt lịch khám",
      description: "Đặt lịch khám online tại website",
      isBooking: true,
    },
    {
      icon: <ClipboardList className="w-6 h-6" />,
      title: "Kết quả xét nghiệm",
      description: "Tra cứu kết quả xét nghiệm của bạn",
      href: "#ket-qua-xet-nghiem",
    },
  ];
}

const QuickActionBar = ({ actions: inputActions, contact }: QuickActionBarProps) => {
  const [open, setOpen] = useState(false);
  const actions = normalizeActions(inputActions, contact);

  return (
    <>
      <div className="w-fit mx-auto -mt-12 sm:-mt-16 relative z-20 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-4 sm:p-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {actions.map((action, i) =>
              action.isBooking ? (
                <button
                  key={i}
                  onClick={() => setOpen(true)}
                  className="group flex items-center gap-4 p-5 rounded-2xl bg-white hover:bg-green-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <span className="text-green-600 group-hover:text-green-700 transition-transform duration-300 group-hover:scale-110">
                    {action.icon}
                  </span>
                  <div className="text-left">
                    <p className="text-base font-semibold text-gray-800 group-hover:text-green-700">
                      {action.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {action.description}
                    </p>
                  </div>
                </button>
              ) : (
                <a
                  key={i}
                  href={action.href ?? "#"}
                  className="group flex items-center gap-4 p-5 rounded-2xl bg-white hover:bg-green-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <span className="text-green-600 group-hover:text-green-700 transition-transform duration-300 group-hover:scale-110">
                    {action.icon}
                  </span>
                  <div>
                    <p className="text-base font-semibold text-gray-800 group-hover:text-green-700">
                      {action.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {action.description}
                    </p>
                  </div>
                </a>
              ),
            )}
          </div>
        </div>
      </div>

      <BookingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default QuickActionBar;
