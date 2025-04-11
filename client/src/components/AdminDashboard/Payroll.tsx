import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import {
    FiDollarSign,
    FiTrendingUp,
    FiPieChart,
    FiUsers,
    FiLayers,
    FiChevronRight
} from "react-icons/fi";
import { fetchPayrollservice, PayrollResponse } from "../../services/payrollServices";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import ContentLoader from "react-content-loader";
import React from "react";
import { useNavigate } from "react-router-dom";



// Color palette for charts
const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#A4DE6C', '#D0ED57', '#8884D8', '#8DD1E1'
];

// Custom content loaders
const StatCardLoader = () => (
    <ContentLoader
        speed={2}
        width="100%"
        height={120}
        viewBox="0 0 400 120"
        backgroundColor="#2d3748"
        foregroundColor="#4a5568"
    >
        <rect x="20" y="20" rx="8" ry="8" width="60" height="60" />
        <rect x="260" y="30" rx="4" ry="4" width="120" height="20" />
        <rect x="260" y="60" rx="4" ry="4" width="80" height="20" />
        <rect x="260" y="90" rx="4" ry="4" width="100" height="12" />
    </ContentLoader>
);

const DepartmentListLoader = () => (
    <ContentLoader
        speed={2}
        width="100%"
        height={400}
        viewBox="0 0 400 400"
        backgroundColor="#2d3748"
        foregroundColor="#4a5568"
    >
        <rect x="0" y="0" rx="4" ry="4" width="150" height="24" />
        {[...Array(7)].map((_, i) => (
            <React.Fragment key={i}>
                <rect x="0" y={60 + i * 56} rx="4" ry="4" width="180" height="20" />
                <rect x="0" y={86 + i * 56} rx="4" ry="4" width="100" height="16" />
                <rect x="300" y={60 + i * 56} rx="4" ry="4" width="80" height="24" />
                <rect x="390" y={60 + i * 56} rx="4" ry="4" width="10" height="24" />
            </React.Fragment>
        ))}
    </ContentLoader>
);

const ChartLoader = () => (
    <ContentLoader
        speed={2}
        width="100%"
        height={400}
        viewBox="0 0 400 400"
        backgroundColor="#2d3748"
        foregroundColor="#4a5568"
    >
        <rect x="0" y="0" rx="4" ry="4" width="150" height="24" />
        <circle cx="200" cy="200" r="150" />
        {[...Array(8)].map((_, i) => (
            <rect key={i} x={20 + i * 45} y="380" rx="4" ry="4" width="30" height="12" />
        ))}
    </ContentLoader>
);

const HeaderLoader = () => (
    <ContentLoader
        speed={2}
        width="100%"
        height={80}
        viewBox="0 0 800 80"
        backgroundColor="#2d3748"
        foregroundColor="#4a5568"
    >
        <rect x="0" y="0" rx="4" ry="4" width="300" height="40" />
        <rect x="600" y="0" rx="4" ry="4" width="100" height="24" />
        <rect x="600" y="30" rx="4" ry="4" width="150" height="16" />
    </ContentLoader>
);

const TabLoader = () => (
    <ContentLoader
        speed={2}
        width={200}
        height={40}
        viewBox="0 0 200 40"
        backgroundColor="#2d3748"
        foregroundColor="#4a5568"
    >
        <rect x="0" y="0" rx="4" ry="4" width="90" height="40" />
        <rect x="100" y="0" rx="4" ry="4" width="90" height="40" />
    </ContentLoader>
);

