import { ReactNode, useEffect } from "react";
import { Pagination } from "./Pagination";

interface TableColumn<T> {
    header: string;
    accessor: keyof T | ((item: T) => ReactNode);
    className?: string;
    hideOnMobile?: boolean;
}

interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    loading?: boolean;
    error?: string;
    emptyMessage?: string;
    className?: string;
    rowClassName?: string;
    headerClassName?: string;
    // Pagination props
    pagination?: boolean;
    currentPage?: number;
    totalItems?: number;
    itemsPerPage?: number;
    onPageChange?: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    paginationClassName?: string;
    showItemsPerPage?: boolean;
    itemsPerPageOptions?: number[];
}

export const Table = <T,>({
    data,
    columns,
    loading = false,
    error,
    emptyMessage = "No data found",
    className = "",
    rowClassName = "border-t border-gray-700 hover:bg-blue-950 transition",
    headerClassName = "bg-blue-950 text-sm md:text-base",
    // Pagination props
    pagination = false,
    currentPage = 1,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange = () => { },
    onItemsPerPageChange = () => { },
    paginationClassName = "",
    showItemsPerPage = false,
    itemsPerPageOptions = [5, 10, 20, 50, 100],
}: TableProps<T>) => {
    // Update when itemsPerPage prop changes
    useEffect(() => {
        // Nothing needed here - we'll use the prop directly
    }, [itemsPerPage]);

    if (loading) {
        return <p className="text-center text-white">Loading data...</p>;
    }

    if (error) {
        return <p className="text-center text-red-400">{error}</p>;
    }

    // Use the actual total items count (from the parent component)
    const effectiveTotalItems = totalItems || data.length;

    return (
        <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 text-white lg:px-6 md:px-6 sm:px-1 py-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className={`w-full table-auto border-collapse ${className}`}>
                        <thead>
                            <tr className={headerClassName}>
                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        className={`px-3 py-2 text-left whitespace-nowrap ${column.className || ""} ${column.hideOnMobile ? "hidden sm:table-cell" : ""
                                            }`}
                                    >
                                        {column.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, rowIndex) => (
                                    <tr key={rowIndex} className={rowClassName}>
                                        {columns.map((column, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`px-2 py-3 text-sm md:text-base ${column.hideOnMobile ? "hidden sm:table-cell" : ""
                                                    } ${column.className || ""}`}
                                            >
                                                {typeof column.accessor === "function"
                                                    ? column.accessor(item)
                                                    : (item[column.accessor] as ReactNode)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-4 text-gray-300">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {pagination && effectiveTotalItems > (itemsPerPageOptions[0] || 10) && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={effectiveTotalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                    onItemsPerPageChange={onItemsPerPageChange}
                    className={paginationClassName}
                    showItemsPerPage={showItemsPerPage}
                    itemsPerPageOptions={itemsPerPageOptions}
                />
            )}
        </div>
    );
};