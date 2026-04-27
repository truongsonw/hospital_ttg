import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, CheckCircle } from "lucide-react";
import { createBooking } from "~/services/booking.service";

interface Props {
  open: boolean;
  onClose: () => void;
}

const schema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên").max(100),
  phoneNumber: z.string().min(1, "Vui lòng nhập số điện thoại").max(20),
  dateOfBirth: z.string().min(1, "Vui lòng chọn ngày sinh"),
  appointmentDate: z.string().min(1, "Vui lòng chọn ngày khám"),
  symptoms: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function BookingModal({ open, onClose }: Props) {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    await createBooking({
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      dateOfBirth: new Date(values.dateOfBirth).toISOString(),
      appointmentDate: new Date(values.appointmentDate).toISOString(),
      symptoms: values.symptoms || null,
    });
  }

  function handleClose() {
    reset();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-8 animate-in fade-in zoom-in duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitSuccessful ? (
          /* ── Trạng thái thành công ── */
          <div className="flex flex-col items-center py-8 text-center gap-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h3 className="text-2xl font-bold text-gray-800">Đặt lịch thành công!</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Chúng tôi đã nhận được lịch hẹn của bạn và sẽ xác nhận qua điện thoại trong thời gian sớm nhất.
            </p>
            <button
              onClick={handleClose}
              className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        ) : (
          /* ── Form đặt lịch ── */
          <>
            <h3 className="text-2xl font-bold mb-2">Đặt lịch khám</h3>
            <p className="text-gray-500 text-sm mb-6">
              Điền thông tin bên dưới, chúng tôi sẽ xác nhận qua điện thoại.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Họ và tên *</label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-indigo-400 outline-none"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Số điện thoại *</label>
                  <input
                    type="tel"
                    placeholder="0912 345 678"
                    className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-indigo-400 outline-none"
                    {...register("phoneNumber")}
                  />
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600">Ngày sinh *</label>
                  <input
                    type="date"
                    max={today}
                    className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-indigo-400 outline-none"
                    {...register("dateOfBirth")}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Ngày khám *</label>
                <input
                  type="date"
                  min={today}
                  className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-indigo-400 outline-none"
                  {...register("appointmentDate")}
                />
                {errors.appointmentDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.appointmentDate.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600">Triệu chứng (không bắt buộc)</label>
                <textarea
                  placeholder="Mô tả triệu chứng..."
                  rows={3}
                  className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
                  {...register("symptoms")}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition cursor-pointer"
              >
                {isSubmitting ? "Đang gửi..." : "Đặt lịch ngay"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
