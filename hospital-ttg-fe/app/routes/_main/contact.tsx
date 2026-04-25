import { Link } from "react-router";
import type { Route } from "./+types/contact";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Liên hệ | Hospital TTG" },
    { name: "description", content: "Liên hệ Bệnh viện Đa khoa Thạch Thất" },
  ];
}

export default function ContactSection() {
  return (
    <section className="bg-[#f5f3ef] py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          <div>
            <p className="text-sm tracking-widest uppercase text-gray-500 mb-4">
              Liên hệ
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-tight">
              Hãy cùng{" "}
              <span className="italic text-[#c6a16e] font-serif">
                trao đổi
              </span>
            </h2>
          </div>

          <div className="flex items-center">
            <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn trong
              thời gian sớm nhất.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-300 mb-12" />

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Left - Form */}
          <form className="space-y-8">
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500">
                Họ & Tên
              </label>
              <input
                type="text"
                placeholder=""
                className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-3 text-gray-800"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500">
                Email
              </label>
              <input
                type="email"
                placeholder=""
                className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-3 text-gray-800"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500">
                Chủ đề
              </label>
              <input
                type="text"
                placeholder=""
                className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-3 text-gray-800"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500">
                Nội dung
              </label>
              <textarea
                placeholder=""
                rows={4}
                className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-3 text-gray-800 resize-none"
              />
            </div>

            <button
               // Removed type="submit" because React Router forms generally use action/method and we don't have one set up yet. Keep the class.
              className="bg-black text-white px-8 py-4 uppercase tracking-widest text-sm hover:bg-gray-800 transition-all cursor-pointer">
              Gửi tin nhắn →
            </button>
          </form>

          {/* Right - Info */}
          <div className="space-y-10">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3">
                Địa chỉ
              </h4>
              <p className="text-gray-800 leading-relaxed">
                Số 79, đường 420, xã Kim Quan, huyện Thạch Thất, TP.Hà
                Nội
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3">
                Liên lạc
              </h4>
              <p className="text-gray-800">
                024 33842217
                <br />
                Bvdktth@hanoi.gov.vn
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3">
                Giờ làm việc
              </h4>
              <p className="text-gray-800">
                Thứ Hai – Thứ Sáu
                <br />
                7:30 – 16:00
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
                Mạng xã hội
              </h4>
              <div className="flex flex-wrap gap-6 text-sm tracking-widest uppercase text-gray-600">
                <Link to="https://www.facebook.com/benhvienthachthat.vn/?ref=page_internal">Facebook</Link>
                <Link to="#">Youtube</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
