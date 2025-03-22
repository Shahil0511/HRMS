import React, { useCallback, useEffect, useState } from "react";
import { getEmployeesByDepartment } from "../../services/employeeServices";
import ContentLoader from "react-content-loader";
import { debounce } from "lodash";

interface Employee {
    _id: string;
    firstName: string;
    lastName: string;
    gender: string;
    dob: string;
    phoneNumber: string;
    email: string;
    address: string;
    department: string;
    designation: string;
}

const EmployeeDepartment: React.FC = () => {
    // State declarations
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Constants
    const itemsPerPage = 6;

    // Fetch employees on component mount
    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getEmployeesByDepartment();
                setEmployees(data.employees);
                setFilteredEmployees(data.employees);
            } catch (error) {
                console.error("Error fetching employees:", error);
                setError("Failed to load employees. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    // Debounced search implementation
    const debouncedSearch = useCallback(
        debounce(() => {
            const filtered = employees.filter(
                (employee) =>
                    employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredEmployees(filtered);
            setCurrentPage(1);
        }, 300),
        [employees, searchQuery]
    );

    // Trigger search when query changes
    useEffect(() => {
        debouncedSearch();
        return () => debouncedSearch.cancel();
    }, [searchQuery, debouncedSearch]);

    // Navigation handler
    const handleViewEmployee = (employeeId: string) => {
        console.log("Future update", employeeId)
    };

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredEmployees.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Calculate paginated employees
    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Calculate total pages
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    // Render pagination buttons
    const renderPaginationButtons = () => {
        const buttons = [];
        const maxVisibleButtons = window.innerWidth < 640 ? 3 : 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

        if (endPage - startPage + 1 < maxVisibleButtons) {
            startPage = Math.max(1, endPage - maxVisibleButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-2 sm:px-3 py-1 rounded text-white transform transition duration-200 hover:scale-105 text-xs sm:text-sm
                        ${i === currentPage ? "bg-indigo-700" : "bg-blue-600 hover:bg-blue-700"}`}
                    aria-current={i === currentPage ? "page" : undefined}
                >
                    {i}
                </button>
            );
        }

        return buttons;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 flex flex-col">
            {/* Header Section */}
            <header className="p-3 sm:p-4 md:p-6 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Department Employees</h1>
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search employees"
                            className="border border-gray-400 bg-gray-800 text-white rounded px-3 py-2 w-full
                                focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                        />
                        {loading && searchQuery && (
                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-xs sm:text-sm">
                                Searching...
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Error message */}
            {error && (
                <div className="mx-3 sm:mx-4 md:mx-8 p-3 sm:p-4 bg-red-500 bg-opacity-70 rounded-lg text-white text-sm sm:text-base">
                    {error}
                </div>
            )}

            {/* Table Section */}
            <main className="flex-1 px-2 sm:px-4 md:px-8 pb-4 sm:pb-6">
                <div className="bg-gradient-to-b from-gray-900 via-blue-900 to-indigo-900 rounded-lg shadow-xl overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse text-white">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="border border-gray-700 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-left">#</th>
                                    <th className="border border-gray-700 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-left">Name</th>
                                    <th className="border border-gray-700 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-left">Designation</th>
                                    <th className="border border-gray-700 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    // Skeleton loading state
                                    Array.from({ length: itemsPerPage }).map((_, index) => (
                                        <tr key={index} className="bg-gray-900 bg-opacity-50">
                                            <td className="border border-gray-700 px-2 sm:px-4 py-2 sm:py-3"><SkeletonLoader /></td>
                                            <td className="border border-gray-700 px-2 sm:px-4 py-2 sm:py-3"><SkeletonLoader /></td>
                                            <td className="border border-gray-700 px-2 sm:px-4 py-2 sm:py-3"><SkeletonLoader /></td>
                                            <td className="border border-gray-700 px-2 sm:px-4 py-2 sm:py-3"><SkeletonLoader /></td>
                                        </tr>
                                    ))
                                ) : filteredEmployees.length === 0 ? (
                                    // Empty state
                                    <tr>
                                        <td colSpan={4} className="border border-gray-700 px-2 sm:px-4 py-4 sm:py-6 text-center text-gray-400 text-xs sm:text-sm">
                                            {searchQuery ? "No employees match your search" : "No employees found"}
                                        </td>
                                    </tr>
                                ) : (
                                    // Employee data
                                    paginatedEmployees.map((employee, index) => (
                                        <tr
                                            key={employee._id}
                                            className="bg-gray-900 bg-opacity-50 hover:bg-gray-800 transition duration-150"
                                        >
                                            <td className="border border-gray-700 px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="border border-gray-700 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                                {employee.firstName} {employee.lastName}
                                            </td>
                                            <td className="border border-gray-700 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                                {employee.designation}
                                            </td>
                                            <td className="border border-gray-700 px-2 sm:px-4 py-2 sm:py-3">
                                                <button
                                                    onClick={() => handleViewEmployee(employee._id)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 sm:px-3 rounded transition duration-150 text-xs sm:text-sm"
                                                    aria-label={`View ${employee.firstName} ${employee.lastName}`}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Pagination Section */}
            {!loading && filteredEmployees.length > 0 && (
                <footer className="px-2 sm:px-4 md:px-8 pb-4 sm:pb-6">
                    <nav className="flex flex-wrap justify-center items-center gap-1 sm:gap-2" aria-label="Pagination">
                        <button
                            onClick={handlePrevPage}
                            className={`px-2 sm:px-3 py-1 rounded text-white transition duration-200 hover:scale-105 text-xs sm:text-sm
                                ${currentPage === 1 ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                            disabled={currentPage === 1}
                            aria-label="Previous page"
                        >
                            Prev
                        </button>

                        {renderPaginationButtons()}

                        <button
                            onClick={handleNextPage}
                            className={`px-2 sm:px-3 py-1 rounded text-white transition duration-200 hover:scale-105 text-xs sm:text-sm
                                ${currentPage === totalPages ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                            disabled={currentPage === totalPages}
                            aria-label="Next page"
                        >
                            Next
                        </button>
                    </nav>
                </footer>
            )}
        </div>
    );
};

// Skeleton Loader Component
const SkeletonLoader: React.FC = () => (
    <ContentLoader
        speed={2}
        width="100%"
        height={20}
        viewBox="0 0 100 20"
        backgroundColor="#374151"
        foregroundColor="#4b5563"
        aria-label="Loading content"
    >
        <rect x="0" y="0" rx="3" ry="3" width="100" height="20" />
    </ContentLoader>
);

export default EmployeeDepartment;