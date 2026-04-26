import { useI18n } from "../i18n/I18nProvider";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  onPageChange
}: PaginationProps) {
  const { catalog } = useI18n();
  const paginationText = catalog.pagination;

  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="pagination" role="navigation" aria-label={paginationText.ariaLabel}>
      <button
        className="btn btn-secondary"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        {paginationText.previous}
      </button>
      <div className="pagination__pages">
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            className={
              pageNumber === page
                ? "btn btn-primary btn-small"
                : "btn btn-secondary btn-small"
            }
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
      </div>
      <button
        className="btn btn-secondary"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        {paginationText.next}
      </button>
    </div>
  );
}
