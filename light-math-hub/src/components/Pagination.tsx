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
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="pagination" role="navigation" aria-label="分页">
      <button
        className="btn btn-secondary"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        上一页
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
        下一页
      </button>
    </div>
  );
}
