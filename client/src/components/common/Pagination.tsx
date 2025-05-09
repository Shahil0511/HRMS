

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    className?: string;
    previousLabel?: React.ReactNode;
    nextLabel?: React.ReactNode;
    maxVisiblePages?: number;
    showItemsPerPage?: boolean;
    itemsPerPageOptions?: number[];
}

export const Pagination = ({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    className = "",
    previousLabel = "Previous",
    nextLabel = "Next",
    maxVisiblePages = 5,
    showItemsPerPage = false,
    itemsPerPageOptions = [5, 10, 20, 50, 100],
}: PaginationProps) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        onPageChange(page);
    };

    const getVisiblePages = () => {
        const pages = [];
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    if (totalItems <= 0) return null;

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
            {showItemsPerPage && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Items per page:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            const newValue = Number(e.target.value);
                            if (onItemsPerPageChange) {
                                onItemsPerPageChange(newValue);
                            }
                        }}
                        className="bg-slate-900 text-white px-2 py-1 rounded border border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {itemsPerPageOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex items-center gap-1">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded text-white transition-all ${currentPage === 1
                        ? "bg-gray-700 cursor-not-allowed opacity-50"
                        : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                        }`}
                >
                    {previousLabel}
                </button>

                {getVisiblePages()[0] > 1 && (
                    <>
                        <button
                            onClick={() => handlePageChange(1)}
                            className={`px-3 py-1 rounded text-white transition-all hover:scale-105 ${1 === currentPage ? "bg-indigo-700" : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            1
                        </button>
                        {getVisiblePages()[0] > 2 && <span className="px-1 text-gray-400">...</span>}
                    </>
                )}

                {getVisiblePages().map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded text-white transition-all hover:scale-105 ${page === currentPage ? "bg-indigo-700" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {page}
                    </button>
                ))}

                {getVisiblePages()[getVisiblePages().length - 1] < totalPages && (
                    <>
                        {getVisiblePages()[getVisiblePages().length - 1] < totalPages - 1 && (
                            <span className="px-1 text-gray-400">...</span>
                        )}
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            className={`px-3 py-1 rounded text-white transition-all hover:scale-105 ${totalPages === currentPage ? "bg-indigo-700" : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded text-white transition-all ${currentPage === totalPages
                        ? "bg-gray-700 cursor-not-allowed opacity-50"
                        : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                        }`}
                >
                    {nextLabel}
                </button>
            </div>

            <div className="text-sm text-gray-300">
                {totalItems > 0 ? (
                    <>
                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-
                        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
                    </>
                ) : (
                    <>No items to display</>
                )}
            </div>
        </div>
    );
};