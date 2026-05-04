import { useLoaderData } from "react-router";
import type { Route } from "./+types/index";
import Carousel from "../../components/home/Carousel";
import QuickActionBar from "../../components/home/QuickActionBar";
import SpecialtySection from "../../components/home/SpecialtySection";
import FeaturedServices from "../../components/home/FeaturedServices";
import DoctorSection from "../../components/home/DoctorSection";
import { getHomePage } from "~/services/homepage.service";
import type { HomePageDto, HomePageSectionDto } from "~/types/home";
import type { ContentDto } from "~/types/article";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Trang chủ | Hospital TTG" },
    { name: "description", content: "Welcome to Hospital TTG" },
  ];
}

const emptyHomePage: HomePageDto = {
  heroSlides: [],
  quickActions: [],
  departments: [],
  featuredServicesSection: {
    subtitle: "ĐƠN VỊ",
    title: "Dịch vụ y khoa",
    description: "Chăm sóc sức khỏe toàn diện cho gia đình bạn",
    buttonText: "Xem tất cả",
    buttonUrl: "/tin-tuc?type=service",
  },
  featuredServices: [],
  featuredNewsSection: {
    subtitle: "TIN TỨC",
    title: "Tin tức nổi bật",
    description: "Cập nhật thông tin y tế và hoạt động mới nhất của bệnh viện",
    buttonText: "Xem tất cả",
    buttonUrl: "/tin-tuc",
  },
  featuredNews: [],
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

function mapSection(section: HomePageSectionDto, services: ContentDto[], emptyText: string) {
  return {
    subtitle: section.subtitle ?? undefined,
    title: section.title ?? undefined,
    description: section.description ?? undefined,
    buttonText: section.buttonText ?? undefined,
    buttonHref: section.buttonUrl ?? undefined,
    emptyText,
    services: services.map((item) => ({
      title: item.title,
      image: item.thumbnail,
      href: item.slug ? `/tin-tuc/${item.slug}` : undefined,
      excerpt: item.intro,
      date: item.publishedAt,
    })),
  };
}

export default function MainIndex() {
  const homePage = useLoaderData<typeof clientLoader>();
  const featuredServicesData = mapSection(
    homePage.featuredServicesSection,
    homePage.featuredServices,
    "Chưa có dịch vụ y khoa nổi bật.",
  );
  const featuredNewsData = mapSection(
    homePage.featuredNewsSection,
    homePage.featuredNews,
    "Chưa có tin tức nổi bật.",
  );

  return (
    <div className="home">
      <section className="relative">
        <section className="relative">
          <Carousel slides={homePage.heroSlides} />
          <QuickActionBar actions={homePage.quickActions} contact={homePage.contact} />
        </section>
        <div className="p-4">
          <SpecialtySection departments={homePage.departments} />
          <FeaturedServices data={featuredServicesData} />
          <FeaturedServices data={featuredNewsData} />
          <DoctorSection doctors={homePage.featuredDoctors} />
        </div>
      </section>
    </div>
  );
}
