import type { Route } from "./+types/index";
import Carousel from "../../components/home/Carousel";
import QuickActionBar from "../../components/home/QuickActionBar";
import SpecialtySection from "../../components/home/SpecialtySection";
import FeaturedServices from "../../components/home/FeaturedServices";
import DoctorSection from "../../components/home/DoctorSection";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Trang chủ | Hospital TTG" },
    { name: "description", content: "Welcome to Hospital TTG" },
  ];
}

export default function MainIndex() {
  const featuredServicesData = {
    subtitle: "ĐƠN VỊ",
    title: "Dịch vụ y khoa",
    description: "Chăm sóc sức khỏe toàn diện cho gia đình bạn",
    buttonText: "Xem tất cả",
    services: [
      {
        title: "Dịch vụ tư vấn tâm lý",
        image: "/images/doctor/doctor5.jpg",
      },
      {
        title: "Chụp X-Quang",
        image: "/images/doctor/doctor6.jpg",
      },
    ],
  };

  const featuredNewsData = {
    subtitle: "TIN TỨC",
    title: "Tin tức nổi bật",
    description:
      "Cập nhật thông tin y tế và hoạt động mới nhất của bệnh viện",
    buttonText: "Xem tất cả",
    services: [
      {
        title:
          "Bệnh viện triển khai kỹ thuật mới trong điều trị tim mạch",
        slug: "ky-thuat-moi-dieu-tri-tim-mach",
        image: "/images/doctor/doctor3.jpg",
        excerpt:
          "Kỹ thuật can thiệp tim mạch hiện đại giúp nâng cao hiệu quả điều trị và rút ngắn thời gian hồi phục cho bệnh nhân.",
        date: "2026-02-10",
        category: "Y tế",
      },
      {
        title: "Khám sức khỏe tổng quát định kỳ – Vì sao cần thiết?",
        slug: "kham-suc-khoe-tong-quat",
        image: "/images/doctor/doctor3.jpg",
        excerpt:
          "Khám sức khỏe định kỳ giúp phát hiện sớm bệnh lý và bảo vệ sức khỏe lâu dài cho bạn và gia đình.",
        date: "2026-02-08",
        category: "Sức khỏe",
      },
      {
        title: "Ứng dụng công nghệ AI trong chẩn đoán hình ảnh",
        slug: "ai-trong-chan-doan-hinh-anh",
        image: "/images/doctor/doctor3.jpg",
        excerpt:
          "Công nghệ AI đang được bệnh viện ứng dụng nhằm nâng cao độ chính xác trong chẩn đoán bệnh.",
        date: "2026-02-06",
        category: "Công nghệ",
      },
      {
        title: "Chương trình khám miễn phí cho người cao tuổi",
        slug: "kham-mien-phi-nguoi-cao-tuoi",
        image: "/images/doctor/doctor3.jpg",
        excerpt:
          "Bệnh viện tổ chức chương trình khám sức khỏe miễn phí dành cho người cao tuổi trên địa bàn.",
        date: "2026-02-05",
        category: "Hoạt động",
      },
    ],
  };

  return (
    <div className="home">
      <section className="relative">
        <section className="relative">
          <Carousel />
          <QuickActionBar />
        </section>
        <div className="p-4">
          <SpecialtySection />
          <FeaturedServices data={featuredServicesData} />
          <FeaturedServices data={featuredNewsData} />
          <DoctorSection />
        </div>
      </section>
    </div>
  );
}

