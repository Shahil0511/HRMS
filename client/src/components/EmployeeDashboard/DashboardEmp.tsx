import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaUserCheck, FaUserTimes, FaClipboardList, FaCalendarDay, FaUser, FaMoneyBillWave, FaExclamationCircle, FaEllipsisH } from "react-icons/fa";
import moment from 'moment';
import attendanceService from "../../services/attendanceServices";
import { useNavigate } from "react-router-dom";

interface AttendanceItem {
    status: string;
    date: string;
}

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: any) => state.auth); // Get logged-in user

    const [attendanceData, setAttendanceData] = useState({
        totalAttendance: 0,
        totalAbsent: 0,
        leavesTaken: 0,
        complaints: 0,
    });

    useEffect(() => {
        const fetchAttendanceData = async () => {
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

                const totalAttendance = uniqueAttendance.filter((item) => item.status === 'Present').length;
                const totalAbsent = uniqueAttendance.filter((item) => item.status === 'Absent').length;
                const leavesTaken = uniqueAttendance.filter((item) => item.status === 'Leave').length;

                setAttendanceData({ totalAttendance, totalAbsent, leavesTaken, complaints: 0 });
            } catch (error) {
                console.error("Error fetching attendance data", error);
            }
        };

        fetchAttendanceData();
    }, []);

    const stats = [
        { label: "Total Attendance This Month", value: attendanceData.totalAttendance, icon: <FaUserCheck /> },
        { label: "Total Absent This Month", value: attendanceData.totalAbsent, icon: <FaUserTimes /> },
        { label: "Leaves Taken", value: attendanceData.leavesTaken, icon: <FaClipboardList /> },
        { label: "Work Reports", value: 0, icon: <FaCalendarDay /> },
        {
            label: "Profile",
            value: "View",
            icon: <FaUser />,
            onClick: () => {

                if (user && user.id) {

                    navigate(`/employee/profile/${user.id}`);
                } else {
                    console.log("User ID is undefined");
                    console.error("User ID is undefined");
                }
            }
        },
        { label: "Payroll", value: "$0", icon: <FaMoneyBillWave /> },
        { label: "Complaints", value: attendanceData.complaints, icon: <FaExclamationCircle /> },
        { label: "Others", value: 0, icon: <FaEllipsisH /> }
    ];

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex justify-center items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-full px-4 md:px-8">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        className="bg-gradient-to-l from-indigo-900 to-gray-900 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-white text-center transform transition-transform duration-300 hover:scale-105 cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        onClick={stat.onClick ? stat.onClick : undefined}
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

export default EmployeeDashboard;
