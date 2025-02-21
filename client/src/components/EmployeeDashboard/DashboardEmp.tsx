import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from "framer-motion";
import { FaUserCheck, FaUserTimes, FaClipboardList, FaCalendarDay, FaUser, FaMoneyBillWave, FaExclamationCircle, FaEllipsisH } from "react-icons/fa";
import moment from 'moment';

interface AttendanceItem {
    status: string;
    date: string;
    // Add other properties if necessary (like checkIn, checkOut, etc.)
}

const EmployeeDashboard = () => {
    const [attendanceData, setAttendanceData] = useState({
        totalAttendance: 0,
        totalAbsent: 0,
        leavesTaken: 0,
        complaints: 0,
    });

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const token = localStorage.getItem('token'); // Retrieve token from localStorage or Redux
                if (!token) {
                    console.error("No token found. User is not authenticated.");
                    return;
                }

                // Fetch attendance data from the API with token in headers
                const response = await axios.get('http://localhost:8000/api/attendance/total-attendance', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    }
                });

                const data = response.data as AttendanceItem[]; // Assert that the response data is of type AttendanceItem[]
                console.log(data);

                // Group the data by date and count attendance as 1 per day
                const groupedByDate = data.reduce((acc: Record<string, AttendanceItem>, curr: AttendanceItem) => {
                    const date = moment(curr.date).format("YYYY-MM-DD"); // Format the date to ignore time
                    if (!acc[date]) {
                        acc[date] = { ...curr, status: curr.status }; // Take the first status of the day
                    }
                    return acc;
                }, {});

                const uniqueAttendance = Object.values(groupedByDate); // Extract unique attendance

                // Calculate attendance statistics
                const totalAttendance = uniqueAttendance.filter((item: AttendanceItem) => item.status === 'Present').length;
                const totalAbsent = uniqueAttendance.filter((item: AttendanceItem) => item.status === 'Absent').length;
                const leavesTaken = uniqueAttendance.filter((item: AttendanceItem) => item.status === 'Leave').length;  // Assuming 'Leave' as a status for leaves taken
                const complaints = 0;  // Placeholder, you can fetch complaints data similarly

                setAttendanceData({
                    totalAttendance,
                    totalAbsent,
                    leavesTaken,
                    complaints,
                });
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
        { label: "Profile", value: "View", icon: <FaUser /> },
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

export default EmployeeDashboard;
