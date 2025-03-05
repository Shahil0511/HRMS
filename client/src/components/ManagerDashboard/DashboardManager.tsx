import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaUserCheck, FaUserTimes, FaClipboardList, FaCalendarDay, FaExclamationCircle, FaUser } from "react-icons/fa";
import { getDepartmentEmployees, getTodayTotalDepartmentPresent } from "../../services/managerdashboard";
import attendanceService from "../../services/attendanceServices";
import moment from "moment";

interface AttendanceItem {
    status: string;
    date: string;
}

const DashboardManager = () => {
    const [data, setData] = useState({
        totalEmployees: 0,
        totalPresentToday: 0,
        totalAbsentToday: 0,
        leavesApplied: 0,
        todaysWorksheet: 0,
        complaints: 0,
        totalPresentThisMonth: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [employeesResponse, attendanceResponse] = await Promise.all([
                    getDepartmentEmployees(),
                    getTodayTotalDepartmentPresent(),
                ]);

                setData((prevState) => ({
                    ...prevState,
                    totalEmployees: employeesResponse?.totalEmployees || 0,
                    totalPresentToday: attendanceResponse?.totalPresent || 0,
                    totalAbsentToday: (employeesResponse?.totalEmployees || 0) - (attendanceResponse?.totalPresent || 0),
                }));
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []); // Only run once after component mounts

    useEffect(() => {
        const fetchAttendanceThisMonth = async () => {
            try {
                const data = await attendanceService.getEmployeeAttendance();

                const groupedByDate = data.reduce((acc: Record<string, AttendanceItem>, curr: AttendanceItem) => {
                    const date = moment(curr.date).format("YYYY-MM-DD");
                    if (!acc[date]) {
                        acc[date] = { ...curr, status: curr.status };
                    }
                    return acc;
                }, {});

                const uniqueAttendance = Object.values(groupedByDate) as AttendanceItem[];

                const totalPresentThisMonth = uniqueAttendance.filter((item) => item.status === 'Present').length;



                setData((prevState) => ({
                    ...prevState,
                    totalPresentThisMonth,
                }));
            } catch (error) {
                console.error("Error fetching attendance data", error);
            }
        };

        fetchAttendanceThisMonth();
    }, []); // Only run once after component mounts

    const stats = [
        { label: "Total Employees", value: data.totalEmployees, icon: <FaUsers /> },
        { label: "Employees Present Today", value: data.totalPresentToday, icon: <FaUserCheck /> },
        { label: "Employees Absent Today", value: data.totalAbsentToday, icon: <FaUserTimes /> },
        { label: "Leaves Applied", value: data.leavesApplied, icon: <FaClipboardList /> },
        { label: "Today's Work Sheet", value: data.todaysWorksheet, icon: <FaCalendarDay /> },
        { label: "Profile", value: "View", icon: <FaUser /> },
        { label: "Complaints", value: data.complaints, icon: <FaExclamationCircle /> },
        { label: "My Total Attendance ", value: data.totalPresentThisMonth, icon: <FaUserCheck /> },
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
                        <div className="text-3xl font-bold">{loading ? 0 : stat.value}</div>
                        <div className="text-lg font-medium">{stat.label}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default DashboardManager;
