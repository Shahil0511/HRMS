import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getDepartments } from "../../services/departmentServices";
import ContentLoader from "react-content-loader";
import { debounce } from "lodash";

interface Department {
    _id: string;
    departmentName: string;
    headOfDepartment: string;
}

const Department: React.FC = () => {
    console.log("redeered")
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [, setDepartments] = useState<Department[]>([]);
    const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);

    const itemsPerPage = 6;
    const navigate = useNavigate();

    // Fetch departments from the API
    const fetchDepartments = async (search: string) => {
        setLoading(true);
        try {
            const fetchedDepartments = await getDepartments(search);
            if (fetchedDepartments && Array.isArray(fetchedDepartments.departments)) {
                setDepartments(fetchedDepartments.departments);
                setFilteredDepartments(fetchedDepartments.departments);
            } else {
                setFilteredDepartments([]);
            }
        } catch (error) {
            console.error("Failed to fetch departments:", error);
            setFilteredDepartments([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search function
    const debouncedSearch = useRef(
        debounce((query: string) => {
            fetchDepartments(query);
            setCurrentPage(1); // Reset to the first page on new search
        }, 500)
    ).current;

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    // Initial data fetch
    useEffect(() => {
        fetchDepartments("");
    }, []);

    // Handle search query changes
    useEffect(() => {
        if (searchQuery.trim() === "") {
            fetchDepartments("");
        } else {
            debouncedSearch(searchQuery);
        }
    }, [searchQuery, debouncedSearch]);

    // Pagination logic
    const paginatedDepartments = filteredDepartments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleAddDepartment = () => {
        navigate("/admin/add-department");
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 flex flex-col">
            {/* Header Section */}
            <div className="p-6 w-full max-w-full px-4 md:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <button
                        onClick={handleAddDepartment}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full sm:w-auto"
                    >
                        Add Department
                    </button>
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search departments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border border-gray-400 bg-gray-800 text-white rounded px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {loading && searchQuery && (
                            <span className="text-white text-sm">Searching...</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="flex-1 px-4 md:px-8 pb-6">
                <div className="bg-gradient-to-b from-gray-900 via-blue-900 to-indigo-900 rounded-2xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse text-white min-w-max">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="border border-gray-700 px-4 py-3 text-sm font-medium">#Id</th>
                                    <th className="border border-gray-700 px-4 py-3 text-sm font-medium">Department Name</th>
                                    <th className="border border-gray-700 px-4 py-3 text-sm font-medium hidden sm:table-cell">
                                        Head of Department
                                    </th>
                                    <th className="border border-gray-700 px-4 py-3 text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading
                                    ? Array.from({ length: itemsPerPage }).map((_, index) => (
                                        <tr key={index} className="bg-gray-900 bg-opacity-50">
                                            <td className="border border-gray-700 px-4 py-3"><SkeletonLoader /></td>
                                            <td className="border border-gray-700 px-4 py-3"><SkeletonLoader /></td>
                                            <td className="border border-gray-700 px-4 py-3 hidden sm:table-cell"><SkeletonLoader /></td>
                                            <td className="border border-gray-700 px-4 py-3"><SkeletonLoader /></td>
                                        </tr>
                                    ))
                                    : paginatedDepartments.length > 0
                                        ? paginatedDepartments.map((department, index) => (
                                            <tr key={department._id} className="bg-gray-900 bg-opacity-50">
                                                <td className="border border-gray-700 px-4 py-3 text-center">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="border border-gray-700 px-4 py-3">
                                                    {department.departmentName}
                                                </td>
                                                <td className="border border-gray-700 px-4 py-3 hidden sm:table-cell">
                                                    {department.headOfDepartment}
                                                </td>
                                                <td className="border border-gray-700 px-4 py-3">
                                                    <div className="flex flex-wrap justify-center gap-2">
                                                        <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm transform transition-transform duration-300 hover:scale-105">
                                                            View
                                                        </button>
                                                        <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm sm:inline-block hidden transform transition-transform duration-300 hover:scale-105">
                                                            Edit
                                                        </button>
                                                        <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm sm:inline-block hidden transform transition-transform duration-300 hover:scale-105">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                        : (
                                            <tr className="bg-gray-900 bg-opacity-50">
                                                <td colSpan={4} className="border border-gray-700 px-4 py-3 text-center">
                                                    No departments found
                                                </td>
                                            </tr>
                                        )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination Section */}
            {filteredDepartments.length > 0 && (
                <div className="px-4 md:px-8 pb-6">
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded text-white transform transition-transform duration-300 hover:scale-105 ${currentPage === 1 ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
                                }`}
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 rounded text-white transform transition-transform duration-300 hover:scale-105 ${page === currentPage ? "bg-indigo-700" : "bg-blue-500 hover:bg-blue-600"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded text-white transform transition-transform duration-300 hover:scale-105 ${currentPage === totalPages ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Skeleton Loader Component
const SkeletonLoader = () => (
    <ContentLoader
        speed={2}
        width="100%"
        height={20}
        viewBox="0 0 100 20"
        backgroundColor="#374151"
        foregroundColor="#4b5563"
    >
        <rect x="0" y="0" rx="3" ry="3" width="100" height="20" />
    </ContentLoader>
);

export default Department;