import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle } from "lucide-react";
import type { Route } from "./+types/contact";
import { createContact } from "~/services/contact.service";
import { useSiteSettings } from "~/context/site-settings.context";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Liên hệ | Hospital TTG" },
    { name: "description", content: "Liên hệ Bệnh viện Đa khoa Thạch Thất" },
  ];
}

const schema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên").max(100),
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ").max(100),
  subject: z.string().min(1, "Vui lòng nhập chủ đề").max(200),
  content: z.string().min(1, "Vui lòng nhập nội dung").max(2000),
});

type FormValues = z.infer<typeof schema>;

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const s = useSiteSettings();

  const address = s["address"] || "";
  const phone = s["phone"] || "";
  const email = s["email"] || "";
  const workingHours = s["working_hours"] || "";
  const facebook = s["facebook"] || "";
  const youtube = s["youtube"] || "";
  const zalo = s["zalo"] || "";
  const tiktok = s["tiktok"] || "";

  const hasSocial = facebook || youtube || zalo || tiktok;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    await createContact(values);
    setSubmitted(true);
    reset();
  }

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
              <span className="italic text-[#c6a16e] font-serif">trao đổi</span>
            </h2>
          </div>
          <div className="flex items-center">
            <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn trong thời gian sớm nhất.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-300 mb-12" />

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Left — Form */}
          {submitted ? (
            <div className="flex flex-col items-start gap-6 py-8">
              <CheckCircle className="w-14 h-14 text-green-600" />
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Gửi tin nhắn thành công!
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                </p>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm uppercase tracking-widest underline underline-offset-4 text-gray-600 hover:text-black transition cursor-pointer"
              >
                Gửi tin nhắn khác →
              </button>
            </div>
          ) : (
            <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-500">
                  Họ &amp; Tên *
                </label>
                <input
                  type="text"
                  className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-3 text-gray-800"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-gray-500">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-3 text-gray-800"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-gray-500">
                  Chủ đề *
                </label>
                <input
                  type="text"
                  className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-3 text-gray-800"
                  {...register("subject")}
                />
                {errors.subject && (
                  <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-gray-500">
                  Nội dung *
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-3 text-gray-800 resize-none"
                  {...register("content")}
                />
                {errors.content && (
                  <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-black text-white px-8 py-4 uppercase tracking-widest text-sm hover:bg-gray-800 disabled:opacity-60 transition-all cursor-pointer"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi tin nhắn →"}
              </button>
            </form>
          )}

          {/* Right — Info */}
          <div className="space-y-10">
            {address && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Địa chỉ</h4>
                <p className="text-gray-800 leading-relaxed">{address}</p>
              </div>
            )}

            {(phone || email) && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Liên lạc</h4>
                <p className="text-gray-800 space-y-1">
                  {phone && (
                    <a href={`tel:${phone}`} className="block hover:text-green-600 transition">
                      {phone}
                    </a>
                  )}
                  {email && (
                    <a href={`mailto:${email}`} className="block hover:text-green-600 transition">
                      {email}
                    </a>
                  )}
                </p>
              </div>
            )}

            {workingHours && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Giờ làm việc</h4>
                <p className="text-gray-800 whitespace-pre-line">{workingHours}</p>
              </div>
            )}

            {hasSocial && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Mạng xã hội</h4>
                <div className="flex flex-wrap gap-6 text-sm tracking-widest uppercase text-gray-600">
                  {facebook && (
                    <Link to={facebook} target="_blank" rel="noopener noreferrer"
                      className="hover:text-green-600 transition">
                      Facebook
                    </Link>
                  )}
                  {youtube && (
                    <Link to={youtube} target="_blank" rel="noopener noreferrer"
                      className="hover:text-green-600 transition">
                      Youtube
                    </Link>
                  )}
                  {zalo && (
                    <Link to={zalo} target="_blank" rel="noopener noreferrer"
                      className="hover:text-green-600 transition">
                      Zalo
                    </Link>
                  )}
                  {tiktok && (
                    <Link to={tiktok} target="_blank" rel="noopener noreferrer"
                      className="hover:text-green-600 transition">
                      TikTok
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