const Payroll = () => {
    const navigate = useNavigate()
    const [payrollData, setPayrollData] = useState<PayrollResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'pie' | 'bar'>('pie');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchPayrollservice();
                if (data) {
                    const sortedDepartments = [...data.departmentSalary]
                        .sort((a, b) => a.departmentName.localeCompare(b.departmentName))
                        .map(dept => ({
                            ...dept,
                            percentage: (dept.departmentTotal / data.totalSalary) * 100
                        }));

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

    // Memoized calculations
    const { stats, formattedDateTime } = useMemo(() => {
        const now = new Date();
        const dateTime = `${now.getFullYear()}-${(now.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now
                .getHours()
                .toString()
                .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        if (!payrollData) return { stats: [], formattedDateTime: dateTime };

        const highestDept = payrollData.departmentSalary.reduce((prev, current) =>
            (prev.departmentTotal > current.departmentTotal) ? prev : current
        );

        const statsData = [
            {
                title: "Total Payroll",
                value: `₹${payrollData.totalSalary.toLocaleString()}`,
                icon: FiDollarSign,
                description: "Total company payroll expenditure"
            },
            {
                title: "Departments",
                value: payrollData.departmentSalary.length.toString(),
                icon: FiUsers,
                description: "Number of departments"
            },
            {
                title: "Highest Department",
                value: highestDept.departmentName,
                icon: FiTrendingUp,
                description: `₹${highestDept.departmentTotal.toLocaleString()}`
            },
            {
                title: "Average Department",
                value: `₹${Math.round(payrollData.totalSalary / payrollData.departmentSalary.length).toLocaleString()}`,
                icon: FiPieChart,
                description: "Average department payroll"
            }
        ];

        return { stats: statsData, formattedDateTime: dateTime };
    }, [payrollData]);

    const handleDepartmentClick = (id: string) => {
        navigate(`/admin/department/${id}`);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                    <p className="font-bold text-white">{data.departmentName}</p>
                    <p className="text-indigo-300">₹{data.departmentTotal.toLocaleString()}</p>
                    <p className="text-purple-500">{data.percentage?.toFixed(1)}% of total</p>
                </div>
            );
        }
        return null;
    };

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
                {loading ? (
                    <HeaderLoader />
                ) : (
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <h2 className="text-white text-4xl font-bold">
                            Payroll Dashboard <span className="text-sm">({new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()})</span>
                        </h2>
                        <div className="text-white mt-4 md:mt-0">
                            <p className="text-xl font-medium">ADMIN</p>
                            <p className="text-sm opacity-80">{formattedDateTime}</p>
                        </div>
                    </div>
                )}

                {/* Payroll Stats */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-gradient-to-l from-indigo-800 via-slate-900 to-gray-900 p-6 rounded-xl">
                                <StatCardLoader />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
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
                )}
            </motion.div>

            {/* Department Breakdown Section */}
            <motion.div
                className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-6xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white text-2xl font-bold">
                        {loading ? <ContentLoader width={200} height={32} /> : "Department Breakdown"}
                    </h3>
                    {loading ? (
                        <TabLoader />
                    ) : (
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setActiveTab('pie')}
                                className={`px-4 py-2 rounded-lg ${activeTab === 'pie' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                            >
                                Pie Chart
                            </button>
                            <button
                                onClick={() => setActiveTab('bar')}
                                className={`px-4 py-2 rounded-lg ${activeTab === 'bar' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                            >
                                Bar Chart
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Department List */}
                    <div className="bg-gradient-to-br from-indigo-800 to-gray-800 p-6 rounded-xl">
                        <h4 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                            {loading ? <ContentLoader width={150} height={24} /> : (
                                <>
                                    <FiLayers className="text-indigo-300" /> Department Salaries
                                </>
                            )}
                        </h4>
                        {loading ? <DepartmentListLoader /> : (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                {payrollData?.departmentSalary.map((dept, index) => (
                                    <motion.div
                                        key={dept._id}
                                        className="group bg-gray-800 bg-opacity-50 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-indigo-900 hover:bg-opacity-30 transition-all"
                                        whileHover={{ scale: 1.01 }}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        onClick={() => handleDepartmentClick(dept._id)}
                                    >
                                        <div>
                                            <p className="text-white font-medium group-hover:text-indigo-300 transition-colors">
                                                {dept.departmentName}
                                            </p>
                                            <p className="text-indigo-300 text-sm">
                                                {dept.percentage?.toFixed(1)}% of total
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-bold">
                                                ₹{dept.departmentTotal.toLocaleString()}
                                            </p>
                                            <FiChevronRight className="text-gray-400 group-hover:text-white transition-colors" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chart Visualization */}
                    <div className="bg-gradient-to-br from-blue-800 to-gray-800 p-6 rounded-xl flex flex-col">
                        <h4 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                            {loading ? <ContentLoader width={150} height={24} /> : (
                                <>
                                    <FiPieChart className="text-blue-300" /> Payroll Distribution
                                </>
                            )}
                        </h4>
                        {loading ? <ChartLoader /> : (
                            <div className="flex-1 min-h-[400px]">
                                {activeTab === 'pie' ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={payrollData?.departmentSalary}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={150}
                                                fill="#8884d8"
                                                dataKey="departmentTotal"
                                                nameKey="departmentName"
                                                animationDuration={1000}
                                                animationEasing="ease-out"
                                            >
                                                {payrollData?.departmentSalary.map((_entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend
                                                layout="horizontal"
                                                verticalAlign="bottom"
                                                align="center"
                                                wrapperStyle={{ paddingTop: '20px' }}
                                                formatter={(value) => (
                                                    <span className="text-white text-xs">
                                                        {value}
                                                    </span>
                                                )}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={payrollData?.departmentSalary}
                                            margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                                            layout="vertical"
                                        >

                                            <XAxis type="number" tick={{ fill: '#fff' }} />
                                            <YAxis
                                                type="category"
                                                dataKey="departmentName"
                                                width={100}
                                                tick={{ fill: '#fff', fontSize: 14 }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend
                                                wrapperStyle={{
                                                    color: 'white',
                                                }}
                                            />

                                            <Bar
                                                dataKey="departmentTotal"
                                                name="Salary"
                                                animationDuration={1500}
                                                label={{
                                                    position: 'right',
                                                    fill: 'white',
                                                    fontSize: 14,
                                                }}
                                            >
                                                {payrollData?.departmentSalary.map((_entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>

                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Payroll;