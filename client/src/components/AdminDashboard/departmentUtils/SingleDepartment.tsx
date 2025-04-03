import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserTie, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUsers, FaFileAlt, FaMoneyBillWave, FaIdBadge } from "react-icons/fa";
import { format } from "date-fns";
import ContentLoader from "react-content-loader";
import { getDepartmentDetails } from "../../../services/departmentServices";

interface Employee {
    _id: string;
    firstName: string;
    lastName: string;
    gender: string;
    dob: Date;
    phoneNumber: string;
    email: string;
    address: string;
    designation: string;
    createdAt: Date;
    updatedAt: Date;
    workReports: string[];
    payroll: string[];
}

interface Department {
    _id: string;
    departmentName: string;
    description: string;
    headOfDepartment: string;
    createdAt: Date;
    updatedAt: Date;
}

const SingleDepartment = () => {
    const { id } = useParams<{ id: string }>();
    const [department, setDepartment] = useState<Department | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchDepartment(id);
        }
    }, [id]);

    const fetchDepartment = async (departmentId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getDepartmentDetails(departmentId);
            if (response) {
                setDepartment(response.department);
                setEmployees(response.employees || []);
            }
        } catch (err) {
            console.error("Error fetching department details:", err);
            setError("Failed to load department details. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: Date) => {
        return format(new Date(dateString), "MMMM dd, yyyy");
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex justify-center items-center">
                <ContentLoader
                    speed={2}
                    width={1200}
                    height={600}
                    viewBox="0 0 1200 600"
                    backgroundColor="#1e3a8a"
                    foregroundColor="#1e40af"
                >
                    <rect x="0" y="20" rx="4" ry="4" width="300" height="40" />
                    <rect x="0" y="80" rx="4" ry="4" width="600" height="20" />
                    <rect x="0" y="120" rx="4" ry="4" width="200" height="20" />
                    <rect x="0" y="180" rx="4" ry="4" width="100%" height="2" />
                    <rect x="0" y="220" rx="4" ry="4" width="150" height="30" />
                    <rect x="0" y="280" rx="4" ry="4" width="250" height="20" />
                    <rect x="0" y="320" rx="4" ry="4" width="250" height="20" />
                    <rect x="0" y="360" rx="4" ry="4" width="250" height="20" />
                    <rect x="0" y="420" rx="4" ry="4" width="100%" height="2" />
                    <rect x="0" y="460" rx="4" ry="4" width="150" height="30" />
                    <rect x="0" y="520" rx="4" ry="4" width="100%" height="100" />
                </ContentLoader>
            </div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex justify-center items-center"
            >
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20 max-w-2xl w-full">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Department</h2>
                    <p className="text-red-300 mb-6">{error}</p>
                    <button
                        onClick={() => id && fetchDepartment(id)}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </motion.div>
        );
    }

    if (!department) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex justify-center items-center">
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20">
                    <h2 className="text-2xl font-bold text-white">Department not found</h2>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6"
        >
            <div className="max-w-7xl mx-auto">
                {/* Department Header */}
                <div className="mb-10 bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-3">{department.departmentName}</h1>
                            <p className="text-blue-200 text-lg mb-6">{department.description}</p>

                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center text-blue-300">
                                    <FaUserTie className="mr-3 text-xl" />
                                    <div>
                                        <p className="text-sm text-blue-100">Head of Department</p>
                                        <p className="font-medium text-white">{department.headOfDepartment}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-blue-300">
                                    <FaCalendarAlt className="mr-3 text-xl" />
                                    <div>
                                        <p className="text-sm text-blue-100">Established</p>
                                        <p className="font-medium text-white">{formatDate(department.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-blue-300">
                                    <FaUsers className="mr-3 text-xl" />
                                    <div>
                                        <p className="text-sm text-blue-100">Total Employees</p>
                                        <p className="font-medium text-white">{employees.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-700/50">
                            <div className="text-center">
                                <p className="text-5xl font-bold text-white mb-1">{employees.length}</p>
                                <p className="text-blue-200 uppercase text-sm tracking-wider">Employees</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-blue-400/30 transition-all"
                    >
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-600/20 p-3 rounded-lg mr-4">
                                <FaUsers className="text-blue-400 text-xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Team Members</h3>
                        </div>
                        <p className="text-3xl font-bold text-white mb-2">{employees.length}</p>
                        <p className="text-blue-300 text-sm">Active employees in department</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-green-400/30 transition-all"
                    >
                        <div className="flex items-center mb-4">
                            <div className="bg-green-600/20 p-3 rounded-lg mr-4">
                                <FaFileAlt className="text-green-400 text-xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Active Projects</h3>
                        </div>
                        <p className="text-3xl font-bold text-white mb-2">
                            {employees.reduce((acc, emp) => acc + emp.workReports.length, 0)}
                        </p>
                        <p className="text-green-300 text-sm">Ongoing work reports</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-purple-400/30 transition-all"
                    >
                        <div className="flex items-center mb-4">
                            <div className="bg-purple-600/20 p-3 rounded-lg mr-4">
                                <FaMoneyBillWave className="text-purple-400 text-xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Payroll Accounts</h3>
                        </div>
                        <p className="text-3xl font-bold text-white mb-2">
                            {employees.reduce((acc, emp) => acc + emp.payroll.length, 0)}
                        </p>
                        <p className="text-purple-300 text-sm">Active payroll records</p>
                    </motion.div>
                </div>

                {/* Employees List */}
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <FaIdBadge className="mr-3 text-blue-400" />
                            Team Members
                        </h2>
                        <div className="bg-blue-900/50 px-4 py-2 rounded-full border border-blue-700/50">
                            <span className="text-blue-100">Total: </span>
                            <span className="font-bold text-white">{employees.length}</span>
                        </div>
                    </div>

                    {employees.length === 0 ? (
                        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 text-center">
                            <p className="text-blue-200">No employees found in this department</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {employees.map((employee) => (
                                <motion.div
                                    key={employee._id}
                                    whileHover={{ y: -5 }}
                                    className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-blue-400/30 hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-start space-x-4 mb-4">
                                        <div className="bg-blue-600/20 text-blue-400 rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl">
                                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white">
                                                {employee.firstName} {employee.lastName}
                                            </h3>
                                            <p className="text-blue-300">{employee.designation}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center text-blue-200">
                                            <FaCalendarAlt className="mr-3 text-blue-400" />
                                            <span>{formatDate(employee.dob)}</span>
                                        </div>
                                        <div className="flex items-center text-blue-200">
                                            <FaPhone className="mr-3 text-blue-400" />
                                            <span>{employee.phoneNumber}</span>
                                        </div>
                                        <div className="flex items-center text-blue-200">
                                            <FaEnvelope className="mr-3 text-blue-400" />
                                            <span className="truncate">{employee.email}</span>
                                        </div>
                                        <div className="flex items-start text-blue-200">
                                            <FaMapMarkerAlt className="mr-3 mt-1 text-blue-400 flex-shrink-0" />
                                            <span className="truncate">{employee.address}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-white/10 flex justify-between">
                                        <div className="text-sm">
                                            <span className="font-medium text-blue-300">Reports: </span>
                                            <span className="text-green-400 font-bold">{employee.workReports.length}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium text-blue-300">Payrolls: </span>
                                            <span className="text-purple-400 font-bold">{employee.payroll.length}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Department Activity */}
                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <FaFileAlt className="mr-3 text-blue-400" />
                        Department Activity
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/50">
                            <p className="text-4xl font-bold text-white mb-2 text-center">{employees.length}</p>
                            <p className="text-blue-300 text-center uppercase text-sm tracking-wider">Total Employees</p>
                        </div>
                        <div className="bg-green-900/20 p-4 rounded-lg border border-green-800/50">
                            <p className="text-4xl font-bold text-white mb-2 text-center">
                                {employees.reduce((acc, emp) => acc + emp.workReports.length, 0)}
                            </p>
                            <p className="text-green-300 text-center uppercase text-sm tracking-wider">Work Reports</p>
                        </div>
                        <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-800/50">
                            <p className="text-4xl font-bold text-white mb-2 text-center">
                                {employees.reduce((acc, emp) => acc + emp.payroll.length, 0)}
                            </p>
                            <p className="text-purple-300 text-center uppercase text-sm tracking-wider">Payroll Records</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="font-medium text-white mb-4 text-lg">Recent Updates</h3>
                        <div className="space-y-4">
                            {employees
                                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                                .slice(0, 3)
                                .map(employee => (
                                    <div key={employee._id} className="flex items-start space-x-4 p-4 hover:bg-white/5 rounded-lg transition-colors">
                                        <div className="bg-blue-600/20 text-blue-400 rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm mt-1 flex-shrink-0">
                                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">
                                                {employee.firstName} {employee.lastName}
                                            </p>
                                            <p className="text-blue-300 text-sm">
                                                Last updated: {formatDate(employee.updatedAt)}
                                            </p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded">
                                                    {employee.workReports.length} reports
                                                </span>
                                                <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                                                    {employee.payroll.length} payrolls
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SingleDepartment;