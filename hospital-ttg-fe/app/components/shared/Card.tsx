import { Link } from "react-router";
import type { NewsItem } from "../../types/news";

interface Props {
  item: NewsItem;
}

export default function Card({ item }: Props) {
  return (
    <Link to={`/detail/1`} className="group block">
      <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition duration-300">

        {/* Image */}
        <div className="relative h-72 w-full">
          <img
            src={item.image}
            alt={item.title}
            className="object-cover w-full h-full group-hover:scale-110 transition duration-700"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-green-700/90 via-green-600/40 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 p-6 text-white">
          <h3 className="text-lg font-semibold leading-snug line-clamp-2">
            {item.title}
          </h3>
          <p className="text-sm mt-3 opacity-90">{item.date}</p>
        </div>
      </div>
    </Link>
  );
}
