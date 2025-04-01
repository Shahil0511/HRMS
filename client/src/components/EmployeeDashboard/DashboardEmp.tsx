import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaUserCheck, FaUserTimes, FaClipboardList, FaCalendarDay, FaUser, FaMoneyBillWave, FaExclamationCircle, FaEllipsisH } from "react-icons/fa";
import moment from 'moment';
import attendanceService from "../../services/attendanceServices";
import { useNavigate } from "react-router-dom";
import { fetchWorkReports } from '../../services/workreportService';

interface AttendanceItem {
    status: string;
    date: string;
}

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: any) => state.auth);

    const [attendanceData, setAttendanceData] = useState({
        totalAttendance: 0,
        totalAbsent: 0,
        leavesTaken: 0,
        complaints: 0,
    });
    const [workReport, setWorkReport] = useState(0);

    useEffect(() => {
        const countWorkReports = async () => {
            try {
                const data = await fetchWorkReports();
                const totalData = data.length;
                setWorkReport(totalData);
            } catch (error) {
                console.error("Error fetching work reports:", error);
                setWorkReport(0);
            }
        };
        countWorkReports();
    }, []);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                // 1. Fetch attendance data
                const data = await attendanceService.getEmployeeAttendance();

                // 2. Filter current month's start and end dates
                const currentMonthStart = moment().startOf('month');
                const currentMonthEnd = moment().endOf('month');

                // 3. Group data by date to ensure unique days
                const groupedByDate = data.reduce((acc: Record<string, AttendanceItem>, curr: any) => {
                    const dateKey = moment(curr.date).format('YYYY-MM-DD');
                    if (!acc[dateKey]) {
                        acc[dateKey] = curr;
                    }
                    return acc;
                }, {} as Record<string, AttendanceItem>);

                const uniqueAttendance: AttendanceItem[] = Object.values(groupedByDate);

                // 4. Filter data for the current month
                const currentMonthData = uniqueAttendance.filter((item) => {
                    const itemDate = moment(item.date);
                    return itemDate.isBetween(currentMonthStart, currentMonthEnd, null, '[]');
                });

                // 5. Get all dates in the current month (from the 1st to today)
                const allDatesInMonth: string[] = [];
                let currentDate = currentMonthStart.clone();
                while (currentDate.isSameOrBefore(currentMonthEnd)) {
                    allDatesInMonth.push(currentDate.format('YYYY-MM-DD'));
                    currentDate.add(1, 'day');
                }

                // 6. Create map of existing attendance dates (unique)
                const allUniqueDaysThisMonth = new Set(
                    currentMonthData.map((item) => moment(item.date).format('YYYY-MM-DD'))
                );

                // 7. Calculate present days (only weekdays up to today)
                const totalAttendance = currentMonthData.filter((item) => {
                    const date = moment(item.date);
                    const isPastDate = date.isSameOrBefore(moment(), 'day');
                    return item.status === 'Present' && isPastDate;
                }).length;

                // 8. Calculate missing dates (absent days)
                const missingDatesCount = allDatesInMonth.filter(date => {
                    const momentDate = moment(date);
                    const isPastDate = momentDate.isSameOrBefore(moment(), 'day');
                    return isPastDate && !allUniqueDaysThisMonth.has(date); // Check against unique attendance dates
                }).length;

                // 9. Calculate total absent days (including missing dates)
                const totalAbsent = currentMonthData.filter((item) => item.status === 'Absent').length + missingDatesCount;

                // 10. Calculate leave days
                const leavesTaken = currentMonthData.filter((item) => item.status === 'Leave').length;

                // 11. Update state with attendance data
                setAttendanceData({
                    totalAttendance,
                    totalAbsent,
                    leavesTaken,
                    complaints: 0
                });

            } catch (error) {
                console.error("Error fetching attendance data", error);
            }
        };

        fetchAttendanceData();
    }, []);


    const stats = [
        {
            label: "Total Attendance", value: attendanceData.totalAttendance, icon: <FaUserCheck />, onClick: () => {

                if (user && user.id) {

                    navigate(`/employee/attendance-list`);
                } else {
                    console.log("User ID is undefined");
                    console.error("User ID is undefined");
                }
            }
        },
        {
            label: "Total Absent This Month", value: attendanceData.totalAbsent, icon: <FaUserTimes />, onClick: () => {

                if (user && user.id) {

                    navigate(`/employee/attendance-list`);
                } else {
                    console.log("User ID is undefined");
                    console.error("User ID is undefined");
                }
            }
        },
        {
            label: "Leaves Taken", value: attendanceData.leavesTaken, icon: <FaClipboardList />, onClick: () => {

                if (user && user.id) {

                    navigate(`/employee/leaves`);
                } else {
                    console.log("User ID is undefined");
                    console.error("User ID is undefined");
                }
            }
        },
        {
            label: "Work Reports", value: workReport, icon: <FaCalendarDay />, onClick: () => {

                if (user && user.id) {

                    navigate(`/employee/workreports`);
                } else {
                    console.log("User ID is undefined");
                    console.error("User ID is undefined");
                }
            }
        },
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
        {
            label: "Payroll", value: "$", icon: <FaMoneyBillWave />, onClick: () => {

                if (user && user.id) {

                    navigate(`/employee/payroll`);
                } else {
                    console.log("User ID is undefined");
                    console.error("User ID is undefined");
                }
            }
        },
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
