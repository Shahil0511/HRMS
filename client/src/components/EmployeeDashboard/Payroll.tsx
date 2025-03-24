import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaMoneyBillWave, FaFileInvoice, FaChartBar, FaCalendarAlt } from "react-icons/fa";

// Define TypeScript interfaces
interface WorkReport {
    id: number;
    day: string;
    date: string;
    status: 'Present' | 'Absent' | 'Week Off' | 'Holiday';
    workReportStatus: 'Pending' | 'Approved' | 'Rejected';
    completionStatus: 'Completed' | 'Pending' | 'Rejected';
    hoursWorked?: number;
}

interface PayrollStat {
    title: string;
    value: string;
    icon: React.ComponentType;
    change?: string;
    isPositive?: boolean;
}

interface PayrollData {
    employeeId: string;
    employeeName: string;
    monthlySalary: number;
    currentMonthEarnings: number;
    pendingWorkReports: number;
    deductions: number;
    workReports: WorkReport[];
}

// Service for fetching payroll data
const usePayrollService = () => {
    const [payrollData, setPayrollData] = useState<PayrollData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [empId, setEmpId] = useState("")

    useEffect(() => {
        const fetchEmployeeName = async () => {
            const response = localStorage.getItem("user");
            if (response) {
                try {
                    const user = JSON.parse(response);
                    setName(user.employeeName);
                    setEmpId(user.employeeId)

                } catch (error) {
                    console.error("Error parsing user data:", error);
                }
            }
        };

        fetchEmployeeName();
    }, []);


    useEffect(() => {
        const fetchPayrollData = async () => {
            try {
                // In a real application, this would be an API call
                // For demonstration, we're using mock data
                setLoading(true);

                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // Mock data for a week
                const mockData: PayrollData = {
                    employeeId: empId,
                    employeeName: name,
                    monthlySalary: 20000,
                    currentMonthEarnings: 15000,
                    pendingWorkReports: 5,
                    deductions: 5000,
                    workReports: [
                        { id: 1, day: 'Monday', date: '2025-03-24', status: 'Present', workReportStatus: 'Approved', completionStatus: 'Completed', hoursWorked: 8 },
                        { id: 2, day: 'Tuesday', date: '2025-03-25', status: 'Present', workReportStatus: 'Approved', completionStatus: 'Completed', hoursWorked: 8.5 },
                        { id: 3, day: 'Wednesday', date: '2025-03-26', status: 'Present', workReportStatus: 'Pending', completionStatus: 'Pending', hoursWorked: 7.5 },
                        { id: 4, day: 'Thursday', date: '2025-03-27', status: 'Present', workReportStatus: 'Pending', completionStatus: 'Pending', hoursWorked: 0 },
                        { id: 5, day: 'Friday', date: '2025-03-28', status: 'Absent', workReportStatus: 'Rejected', completionStatus: 'Rejected', hoursWorked: 0 },
                        { id: 6, day: 'Saturday', date: '2025-03-29', status: 'Week Off', workReportStatus: 'Approved', completionStatus: 'Completed', hoursWorked: 0 },
                        { id: 7, day: 'Sunday', date: '2025-03-30', status: 'Week Off', workReportStatus: 'Approved', completionStatus: 'Completed', hoursWorked: 0 }
                    ]
                };
                setPayrollData(mockData);
                setError(null);
            } catch (err) {
                setError("Failed to fetch payroll data. Please try again later.");
                console.error("Error fetching payroll data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPayrollData();
    }, []);

    return { payrollData, loading, error };
};

const PayrollDashboard: React.FC = () => {
    const { payrollData, loading, error } = usePayrollService();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 7; // Show a full week

    // Function to format currency
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Calculate stats from payroll data
    const getStats = (): PayrollStat[] => {
        if (!payrollData) return [];

        return [
            {
                title: "Monthly Salary",
                value: formatCurrency(payrollData.monthlySalary),
                icon: FaMoneyBillWave,
                change: "+2.5%",
                isPositive: true
            },
            {
                title: "March Earnings",
                value: formatCurrency(payrollData.currentMonthEarnings),
                icon: FaCalendarAlt,
                change: "80%",
                isPositive: true
            },
            {
                title: "Pending Reports",
                value: payrollData.pendingWorkReports.toString(),
                icon: FaFileInvoice,
                change: "-2",
                isPositive: true
            },
            {
                title: "Deductions",
                value: formatCurrency(payrollData.deductions),
                icon: FaChartBar,
                change: "+500",
                isPositive: false
            },
        ];
    };

    // Calculate paginated data
    const getPaginatedReports = (): WorkReport[] => {
        if (!payrollData) return [];

        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return payrollData.workReports.slice(indexOfFirstItem, indexOfLastItem);
    };

    // Calculate total pages
    const getTotalPages = (): number => {
        if (!payrollData) return 1;
        return Math.ceil(payrollData.workReports.length / itemsPerPage);
    };

    // Determine status badge color
    const getStatusBadgeColor = (status: string): string => {
        switch (status) {
            case 'Present':
                return 'bg-green-500';
            case 'Absent':
                return 'bg-red-500';
            case 'Week Off':
                return 'bg-gray-500';
            case 'Holiday':
                return 'bg-blue-500';
            case 'Approved':
                return 'bg-green-500';
            case 'Pending':
                return 'bg-yellow-500';
            case 'Rejected':
                return 'bg-red-500';
            case 'Completed':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading payroll data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 flex items-center justify-center">
                <div className="bg-red-500 p-4 rounded-lg text-white">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex flex-col items-center gap-6">
            {/* Header Section with Employee Info */}
            <motion.div
                className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-6xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h2 className="text-white text-4xl font-bold">Employee Payroll</h2>
                    {payrollData && (
                        <div className="text-white mt-4 md:mt-0">
                            <p className="text-xl font-medium">{payrollData.employeeName}</p>
                            <p className="text-sm opacity-80">Employee ID: {payrollData.employeeId}</p>
                        </div>
                    )}
                </div>

                {/* Payroll Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {getStats().map((stat, index) => (
                        <motion.div
                            key={index}
                            className="bg-gradient-to-l from-indigo-800 via-slate-900 to-gray-900 p-6 rounded-xl flex items-center justify-between shadow-md hover:shadow-xl transition-all"
                            whileHover={{ scale: 1.03 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="bg-indigo-700 p-3 rounded-lg">
                                <stat.icon />
                            </div>
                            <div className="text-right">
                                <p className="text-white text-sm font-medium opacity-80">{stat.title}</p>
                                <p className="text-white text-2xl font-bold">{stat.value}</p>
                                {stat.change && (
                                    <p className={`text-sm ${stat.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                        {stat.change}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Weekly Work Report Table */}
            <motion.div
                className="w-full max-w-6xl bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 p-8 rounded-2xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white text-2xl font-bold">Weekly Work Report</h3>
                    <div className="text-white text-sm">
                        March 24 - March 30, 2025
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-white">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="py-3 px-4 text-left font-medium">Day</th>
                                <th className="py-3 px-4 text-left font-medium">Date</th>
                                <th className="py-3 px-4 text-left font-medium">Status</th>
                                <th className="py-3 px-4 text-left font-medium">Hours</th>
                                <th className="py-3 px-4 text-left font-medium">Report Status</th>
                                <th className="py-3 px-4 text-left font-medium">Completion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getPaginatedReports().map((report) => (
                                <tr key={report.id} className="border-b border-gray-700 hover:bg-indigo-800/30 transition-colors">
                                    <td className="py-3 px-4">{report.day}</td>
                                    <td className="py-3 px-4">{new Date(report.date).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(report.status)}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">{report.hoursWorked}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(report.workReportStatus)}`}>
                                            {report.workReportStatus}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(report.completionStatus)}`}>
                                            {report.completionStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls - only show if more than 7 days of data */}
                {getTotalPages() > 1 && (
                    <div className="mt-6 flex justify-center gap-4">
                        <button
                            className="px-4 py-2 bg-blue-600 rounded-lg text-white disabled:bg-gray-600 disabled:opacity-50 transition-colors"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            Previous
                        </button>
                        <div className="flex items-center text-white">
                            <span>{currentPage} of {getTotalPages()}</span>
                        </div>
                        <button
                            className="px-4 py-2 bg-blue-600 rounded-lg text-white disabled:bg-gray-600 disabled:opacity-50 transition-colors"
                            disabled={currentPage === getTotalPages()}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Summary Section */}
            <motion.div
                className="w-full max-w-6xl bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 p-8 rounded-2xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <h3 className="text-white text-2xl font-bold mb-6">Payroll Summary</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Weekly Performance */}
                    <div className="bg-indigo-800/30 p-6 rounded-xl">
                        <h4 className="text-white text-lg font-medium mb-4">Weekly Performance</h4>
                        <div className="flex justify-between mb-3">
                            <span className="text-white opacity-80">Attendance Rate</span>
                            <span className="text-white font-medium">80%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                        </div>

                        <div className="flex justify-between mb-3">
                            <span className="text-white opacity-80">Task Completion</span>
                            <span className="text-white font-medium">65%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                            <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                    </div>

                    {/* Monthly Summary */}
                    <div className="bg-indigo-800/30 p-6 rounded-xl">
                        <h4 className="text-white text-lg font-medium mb-4">Monthly Summary</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-white opacity-80">Days Worked</span>
                                <span className="text-white font-medium">18/22</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white opacity-80">Pending Reports</span>
                                <span className="text-white font-medium">5</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white opacity-80">Leave Balance</span>
                                <span className="text-white font-medium">12 days</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white opacity-80">Next Payday</span>
                                <span className="text-white font-medium">April 5, 2025</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PayrollDashboard;