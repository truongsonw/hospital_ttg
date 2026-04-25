export interface ServiceItem {
  title: string;
  image: string;
}

export interface FeaturedServicesData {
  subtitle?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  services: ServiceItem[];
}

interface FeaturedServicesProps {
  data: FeaturedServicesData;
}

export default function FeaturedServices({ data }: FeaturedServicesProps) {
  const { subtitle, title, description, buttonText, services } = data;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      {subtitle && <p className="text-green-600 font-semibold mb-2">{subtitle}</p>}
      {title && <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>}
      {description && <p className="text-gray-500 mb-8">{description}</p>}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {services.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition overflow-hidden group cursor-pointer"
          >
            <div className="relative w-full h-[160px] overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
              />
            </div>

            <div className="p-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 group-hover:text-green-600 transition line-clamp-2">
                {item.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Button */}
      {buttonText && (
        <div className="flex justify-center mt-10">
          <button className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition shadow-md hover:shadow-lg cursor-pointer">
            {buttonText}
          </button>
        </div>
      )}
    </section>
  );
}
