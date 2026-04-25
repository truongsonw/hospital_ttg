interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null;

  const generatePages = () => {
    const pages: (number | string)[] = [];

    const maxVisible = 5; // số page number hiển thị

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const left = Math.max(currentPage - 1, 2);
      const right = Math.min(currentPage + 1, totalPages - 1);

      if (left > 2) {
        pages.push("...");
      }

      for (let i = left; i <= right; i++) {
        pages.push(i);
      }

      if (right < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePages();

  return (
    <div className="flex justify-center mt-12 gap-2 flex-wrap items-center">

      {/* << First */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-green-500 hover:text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
      >
        {"<<"}
      </button>

      {/* < Prev */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-green-500 hover:text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
      >
        {"<"}
      </button>

      {/* Page Numbers */}
      {pages.map((page, index) =>
        page === "..." ? (
          <span key={index} className="px-3 py-2">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer
              ${
                currentPage === page
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-200 hover:bg-green-500 hover:text-white"
              }`}
          >
            {page}
          </button>
        )
      )}

      {/* > Next */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-green-500 hover:text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
      >
        {">"}
      </button>

      {/* >> Last */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
        className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-green-500 hover:text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
      >
        {">>"}
      </button>
    </div>
  );
}
