import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaUserCheck, FaUserTimes, FaClipboardList, FaCalendarDay, FaExclamationCircle, FaEllipsisH } from "react-icons/fa";
import { getDepartmentEmployees, getTodayTotalDepartmentPresent } from "../../services/managerdashboard";

// Skeleton Loader Component
const SkeletonCard = () => (
    <div className="bg-gray-700 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-white text-center animate-pulse">
        <div className="w-16 h-16 bg-gray-600 rounded-full mb-3"></div>
        <div className="w-12 h-6 bg-gray-600 rounded-md mb-2"></div>
        <div className="w-24 h-4 bg-gray-600 rounded-md"></div>
    </div>
);

const DashboardManager = () => {
    const [data, setData] = useState({
        totalEmployees: 0,
        totalPresentToday: 0,
        totalAbsentToday: 0,
        leavesApplied: 0,
        todaysWorksheet: 0,
        complaints: 0,
        others: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [employeesResponse, attendanceResponse] = await Promise.all([
                    getDepartmentEmployees(),
                    getTodayTotalDepartmentPresent(),
                ]);

                setData({
                    totalEmployees: employeesResponse?.totalEmployees || 0,
                    totalPresentToday: attendanceResponse?.totalPresent || 0,
                    totalAbsentToday: (employeesResponse?.totalEmployees || 0) - (attendanceResponse?.totalPresent || 0),
                    leavesApplied: 0,
                    todaysWorksheet: 0,
                    complaints: 0,
                    others: 0,
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const stats = [
        { label: "Total Employees", value: data.totalEmployees, icon: <FaUsers /> },
        { label: "Employees Present", value: data.totalPresentToday, icon: <FaUserCheck /> },
        { label: "Employees Absent", value: data.totalAbsentToday, icon: <FaUserTimes /> },
        { label: "Leaves Applied", value: data.leavesApplied, icon: <FaClipboardList /> },
        { label: "Today's Work Sheet", value: data.todaysWorksheet, icon: <FaCalendarDay /> },
        { label: "Complaints", value: data.complaints, icon: <FaExclamationCircle /> },
        { label: "Others", value: data.others, icon: <FaEllipsisH /> }
    ];

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex justify-center items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-full px-4 md:px-8">
                {loading
                    ? Array(8).fill(0).map((_, index) => <SkeletonCard key={index} />)
                    : stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            className="bg-gradient-to-l from-indigo-900 to-gray-900 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-white text-center transform transition-transform duration-300 hover:scale-105"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <div className="text-5xl text-white mb-3">{stat.icon}</div>
                            <div className="text-3xl font-bold">{stat.value}</div>
                            <div className="text-lg font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
            </div>
        </div>
    );
};

export default DashboardManager;
