import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Giới thiệu | Hospital TTG" },
    { name: "description", content: "Giới thiệu về Hospital TTG" },
  ];
}

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Về chúng tôi</h1>
        <div className="prose text-gray-600">
          <p>
            Hospital TTG là bệnh viện hiện đại với đội ngũ y bác sĩ giàu kinh nghiệm, 
            trang thiết bị tiên tiến, cam kết mang lại dịch vụ y tế đẳng cấp cho người bệnh.
          </p>
        </div>
      </div>
    </div>
  );
}
