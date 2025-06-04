import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEmployees } from "../../services/employeeServices";
import { getDepartments } from "../../services/departmentServices";
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

const EmployeeDashboard: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<{ [key: string]: string }>({});
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);  // Loading state
    const itemsPerPage = 6;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true);  // Set loading to true while fetching
            try {
                const data = await getAllEmployees();

                setEmployees(data.employees);
                setFilteredEmployees(data.employees);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
            setLoading(false);  // Set loading to false after fetching
        };

        const fetchDepartments = async () => {
            try {
                const data = await getDepartments("");
                const departmentMap = data.departments.reduce(
                    (acc: { [key: string]: string }, department: { _id: string; departmentName: string }) => {
                        acc[department._id] = department.departmentName;
                        return acc;
                    },
                    {}
                );
                setDepartments(departmentMap);
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };

        fetchEmployees();
        fetchDepartments();
    }, []);

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

    // Use effect to trigger search when query changes
    useEffect(() => {
        debouncedSearch();
        return () => debouncedSearch.cancel();
    }, [searchQuery, debouncedSearch]);

    // ✅ Handle View Click
    const handleViewEmployee = (employeeId: string) => {
        navigate(`/admin/employee/${employeeId}`);
    };

    const handleAddEmployee = () => {
        navigate("/admin/add-employee");
    };

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

    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );



    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 flex flex-col">
            {/* Header Section */}
            <div className="p-6 w-full max-w-full px-4 md:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <button
                        onClick={handleAddEmployee}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full sm:w-auto"
                    >
                        Add Employee
                    </button>
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search employees..."
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
                    {/* Scrollable container */}
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse text-white min-w-max">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="border border-gray-700 px-4 py-3 text-sm font-medium">#Id</th>
                                    <th className="border border-gray-700 px-4 py-3 text-sm font-medium">Name</th>
                                    <th className="border border-gray-700 px-4 py-3 text-sm font-medium hidden sm:table-cell">Department</th>
                                    <th className="border border-gray-700 px-4 py-3 text-sm font-medium hidden sm:table-cell">Designation</th>
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
                                            <td className="border border-gray-700 px-4 py-3 hidden sm:table-cell"><SkeletonLoader /></td>
                                            <td className="border border-gray-700 px-4 py-3"><SkeletonLoader /></td>
                                        </tr>
                                    ))
                                    : paginatedEmployees.map((employee, index) => (
                                        <tr key={employee._id} className="bg-gray-900 bg-opacity-50">
                                            <td className="border border-gray-700 px-4 py-3 text-center">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="border border-gray-700 px-4 py-3">
                                                {employee.firstName} {employee.lastName}
                                            </td>
                                            <td className="border border-gray-700 px-4 py-3 hidden sm:table-cell">
                                                {departments[employee.department] || "Unknown"}
                                            </td>
                                            <td className="border border-gray-700 px-4 py-3 hidden sm:table-cell">
                                                {employee.designation}
                                            </td>
                                            <td className="border border-gray-700 px-4 py-3">
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    {/* Always visible */}
                                                    <button
                                                        onClick={() => handleViewEmployee(employee._id)}
                                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm transform transition-transform duration-300 hover:scale-105"
                                                    >
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
            {filteredEmployees.length > 0 && (
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
                            { length: Math.ceil(filteredEmployees.length / itemsPerPage) },
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
                            className={`px-3 py-1 rounded text-white transform transition-transform duration-300 hover:scale-105 ${currentPage === Math.ceil(filteredEmployees.length / itemsPerPage)
                                ? "bg-gray-500"
                                : "bg-blue-500 hover:bg-blue-600"
                                }`}
                            disabled={currentPage === Math.ceil(filteredEmployees.length / itemsPerPage)}
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

export default EmployeeDashboard;
