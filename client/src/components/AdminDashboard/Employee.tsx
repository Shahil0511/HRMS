import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    const [employees, setEmployees] = useState<Employee[]>([/* Sample data */]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;
    const navigate = useNavigate()

    const handleSearch = () => {
        const filtered = employees.filter((employee) =>
            employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredEmployees(filtered);
        setCurrentPage(1);
    };

    const handleAddEmployee = () => {
        navigate("/admin/employee/add-employee")
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="p-6 bg-gradient-to-r from-gray-900 to-indigo-900 text-white shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <button
                    onClick={handleAddEmployee}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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

            <table className="w-full border-collapse border border-gray-300 text-sm">
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
                        <tr key={employee.id} className="odd:bg-white even:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">{employee.firstName} {employee.lastName}</td>
                            <td className="border border-gray-300 px-4 py-2">{employee.department}</td>
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

            <div className="flex justify-center mt-4 gap-2">
                {Array.from({ length: Math.ceil(filteredEmployees.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded ${page === currentPage
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                            }`}
                    >
                        {page}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EmployeeDashboard;