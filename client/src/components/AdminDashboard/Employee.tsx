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
    const [departments, setDepartments] = useState<{ [key: string]: string }>({});
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 7;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await getAllEmployees();
                setEmployees(data.employees);
                setFilteredEmployees(data.employees);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };

        const fetchDepartments = async (searchQuery: string) => {
            try {
                const data = await getDepartments(searchQuery);
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
        fetchDepartments("");
    }, []);

    const handleSearch = () => {
        const filtered = employees.filter(
            (employee) =>
                employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                employee.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredEmployees(filtered);
        setCurrentPage(1);
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

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    return (
        <div className="w-full min-h-screen h-screen bg-gradient-to-r from-indigo-900 to-blue-900 text-white">
            <div className="w-full p-8">
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

                {filteredEmployees.length > 0 ? (
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                        <thead className="bg-gradient-to-l from-indigo-800 to-blue-800 text-white">
                            <tr>
                                <th className="border border-gray-100 px-4 py-2">#Id</th>
                                <th className="border border-gray-300 px-4 py-2">Name</th>
                                <th className="border border-gray-100 px-4 py-2">Department</th>
                                <th className="hidden md:table-cell border border-gray-300 px-4 py-2">
                                    Designation
                                </th>
                                <th className="hidden md:table-cell border border-gray-100 px-4 py-2">
                                    Attendance
                                </th>
                                <th className="border border-gray-300 px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedEmployees.map((employee, index) => (
                                <tr
                                    key={`${employee.id || (currentPage - 1) * itemsPerPage + index}`}
                                    className="bg-gradient-to-r from-gray-900 to-indigo-900 text-white"
                                >
                                    <td className="border border-gray-300 px-4 py-2">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {employee.firstName} {employee.lastName}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {departments[employee.department] || "Unknown"}
                                    </td>
                                    <td className="hidden md:table-cell border border-gray-300 px-4 py-2">
                                        {employee.designation}
                                    </td>
                                    <td className="hidden md:table-cell border border-gray-300 px-4 py-2">
                                        Present
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
                ) : (
                    <div className="text-center text-gray-300 py-4">No employees found.</div>
                )}

                {filteredEmployees.length > 0 && (
                    <div className="flex justify-center mt-4 gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDashboard;
