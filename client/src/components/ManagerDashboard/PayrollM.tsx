import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaMoneyBillWave, FaFileInvoice, FaChartBar, FaCalendarAlt } from "react-icons/fa";
import { fetchPayrollData, fetchSalary, getUserDataFromLocalStorage, PayrollData, PayrollStat } from "../../services/payrollServices";
import PayrollTable from "../EmployeeDashboard/payrollUtils/PayrollTable";

const usePayrollData = () => {
    const [payrollData, setPayrollData] = useState<PayrollData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<{
        name: string;
        empId: string;
        salary: number;
    } | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);

                // 1. Get user data from localStorage
                const localStorageData = getUserDataFromLocalStorage();
                if (!localStorageData) {
                    throw new Error("User data not found in localStorage");
                }

                // 2. Get token
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("Token not found");
                }

                // 3. Fetch salary data
                const salaryData = await fetchSalary(token, localStorageData.employeeId);

                // Set complete user data
                setUserData({
                    name: localStorageData.employeeName,
                    empId: localStorageData.employeeId,
                    salary: salaryData.baseSalary
                });

                // 4. Fetch payroll data
                const payroll = await fetchPayrollData(
                    localStorageData.employeeId,
                    localStorageData.employeeName,
                    salaryData.baseSalary,
                    salaryData.deductions,
                    0
                );

                setPayrollData(payroll);
                setError(null);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    return { payrollData, loading, error, userData };
};

const ManagerPayrollDashboard: React.FC = () => {
    const { payrollData, loading, error } = usePayrollData();
    const [workingDaysData, setWorkingDaysData] = useState<{
        workingDays: number;
        weekOffs: number;
        fullMonthData?: {
            date: string;
            status: string;
            hoursWorked: number;
        }[];
    } | null>(null);

    // Get current month and days in month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);

    const handleWorkingDaysCalculated = React.useCallback((data: {
        workingDays: number;
        weekOffs: number;
        fullMonthData: {
            date: string;
            status: string;
            hoursWorked: number;
        }[];
    }) => {
        if (JSON.stringify(workingDaysData) !== JSON.stringify(data)) {
            setWorkingDaysData(data);
        }
    }, [workingDaysData]);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStats = (): PayrollStat[] => {
        if (!payrollData || !workingDaysData?.fullMonthData) return [];

        // Simplified calculation - just count days with > 8.45 hours worked
        const compliantDays = workingDaysData.fullMonthData
            ? workingDaysData.fullMonthData.filter(day =>
                day.status === "Present" && day.hoursWorked >= 8.45
            ).length
            : 0;

        const dailyRate = payrollData.monthlySalary / daysInMonth;
        const compliantEarnings = dailyRate * compliantDays;
        const deductions = payrollData.monthlySalary - compliantEarnings;

        return [
            {
                title: `${currentMonthName} Salary`,
                value: formatCurrency(payrollData.monthlySalary),
                icon: FaMoneyBillWave,
                change: "+5%",
                isPositive: true
            },
            {
                title: `${currentMonthName} Earnings`,
                value: formatCurrency(compliantEarnings),
                icon: FaCalendarAlt,
                change: `${Math.round((compliantDays / daysInMonth) * 100)}%`,
                isPositive: true
            },
            {
                title: "Working Days",
                value: compliantDays.toString(),
                icon: FaFileInvoice,
                change: "",
                isPositive: true
            },
            {
                title: "Deductions",
                value: formatCurrency(deductions),
                icon: FaChartBar,
                change: "",
                isPositive: false
            },
        ];
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
                    <h2 className="text-white text-4xl font-bold">Manager Payroll</h2>
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

            {/* Attendance Summary - Simplified */}
            {workingDaysData?.fullMonthData && (
                <motion.div
                    className="w-full max-w-6xl bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 p-8 rounded-2xl shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                >
                    <h3 className="text-white text-2xl font-bold mb-6">Attendance Summary</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Total Present Days */}
                        <div className="bg-indigo-800/30 p-4 rounded-lg">
                            <p className="text-gray-300 text-sm">Total Present Days</p>
                            <p className="text-white text-2xl font-bold">
                                {workingDaysData.fullMonthData.filter(day =>
                                    day.status === "Present"
                                ).length}
                            </p>
                        </div>

                        {/* Total Absent Days */}
                        <div className="bg-indigo-800/30 p-4 rounded-lg">
                            <p className="text-gray-300 text-sm">Total Absent Days</p>
                            <p className="text-white text-2xl font-bold">
                                {workingDaysData.fullMonthData.filter(day =>
                                    day.status === "Absent"
                                ).length}
                            </p>
                        </div>

                        {/* Compliant Days */}
                        <div className="bg-indigo-800/30 p-4 rounded-lg">
                            <p className="text-gray-300 text-sm">Compliant Days (≥8.45 hrs)</p>
                            <p className="text-white text-2xl font-bold">
                                {workingDaysData.fullMonthData.filter(day =>
                                    day.status === "Present" && day.hoursWorked >= 8.45
                                ).length}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            <PayrollTable onWorkingDaysCalculated={handleWorkingDaysCalculated} />

            {/* Earnings Calculation - Simplified */}
            {workingDaysData?.fullMonthData && (
                <motion.div
                    className="w-full max-w-6xl bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 p-8 rounded-2xl shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    <h3 className="text-white text-2xl font-bold mb-6">Earnings Calculation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-indigo-800/30 p-4 rounded-lg">
                            <p className="text-gray-300 text-sm">Monthly Salary</p>
                            <p className="text-white text-2xl font-bold">
                                {formatCurrency(payrollData?.monthlySalary || 0)}
                            </p>
                        </div>
                        <div className="bg-indigo-800/30 p-4 rounded-lg">
                            <p className="text-gray-300 text-sm">Compliant Days (≥8.45 hrs)</p>
                            <p className="text-white text-2xl font-bold">
                                {workingDaysData.fullMonthData.filter(day =>
                                    day.status === "Present" && day.hoursWorked >= 8.45
                                ).length} / {daysInMonth}
                            </p>
                        </div>
                        <div className="bg-indigo-800/30 p-4 rounded-lg">
                            <p className="text-gray-300 text-sm">Daily Rate</p>
                            <p className="text-white text-2xl font-bold">
                                {formatCurrency((payrollData?.monthlySalary || 0) / daysInMonth)}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ManagerPayrollDashboard;