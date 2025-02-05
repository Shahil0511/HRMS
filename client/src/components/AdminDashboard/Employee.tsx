import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEmployees } from "../../services/employeeServices";
import { getDepartments } from "../../services/departmentServices";

interface Employee {
    id: number;
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
    const [departments, setDepartments] = useState<{ [key: string]: string }>({}); // A map of department IDs to names
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    // Fetch Employees and Departments
    const fetchDepartments = async (searchQuery: string) => {
        try {
            const data = await getDepartments(searchQuery);
            const departmentMap = data.departments.reduce((acc: { [key: string]: string }, department: { _id: string; departmentName: string }) => {
                acc[department._id] = department.departmentName;
                return acc;
            }, {});
            setDepartments(departmentMap);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await getAllEmployees(); // Assuming this fetches employees
                setEmployees(data.employees);
                setFilteredEmployees(data.employees);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };

        fetchEmployees();
        fetchDepartments(""); // Pass empty string initially to fetch all departments
    }, []);

    const handleSearch = () => {
        const filtered = employees.filter((employee) =>
            employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredEmployees(filtered);
        setCurrentPage(1);

        // Fetch departments based on search query as well
        fetchDepartments(searchQuery);
    };

    const handleAddEmployee = () => {
        navigate("/admin/add-employee");
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="p-8 bg-gradient-to-r from-gray-900 to-indigo-900 text-white shadow-lg">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <button
                    onClick={handleAddEmployee}
                    className="bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600"
                >
                    Add Employee
                </button>
                <div className="flex gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full md:w-auto"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Employees Table */}
            {filteredEmployees.length > 0 ? (
                <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm">
                    <thead className="bg-gradient-to-l from-gray-900 to-indigo-900 text-white">
                        <tr>
                            <th className="border border-gray-100 px-4 py-2">#Id</th>
                            <th className="border border-gray-300 px-4 py-2">Name</th>
                            <th className="border border-gray-100 px-4 py-2">Department</th>
                            <th className="border border-gray-300 px-4 py-2">Designation</th>
                            <th className="border border-gray-100 px-4 py-2">Attendance</th>
                            <th className="border border-gray-300 px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedEmployees.map((employee, index) => (
                            <tr key={`${employee.id}-${employee.firstName}-${employee.lastName}`} className="bg-gradient-to-r from-gray-900 to-indigo-900 text-white">
                                <td className="border border-gray-300 px-4 py-2">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">{employee.firstName} {employee.lastName}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {departments[employee.department] || 'Unknown'}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">{employee.designation}</td>
                                <td className="border border-gray-300 px-4 py-2">Present</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <button className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 mr-2">View</button>
                                    <button className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2">Edit</button>
                                    <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="text-center text-gray-300 py-4">No employees found.</div>
            )}

            {/* Pagination */}
            {filteredEmployees.length > 0 && (
                <div className="flex justify-center mt-4 gap-2">
                    {Array.from({ length: Math.ceil(filteredEmployees.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded ${page === currentPage
                                ? "bg-indigo-700 text-white"
                                : "bg-blue-500 hover:bg-blue-600"
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmployeeDashboard;
