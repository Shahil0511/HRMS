import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEmployees } from "../../services/employeeServices";
import { getDepartments } from "../../services/departmentServices";

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

    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    return (
        <div className="min-h-screen bg-gradient-to-r from-indigo-900 to-blue-900 text-white p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <button onClick={handleAddEmployee} className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">
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
                    <button onClick={handleSearch} className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">
                        Search
                    </button>
                </div>
            </div>

            {filteredEmployees.length > 0 ? (
                <>
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="border border-gray-100 px-4 py-2">#Id</th>
                                <th className="border border-gray-300 px-4 py-2">Name</th>
                                <th className="border border-gray-100 px-4 py-2">Department</th>
                                <th className="hidden md:table-cell border border-gray-300 px-4 py-2">Designation</th>
                                <th className="border border-gray-300 px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedEmployees.map((employee, index) => (
                                <tr key={employee._id || `emp-${index}`} className="bg-gray-900 bg-opacity-50">
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
                                    <td className="border border-gray-300 px-4 py-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewEmployee(employee._id)}
                                                className="bg-green-500 px-2 py-1 rounded hover:bg-green-600"
                                            >
                                                View
                                            </button>
                                            <button className="hidden md:block bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600">
                                                Edit
                                            </button>
                                            <button className="hidden md:block bg-red-500 px-2 py-1 rounded hover:bg-red-600">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-center mt-4 gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center text-gray-300 py-4">No employees found.</div>
            )}
        </div>
    );
};

export default EmployeeDashboard;
