export default function Pagination({ page, pages, onPage }) {
  const prevDisabled = page <= 1;
  const nextDisabled = page >= pages;

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        className={`btn btn-outline btn-sm ${prevDisabled ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => onPage(page - 1)}
      >
        Попередня
      </button>
      <span className="text-sm text-gray-600">
        Сторінка {page} з {pages || 1}
      </span>
      <button
        className={`btn btn-outline btn-sm ${nextDisabled ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => onPage(page + 1)}
      >
        Наступна
      </button>
    </div>
  );
}
