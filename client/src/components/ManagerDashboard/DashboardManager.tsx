import { useEffect, useState } from "react";
import { FaUsers, FaUserCheck, FaUserTimes, FaClipboardList, FaCalendarDay, FaExclamationCircle, FaEllipsisH } from "react-icons/fa";
import { getDepartmentEmployees } from "../../services/managerdashboard";
import { motion } from "framer-motion";

interface ManagerDashboardData {
    totalEmployees: number;
    totalPresentToday: number;
    totalAbsentToday: number;
    leavesApplied: number;
    todaysWorksheet: number;
    complaints: number;
    others: number;
}

const DashboardManager = () => {
    const [data, setData] = useState<ManagerDashboardData>({
        totalEmployees: 0,
        totalPresentToday: 0,
        totalAbsentToday: 0,
        leavesApplied: 0,
        todaysWorksheet: 0,
        complaints: 0,
        others: 0
    });

    const [, setLoading] = useState(true);

    useEffect(() => {
        getDepartmentEmployees()
            .then((response: { totalEmployees: any; }) => {
                setData((prevData) => ({
                    ...prevData,
                    totalEmployees: response.totalEmployees || 0,
                }));
            })
            .catch((err: any) => {
                console.error("Error fetching department employees:", err);
                setLoading(false);
            })
            .finally(() => setLoading(false));
    }, []);

    // useEffect(() => {
    //     if (data.totalEmployees > 0) {
    //         getTodayTotalDepartmentPresent()
    //             .then((response: { totalPresentToday: number; }) => {
    //                 setData((prevData) => ({
    //                     ...prevData,
    //                     totalPresentToday: response.totalPresentToday || 0,
    //                     totalAbsentToday: prevData.totalEmployees - response.totalPresentToday || 0,
    //                 }));
    //             })
    //             .catch((err: any) => {
    //                 console.error("Error fetching today's department attendance:", err);
    //                 setLoading(false);
    //             })
    //             .finally(() => setLoading(false));
    //     }
    // }, [data.totalEmployees]);

    const stats = [
        { label: "Total Employees", value: data.totalEmployees, icon: <FaUsers /> },
        { label: "Employees Present", value: 0, icon: <FaUserCheck /> },
        { label: "Employees Absent", value: 0, icon: <FaUserTimes /> },
        { label: "Leaves Applied", value: 0, icon: <FaClipboardList /> },
        { label: "My Profile", value: 0, icon: <FaClipboardList /> },
        { label: "Today's Work Sheet", value: 0, icon: <FaCalendarDay /> },
        { label: "Complaints", value: 0, icon: <FaExclamationCircle /> },
        { label: "Others", value: 0, icon: <FaEllipsisH /> }
    ];

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex justify-center items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-full px-4 md:px-8">
                {stats.map((stat, index) => (
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