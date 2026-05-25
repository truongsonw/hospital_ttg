import { useLoaderData } from "react-router";
import type { Route } from "./+types/index";
import Carousel from "../../components/home/Carousel";
import QuickActionBar from "../../components/home/QuickActionBar";
import SpecialtySection from "../../components/home/SpecialtySection";
import FeaturedServices from "../../components/home/FeaturedServices";
import DoctorSection from "../../components/home/DoctorSection";
import { getHomePage } from "~/services/homepage.service";
import type { HomePageContentSectionDto, HomePageDto } from "~/types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Trang chủ | Hospital TTG" },
    { name: "description", content: "Welcome to Hospital TTG" },
  ];
}

const emptyHomePage: HomePageDto = {
  heroSlides: [],
  quickActions: [],
  departmentsSection: {
    subtitle: "ĐƠN VỊ",
    title: "Chuyên khoa",
    description: "Chăm sóc sức khỏe toàn diện cho gia đình bạn",
    buttonText: "Xem tất cả",
    buttonUrl: "/doi-ngu-chuyen-gia",
  },
  departments: [],
  departmentsImages: [],
  contentSections: [],
  featuredDoctorsSection: {
    subtitle: "BÁC SĨ",
    title: "Đội ngũ chuyên gia",
    description: "Hơn 1.000 bác sĩ và hơn 4.300 nhân viên y tế tận tâm phục vụ.",
    buttonText: "Tìm bác sĩ",
    buttonUrl: "/doi-ngu-chuyen-gia",
  },
  featuredDoctors: [],
  contact: {},
};

export async function clientLoader() {
  try {
    return await getHomePage();
  } catch {
    return emptyHomePage;
  }
}

export function HydrateFallback() {
  return (
    <div className="home">
      <div className="h-[200px] w-full animate-pulse bg-green-50 sm:h-[300px] md:h-[420px] lg:h-[520px]" />
      <div className="mx-auto mt-8 max-w-7xl px-6 py-12 text-center text-sm text-gray-500">
        Đang tải dữ liệu trang chủ...
      </div>
    </div>
  );
}

function mapContentSection(section: HomePageContentSectionDto) {
  return {
    subtitle: section.subtitle ?? undefined,
    title: section.title ?? undefined,
    description: section.description ?? undefined,
    buttonText: section.buttonText ?? undefined,
    buttonHref: section.buttonUrl ?? `/${section.categorySlug}`,
    emptyText: "Chưa có nội dung hiển thị.",
    services: section.contents.map((item) => ({
      title: item.title,
      image: item.thumbnail,
      href: item.slug ? `/${item.slug}.html` : undefined,
      excerpt: item.intro,
      date: item.publishedAt,
    })),
  };
}

export default function MainIndex() {
  const homePage = useLoaderData<typeof clientLoader>();

  return (
    <div className="home">
      <section className="relative">
        <section className="relative">
          <Carousel slides={homePage.heroSlides} />
          <QuickActionBar actions={homePage.quickActions} contact={homePage.contact} />
        </section>
        <div className="p-4">
          <SpecialtySection
            section={homePage.departmentsSection}
            departments={homePage.departments}
            images={homePage.departmentsImages}
          />
          {homePage.contentSections.map((s) => (
            <FeaturedServices key={s.categorySlug} data={mapContentSection(s)} />
          ))}
          <DoctorSection
            section={homePage.featuredDoctorsSection}
            doctors={homePage.featuredDoctors}
          />
        </div>
      </section>
    </div>
  );
}
