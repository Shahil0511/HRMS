import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployeesByDepartment } from "../../services/employeeServices";
import { getDepartments } from "../../services/departmentServices";
import ContentLoader from "react-content-loader";
import { debounce } from "lodash";

interface Employee {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    designation: string;
    department: {
        _id: string;
        departmentName: string;
    };
}

const EmployeeM: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<{ [key: string]: string }>({});
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [departmentName, setDepartmentName] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const itemsPerPage = 6;
    const navigate = useNavigate();

    // Memoized filtered employees
    const filteredEmployees = useMemo(() => {
        if (!searchQuery) return employees;
        const query = searchQuery.toLowerCase();

        return employees.filter((employee) => {
            const departmentName = departments?.[employee?.department?._id]?.toLowerCase() || "";

            return (
                employee.firstName.toLowerCase().includes(query) ||
                employee.lastName.toLowerCase().includes(query) ||
                employee.email.toLowerCase().includes(query) ||
                employee.designation.toLowerCase().includes(query) ||
                departmentName.includes(query)
            );
        });
    }, [employees, searchQuery, departments]);


    // Memoized paginated employees
    const paginatedEmployees = useMemo(() => {
        return filteredEmployees.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredEmployees, currentPage, itemsPerPage]);

    // Total pages calculation
    const totalPages = useMemo(() => {
        return Math.ceil(filteredEmployees.length / itemsPerPage);
    }, [filteredEmployees.length, itemsPerPage]);

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [employeesData, departmentsData] = await Promise.all([
                    getEmployeesByDepartment(),
                    getDepartments("")
                ]);

                setEmployees(employeesData.employees);
                setDepartmentName(employeesData.departmentName);

                const departmentMap = departmentsData.departments.reduce(
                    (acc: { [key: string]: string }, department: { _id: string; departmentName: string }) => {
                        acc[department._id] = department.departmentName;
                        return acc;
                    },
                    {}
                );
                setDepartments(departmentMap);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load employee data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Debounced search
    const debouncedSearch = useCallback(
        debounce(() => {
            setCurrentPage(1); // Reset to first page on search
        }, 300),
        []
    );

    useEffect(() => {
        debouncedSearch();
        return () => debouncedSearch.cancel();
    }, [searchQuery, debouncedSearch]);

    const handleViewEmployee = (employeeId: string) => {
        navigate(`/manager/employee/${employeeId}`);
    };

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

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 flex flex-col">
            {/* Header Section */}
            <div className="p-6 w-full max-w-full px-4 md:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h1 className="text-white text-2xl font-bold">
                        {departmentName ? `${departmentName} Department` : "Employee Management"}
                    </h1>
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
                {error && (
                    <div className="bg-red-500 text-white p-3 rounded mb-4">
                        {error}
                    </div>
                )}
            </div>

            {/* Table Section */}
            <div className="flex-1 px-4 md:px-8 pb-6">
                <div className="bg-gradient-to-b from-gray-900 via-blue-900 to-indigo-900 rounded-2xl shadow-xl overflow-hidden">
                    {/* Scrollable container */}
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse text-white min-w-max">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="border border-gray-700 px-4 py-3 text-sm font-medium">#</th>
                                    <th className="border border-gray-700 px-4 py-3 text-sm font-medium text-left">Employee Details</th>
                                    <th className="border border-gray-700 px-4 py-3 text-sm font-medium hidden md:table-cell">Department</th>
                                    <th className="border border-gray-700 px-4 py-3 text-sm font-medium hidden sm:table-cell">Designation</th>
                                    <th className="border border-gray-700 px-4 py-3 text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: itemsPerPage }).map((_, index) => (
                                        <tr key={index} className="bg-gray-900 bg-opacity-50">
                                            <td className="border border-gray-700 px-4 py-3"><SkeletonLoader /></td>
                                            <td className="border border-gray-700 px-4 py-3"><SkeletonLoader /></td>
                                            <td className="border border-gray-700 px-4 py-3 hidden md:table-cell"><SkeletonLoader /></td>
                                            <td className="border border-gray-700 px-4 py-3 hidden sm:table-cell"><SkeletonLoader /></td>
                                            <td className="border border-gray-700 px-4 py-3"><SkeletonLoader /></td>
                                        </tr>
                                    ))
                                ) : filteredEmployees.length === 0 ? (
                                    <tr className="bg-gray-900 bg-opacity-50">
                                        <td colSpan={5} className="border border-gray-700 px-4 py-6 text-center text-gray-300">
                                            {searchQuery ? "No employees match your search." : "No employees found."}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedEmployees.map((employee, index) => (
                                        <tr key={employee._id} className="bg-gray-900 bg-opacity-50 hover:bg-gray-800 transition-colors duration-200">
                                            <td className="border border-gray-700 px-4 py-3 text-center">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="border border-gray-700 px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {employee.firstName} {employee.lastName}
                                                    </span>
                                                    <span className="text-xs text-gray-300">{employee.email}</span>
                                                </div>
                                            </td>
                                            <td className="border border-gray-700 px-4 py-3 hidden md:table-cell">
                                                {departments[employee.department._id] || "Unknown"}
                                            </td>
                                            <td className="border border-gray-700 px-4 py-3 hidden sm:table-cell">
                                                {employee.designation}
                                            </td>
                                            <td className="border border-gray-700 px-4 py-3">
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    <button
                                                        onClick={() => handleViewEmployee(employee._id)}
                                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm transform transition-transform duration-300 hover:scale-105"
                                                        title="View employee details"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm hidden sm:inline-block transform transition-transform duration-300 hover:scale-105"
                                                        title="Edit employee"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm hidden sm:inline-block transform transition-transform duration-300 hover:scale-105"
                                                        title="Delete employee"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination Section */}
            {filteredEmployees.length > 0 && (
                <div className="px-4 md:px-8 pb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="text-white text-sm">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                            {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of{" "}
                            {filteredEmployees.length} employees
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded text-white transform transition-transform duration-300 hover:scale-105 ${currentPage === 1 ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
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
                                className={`px-3 py-1 rounded text-white transform transition-transform duration-300 hover:scale-105 ${currentPage === totalPages ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                                    }`}
                            >
                                Next
                            </button>
                        </div>
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

export default EmployeeM;