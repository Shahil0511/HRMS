import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDepartments } from "../../services/departmentServices";

interface Department {
    _id: string;
    departmentName: string;
    headOfDepartment: string;
}

const Department: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [, setDepartments] = useState<Department[]>([]);
    const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6;
    const navigate = useNavigate();

    const fetchDepartments = async (search: string) => {
        try {
            const fetchedDepartments = await getDepartments(search);
            if (fetchedDepartments && Array.isArray(fetchedDepartments.departments)) {
                setDepartments(fetchedDepartments.departments);
                setFilteredDepartments(fetchedDepartments.departments);
            } else {
                setFilteredDepartments([]);
            }
        } catch (error) {
            setFilteredDepartments([]);
        }
    };

    useEffect(() => {
        fetchDepartments("");
    }, []);

    const handleSearch = () => {
        fetchDepartments(searchQuery);
        setCurrentPage(1);
    };

    const handleAddDepartment = () => {
        navigate("/admin/add-department");
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredDepartments.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const paginatedDepartments = filteredDepartments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                        <button
                            onClick={handleSearch}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full sm:w-auto"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Section */}

            {/* Table Section */}
            <div className="flex-1 px-4 md:px-8 pb-6">
                <div className="bg-gradient-to-b from-gray-900 via-blue-900 to-indigo-900 rounded-2xl shadow-xl overflow-hidden">
                    {/* Scrollable container */}
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
                                {paginatedDepartments.map((department, index) => (
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
                                                {/* Always visible */}
                                                <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm transform transition-transform duration-300 hover:scale-105">
                                                    View
                                                </button>
                                                {/* Edit & Delete buttons only visible on large screens */}
                                                <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm sm:inline-block hidden transform transition-transform duration-300 hover:scale-105">
                                                    Edit
                                                </button>
                                                <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm sm:inline-block hidden transform transition-transform duration-300 hover:scale-105">
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
                            className={`px-3 py-1 rounded text-white transform transition-transform duration-300 hover:scale-105 ${currentPage === 1 ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
                                }`}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {Array.from(
                            { length: Math.ceil(filteredDepartments.length / itemsPerPage) },
                            (_, i) => i + 1
                        ).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 rounded text-white transform transition-transform duration-300 hover:scale-105 ${page === currentPage
                                    ? "bg-indigo-700"
                                    : "bg-blue-500 hover:bg-blue-600"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={handleNextPage}
                            className={`px-3 py-1 rounded text-white transform transition-transform duration-300 hover:scale-105 ${currentPage === Math.ceil(filteredDepartments.length / itemsPerPage)
                                ? "bg-gray-500"
                                : "bg-blue-500 hover:bg-blue-600"
                                }`}
                            disabled={
                                currentPage === Math.ceil(filteredDepartments.length / itemsPerPage)
                            }
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Department;