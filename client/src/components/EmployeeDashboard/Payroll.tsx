import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaMoneyBillWave, FaFileInvoice, FaChartBar, FaCalendarAlt } from "react-icons/fa";
import {
    fetchSalary,
    fetchPayrollData,
    getUserDataFromLocalStorage,
    PayrollData,
    PayrollStat,
    WorkReport,
    reportData
} from "../../services/payrollServices";
import PayrollTable from "./payrollUtils/PayrollTable";

const usePayrollData = () => {
    const [payrollData, setPayrollData] = useState<PayrollData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [empId, setEmpId] = useState("");
    const [salary, setSalary] = useState(0);
    const [deduction, setDeduction] = useState(0);
    const [pendingWorkReport, setPendingWorkReport] = useState<WorkReport[] | null>(null);

    useEffect(() => {
        const userData = getUserDataFromLocalStorage();
        if (userData) {
            setName(userData.employeeName);
            setEmpId(userData.employeeId);
        }
    }, []);

    useEffect(() => {
        const fetchPendingReports = async () => {
            const pendingData = await reportData();
            if (pendingData) {
                setPendingWorkReport(pendingData as unknown as WorkReport[] | null);
            }
        };
        fetchPendingReports();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            const user = getUserDataFromLocalStorage();

            if (!token || !user?.employeeId) {
                setError("User or token not found");
                setLoading(false);
                return;
            }

            try {
                const data = await fetchSalary(token, user.employeeId);
                setSalary(data.baseSalary);
                setDeduction(data.deductions);
            } catch (error: any) {
                setError(error.message);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const loadPayrollData = async () => {
            if (!empId || !name || !pendingWorkReport) return;
            try {
                setLoading(true);
                const data = await fetchPayrollData(
                    empId,
                    name,
                    salary,
                    deduction,
                    pendingWorkReport.length
                );
                setPayrollData(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        };

        loadPayrollData();
    }, [empId, name, salary, deduction, pendingWorkReport]);

    return { payrollData, loading, error };
};

const PayrollDashboard: React.FC = () => {
    const { payrollData, loading, error } = usePayrollData();



    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

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
                isPositive: false
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
            <PayrollTable />

            {/* Summary Section */}
            <motion.div
                className="w-full max-w-6xl bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 p-8 rounded-2xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <h3 className="text-white text-2xl font-bold mb-6">Payroll Summary</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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