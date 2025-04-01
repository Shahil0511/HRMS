import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiDollarSign, FiTrendingUp, FiPieChart, FiUsers, FiLayers } from "react-icons/fi";
import { fetchPayrollservice, PayrollResponse } from "../../services/payrollServices";

const Payroll = () => {
    const [payrollData, setPayrollData] = useState<PayrollResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchPayrollservice();
                if (data) {
                    // Sort departments alphabetically
                    const sortedDepartments = [...data.departmentSalary].sort((a, b) =>
                        a.departmentName.localeCompare(b.departmentName)
                    );
                    setPayrollData({
                        totalSalary: data.totalSalary,
                        departmentSalary: sortedDepartments
                    });
                } else {
                    setError("Failed to fetch payroll data");
                }
            } catch (err) {
                setError("An error occurred while fetching data");
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const now = new Date();
    const formattedDateTime = `${now.getFullYear()}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now
            .getHours()
            .toString()
            .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Stats configuration
    const getStats = () => [
        {
            title: "Total Payroll",
            value: `$${payrollData?.totalSalary?.toLocaleString() ?? '0'}`,
            icon: FiDollarSign,
            description: "Total company payroll expenditure"
        },
        {
            title: "Departments",
            value: payrollData?.departmentSalary.length.toString() ?? '0',
            icon: FiUsers,
            description: "Number of departments"
        },
        {
            title: "Highest Department",
            value: payrollData?.departmentSalary.reduce((prev, current) =>
                (prev.departmentTotal > current.departmentTotal) ? prev : current
            ).departmentName ?? 'N/A',
            icon: FiTrendingUp,
            description: "Department with highest payroll"
        },
        {
            title: "Average Department",
            value: `$${payrollData ? Math.round(
                payrollData.totalSalary / payrollData.departmentSalary.length
            ).toLocaleString() : '0'}`,
            icon: FiPieChart,
            description: "Average department payroll"
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex items-center justify-center">
                <div className="text-white text-2xl">Loading payroll data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex items-center justify-center">
                <div className="text-red-400 text-2xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex flex-col items-center gap-6">
            {/* Header Section */}
            <motion.div
                className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-6xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h2 className="text-white text-4xl font-bold">
                        Payroll Dashboard <span className="text-sm">({new Date().toLocaleString('default', { month: 'long' })} {now.getFullYear()})</span>
                    </h2>
                    <div className="text-white mt-4 md:mt-0">
                        <p className="text-xl font-medium">ADMIN</p>
                        <p className="text-sm opacity-80">{formattedDateTime}</p>
                    </div>
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
                                <stat.icon className="text-white text-2xl" />
                            </div>
                            <div className="text-right">
                                <p className="text-white text-sm font-medium opacity-80">
                                    {stat.title}
                                </p>
                                <p className="text-white text-2xl font-bold">{stat.value}</p>
                                <p className="text-white text-xs opacity-60 mt-1">
                                    {stat.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Department Breakdown Section */}
            <motion.div
                className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-6xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <h3 className="text-white text-2xl font-bold mb-6">Department Breakdown</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Department List */}
                    <div className="bg-gradient-to-br from-indigo-800 to-gray-800 p-6 rounded-xl">
                        <h4 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                            <FiLayers className="text-indigo-300" /> Department Salaries
                        </h4>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {payrollData?.departmentSalary.map((dept, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-gray-800 bg-opacity-50 p-4 rounded-lg flex justify-between items-center"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <div>
                                        <p className="text-white font-medium">{dept.departmentName}</p>
                                        <p className="text-indigo-300 text-sm">
                                            {(dept.departmentTotal / payrollData.totalSalary * 100).toFixed(1)}% of total
                                        </p>
                                    </div>
                                    <p className="text-white font-bold">
                                        ${dept.departmentTotal.toLocaleString()}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Visualization Placeholder */}
                    <div className="bg-gradient-to-br from-blue-800 to-gray-800 p-6 rounded-xl flex flex-col">
                        <h4 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                            <FiPieChart className="text-blue-300" /> Payroll Distribution
                        </h4>
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-white text-center">
                                <p className="text-2xl font-bold mb-2">
                                    ${payrollData?.totalSalary.toLocaleString() ?? '0'}
                                </p>
                                <p className="text-sm opacity-80">Total Payroll</p>
                                {/* In a real app, you would add a chart here */}
                                <div className="mt-6 w-64 h-64 mx-auto bg-gray-700 bg-opacity-30 rounded-full flex items-center justify-center">
                                    <span className="text-sm opacity-70">Chart Visualization</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Payroll;