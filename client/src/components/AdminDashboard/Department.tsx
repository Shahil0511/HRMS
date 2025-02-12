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
    const itemsPerPage = 7;
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
        <div className="w-full h-screen flex flex-col bg-gradient-to-r from-gray-900 to-indigo-900 text-white">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Add Department Button */}
                <button
                    onClick={handleAddDepartment}
                    className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 transition"
                >
                    Add Department
                </button>

                {/* Search Bar + Button (Properly Aligned) */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search departments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border border-gray-400  text-white rounded px-3 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                        Search
                    </button>
                </div>
            </div>


            {filteredDepartments.length > 0 ? (
                <div className="px-2">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                        <thead className="bg-gradient-to-l from-gray-900 to-indigo-900 text-white">
                            <tr>
                                <th className="border border-gray-100 px-4 py-2">#Id</th>
                                <th className="border border-gray-300 px-4 py-2">Department Name</th>
                                <th className="border border-gray-100 px-4 py-2">Head of Department</th>
                                <th className="border border-gray-100 px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedDepartments.map((department, index) => (
                                <tr
                                    key={department._id}
                                    className="bg-gradient-to-r from-gray-900 to-indigo-900 text-white"
                                >
                                    <td className="border border-gray-300 px-4 py-2">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {department.departmentName}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {department.headOfDepartment}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <div className="flex gap-2 md:gap-4">
                                            <button className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                                                View
                                            </button>
                                            <div className="hidden md:flex gap-2">
                                                <button className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">
                                                    Edit
                                                </button>
                                                <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center text-gray-300 py-4">No departments found.</div>
            )}

            {filteredDepartments.length > 0 && (
                <div className="flex justify-center mt-4 gap-2">
                    <button
                        onClick={handlePrevPage}
                        className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}`}
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
                            className={`px-3 py-1 rounded ${page === currentPage ? "bg-indigo-700 text-white" : "bg-blue-500 hover:bg-blue-600"}`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={handleNextPage}
                        className={`px-3 py-1 rounded ${currentPage === Math.ceil(filteredDepartments.length / itemsPerPage) ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}`}
                        disabled={currentPage === Math.ceil(filteredDepartments.length / itemsPerPage)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Department;