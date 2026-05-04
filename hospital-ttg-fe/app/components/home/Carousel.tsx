import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HomePageSlideDto } from "~/types/home";

const fallbackSlides: HomePageSlideDto[] = [
  {
    imageUrl: "/images/banner/Ngoai.png",
    altText: "Bệnh viện TTG",
    sortOrder: 1,
    isActive: true,
  },
];

interface CarouselProps {
  slides?: HomePageSlideDto[];
}

export default function Carousel({ slides: inputSlides = fallbackSlides }: CarouselProps) {
  const slides = inputSlides.length > 0 ? inputSlides : fallbackSlides;
  const isSingle = slides.length === 1;

  const [current, setCurrent] = useState(isSingle ? 0 : 1);
  const [transition, setTransition] = useState(true);

  const startX = useRef(0);
  const isDragging = useRef(false);

  const extendedSlides = isSingle
    ? slides
    : [slides[slides.length - 1], ...slides, slides[0]];

  useEffect(() => {
    setCurrent(isSingle ? 0 : 1);
    setTransition(true);
  }, [isSingle, slides.length]);

  const nextSlide = () => {
    if (isSingle) return;
    setCurrent((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (isSingle) return;
    setCurrent((prev) => prev - 1);
  };

  // ✅ Auto slide
  useEffect(() => {
    if (isSingle) return;

    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [isSingle]);

  // ✅ Loop mượt
  useEffect(() => {
    if (isSingle) return;

    if (current === extendedSlides.length - 1) {
      setTimeout(() => {
        setTransition(false);
        setCurrent(1);
      }, 700);
    }

    if (current === 0) {
      setTimeout(() => {
        setTransition(false);
        setCurrent(slides.length);
      }, 700);
    }
  }, [current, extendedSlides.length, isSingle]);

  // ✅ bật lại transition
  useEffect(() => {
    if (!transition) {
      const timer = setTimeout(() => setTransition(true), 50);
      return () => clearTimeout(timer);
    }
  }, [transition]);

  // ================= DRAG / SWIPE =================

  const handleStart = (clientX: number) => {
    if (isSingle) return;
    isDragging.current = true;
    startX.current = clientX;
  };

  const handleEnd = (clientX: number) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const diff = clientX - startX.current;
    const threshold = 80; // khoảng kéo để chuyển slide

    if (diff > threshold) {
      prevSlide();
    } else if (diff < -threshold) {
      nextSlide();
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className={`flex ${transition ? "transition-transform duration-700 ease-in-out" : ""}`}
        style={{ transform: `translateX(-${current * 100}%)` }}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseUp={(e) => handleEnd(e.clientX)}
        onMouseLeave={(e) => handleEnd(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX)}>
        {extendedSlides.map((slide, index) => (
          <div
            key={index}
            className="relative w-full flex-shrink-0 select-none
              h-[200px] sm:h-[300px] md:h-[420px] lg:h-[520px] xl:h-[620px]">
            <img
              src={slide.imageUrl}
              alt={slide.altText || slide.title || `Slide ${index + 1}`}
              className="object-cover w-full h-full pointer-events-none"
            />
          </div>
        ))}
      </div>

      {/* Buttons */}
      {!isSingle && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 cursor-pointer left-3 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition">
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute top-1/2 cursor-pointer right-3 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition">
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
}
