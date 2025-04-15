import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchEmployeePayrollData } from "../../../services/adminEmployePayrollServices";
import { FiFilter, FiCheck, FiX, FiClock, FiDollarSign, FiTrendingUp, FiAlertCircle, FiMinusCircle, FiUserCheck, FiUserX, FiPieChart, FiCalendar, FiPrinter, FiDownload } from "react-icons/fi";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addWeeks, addMonths, startOfMonth, endOfMonth, getDaysInMonth } from "date-fns";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FaRupeeSign } from "react-icons/fa";

interface WorkReport {
    _id: string;
    date: string;
    status: "Approved" | "Pending" | "Rejected";
    checkIn?: string;
    checkOut?: string;
}

interface Attendance {
    _id: string;
    date: string;
    status: "Present" | "Absent" | "Half Day" | "Leave" | "Late" | "Early Departure";
    checkIn?: string;
    checkOut?: string;
}

interface EmployeeData {
    name: string;
    salary: number;
    workReports: WorkReport[];
    attendance: Attendance[];
    earnings?: number;
    pendingPayroll?: number;
    deductions?: number;
    totalWorkingDays?: number;
}

interface ChartData {
    name: string;
    value: number;
    color: string;
}

const COLORS = {
    present: "#10B981", // green-500
    absent: "#EF4444", // red-500
    halfDay: "#F59E0B", // yellow-500
    leave: "#3B82F6", // blue-500
    late: "#F97316", // orange-500
    earlyDeparture: "#8B5CF6", // violet-500
    approved: "#10B981", // green-500
    pending: "#F59E0B", // yellow-500
    rejected: "#EF4444", // red-500
    lessWorked: "#6366F1", // indigo-500
    notSubmitted: "#64748B", // slate-500
};

const EmployeePayroll = () => {
    const { id } = useParams<{ id: string }>();
    const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"week" | "month">("month");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [attendanceChartData, setAttendanceChartData] = useState<ChartData[]>([]);
    const [workReportChartData, setWorkReportChartData] = useState<ChartData[]>([]);
    const [productivityChartData, setProductivityChartData] = useState<ChartData[]>([]);

    const MS_PER_MINUTE = 60 * 1000;
    const requiredMinutes = 8 * 60 + 45;

    // Calculate values based on the selected month
    const calculateMonthlyValues = () => {
        if (!employeeData) return { earnings: 0, deductions: 0, validDays: 0, totalWorkingDays: 0 };

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(new Date(year, month));
        const dailyRate = employeeData.salary / daysInMonth;

        // Get valid attendances
        const validAttendances = employeeData.attendance?.filter((entry) => {
            const entryDate = new Date(entry.date);
            if (
                entryDate.getMonth() !== month ||
                entryDate.getFullYear() !== year ||
                entry.status !== "Present" ||
                !entry.checkIn ||
                !entry.checkOut
            ) return false;

            const checkInTime = new Date(entry.checkIn).getTime();
            const checkOutTime = new Date(entry.checkOut).getTime();
            const durationMinutes = (checkOutTime - checkInTime) / MS_PER_MINUTE;

            return durationMinutes >= requiredMinutes;
        });

        // Get approved reports
        const approvedReports = employeeData.workReports?.filter(report => {
            const reportDate = new Date(report.date);
            return reportDate.getMonth() === month &&
                reportDate.getFullYear() === year &&
                report.status === "Approved";
        });

        // Valid days = both present & has approved report
        const validDays = validAttendances.filter((att) =>
            approvedReports.some((report) =>
                new Date(report.date).toDateString() === new Date(att.date).toDateString()
            )
        ).length;

        const totalWorkingDays = daysInMonth; // Assume all are working days for now

        const paidLeave = 4;
        const paidDays = Math.min(validDays + paidLeave, totalWorkingDays); // Don't exceed total days

        const earnings = paidDays * dailyRate;
        const deductions = employeeData.salary - earnings;

        return { earnings, deductions, validDays, totalWorkingDays };
    };


    const calculateChartData = () => {
        if (!employeeData) return;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Count different attendance statuses for the selected month
        const attendanceCounts = {
            present: 0,
            absent: 0,
            halfDay: 0,
            leave: 0,
            late: 0,
            earlyDeparture: 0,
            lessWorked: 0
        };

        // Count different work report statuses for the selected month
        const workReportCounts = {
            approved: 0,
            pending: 0,
            rejected: 0,
            notSubmitted: 0
        };

        // Productivity metrics
        const productivityCounts = {
            productive: 0,
            average: 0,
            low: 0
        };

        // Get all days in the month
        const start = startOfMonth(new Date(year, month));
        const end = endOfMonth(new Date(year, month));
        const daysInMonth = eachDayOfInterval({ start, end });

        // Initialize not submitted count
        workReportCounts.notSubmitted = daysInMonth.length;

        // Process attendance data
        employeeData.attendance.forEach(entry => {
            const entryDate = new Date(entry.date);
            if (entryDate.getMonth() !== month || entryDate.getFullYear() !== year) return;

            switch (entry.status) {
                case "Present":
                    attendanceCounts.present++;
                    break;
                case "Absent":
                    attendanceCounts.absent++;
                    break;
                case "Half Day":
                    attendanceCounts.halfDay++;
                    break;
                case "Leave":
                    attendanceCounts.leave++;
                    break;
                case "Late":
                    attendanceCounts.late++;
                    break;
                case "Early Departure":
                    attendanceCounts.earlyDeparture++;
                    break;
            }

            // Check for less worked days
            if (entry.checkIn && entry.checkOut) {
                const checkInTime = new Date(entry.checkIn).getTime();
                const checkOutTime = new Date(entry.checkOut).getTime();
                const durationMinutes = (checkOutTime - checkInTime) / MS_PER_MINUTE;

                if (durationMinutes < requiredMinutes) {
                    attendanceCounts.lessWorked++;
                }
            }
        });

        // Process work report data
        employeeData.workReports.forEach(report => {
            const reportDate = new Date(report.date);
            if (reportDate.getMonth() !== month || reportDate.getFullYear() !== year) return;

            workReportCounts.notSubmitted--;

            switch (report.status) {
                case "Approved":
                    workReportCounts.approved++;
                    break;
                case "Pending":
                    workReportCounts.pending++;
                    break;
                case "Rejected":
                    workReportCounts.rejected++;
                    break;
            }
        });

        // Calculate productivity metrics (simplified example)
        const totalReports = workReportCounts.approved + workReportCounts.pending + workReportCounts.rejected;
        if (totalReports > 0) {
            productivityCounts.productive = Math.floor((workReportCounts.approved / totalReports) * 100);
            productivityCounts.average = Math.floor((workReportCounts.pending / totalReports) * 100);
            productivityCounts.low = Math.floor((workReportCounts.rejected / totalReports) * 100);
        }

        // Convert to chart data format
        const attendanceData: ChartData[] = [
            { name: "Present", value: attendanceCounts.present, color: COLORS.present },
            { name: "Absent", value: attendanceCounts.absent, color: COLORS.absent },
            { name: "Half Day", value: attendanceCounts.halfDay, color: COLORS.halfDay },
            { name: "Leave", value: attendanceCounts.leave, color: COLORS.leave },
            { name: "Late", value: attendanceCounts.late, color: COLORS.late },
            { name: "Early Departure", value: attendanceCounts.earlyDeparture, color: COLORS.earlyDeparture },
            { name: "Less Worked", value: attendanceCounts.lessWorked, color: COLORS.lessWorked }
        ].filter(item => item.value > 0);

        const workReportData: ChartData[] = [
            { name: "Approved", value: workReportCounts.approved, color: COLORS.approved },
            { name: "Pending", value: workReportCounts.pending, color: COLORS.pending },
            { name: "Rejected", value: workReportCounts.rejected, color: COLORS.rejected },
            { name: "Not Submitted", value: workReportCounts.notSubmitted, color: COLORS.notSubmitted }
        ].filter(item => item.value > 0);

        const productivityData: ChartData[] = [
            { name: "Productive", value: productivityCounts.productive, color: "#10B981" },
            { name: "Average", value: productivityCounts.average, color: "#F59E0B" },
            { name: "Low", value: productivityCounts.low, color: "#EF4444" }
        ].filter(item => item.value > 0);

        setAttendanceChartData(attendanceData);
        setWorkReportChartData(workReportData);
        setProductivityChartData(productivityData);
    };

    const { earnings, deductions } = calculateMonthlyValues();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (id) {
                    const response = await fetchEmployeePayrollData(id);
                    if (response) {
                        setEmployeeData(response);
                    } else {
                        setError("Failed to load employee data");
                    }
                }
            } catch (err) {
                console.error("Error fetching employee data:", err);
                setError("An error occurred while fetching employee data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Recalculate when date or employee data changes
    useEffect(() => {
        if (employeeData) {
            const { earnings, deductions, totalWorkingDays } = calculateMonthlyValues();

            setEmployeeData(prevData => ({
                ...prevData!,
                earnings,
                deductions,
                totalWorkingDays
            }));

            calculateChartData();
        }
    }, [currentDate, employeeData?.workReports, employeeData?.attendance]);

    const getDateRange = () => {
        if (viewMode === "week") {
            return {
                start: startOfWeek(currentDate),
                end: endOfWeek(currentDate)
            };
        } else {
            return {
                start: startOfMonth(currentDate),
                end: endOfMonth(currentDate)
            };
        }
    };

    const { start, end } = getDateRange();
    const dates = eachDayOfInterval({ start, end });

    const handlePrevious = () => {
        if (viewMode === "week") {
            setCurrentDate(addWeeks(currentDate, -1));
        } else {
            setCurrentDate(addMonths(currentDate, -1));
        }
    };

    const handleNext = () => {
        if (viewMode === "week") {
            setCurrentDate(addWeeks(currentDate, 1));
        } else {
            setCurrentDate(addMonths(currentDate, 1));
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Approved":
                return <FiCheck className="text-green-400" />;
            case "Pending":
                return <FiClock className="text-yellow-400" />;
            case "Rejected":
                return <FiX className="text-red-400" />;
            default:
                return null;
        }
    };

    const getAttendanceIcon = (status: string) => {
        switch (status) {
            case "Present":
                return <FiUserCheck className="text-green-400" />;
            case "Absent":
                return <FiUserX className="text-red-400" />;
            case "Half Day":
                return <FiUserCheck className="text-yellow-400" />;
            case "Leave":
                return <FiClock className="text-blue-400" />;
            case "Late":
                return <FiClock className="text-orange-400" />;
            case "Early Departure":
                return <FiClock className="text-violet-400" />;
            default:
                return <FiUserX className="text-gray-400" />;
        }
    };

    const filteredDates = dates.filter(date => {
        if (!employeeData?.workReports && !employeeData?.attendance) return false;

        if (filterStatus === "all") return true;

        const report = employeeData?.workReports?.find(r => isSameDay(new Date(r.date), date));
        const attendance = employeeData?.attendance?.find(a => isSameDay(new Date(a.date), date));

        if (filterStatus === "not-submitted") {
            return !report && !attendance;
        }

        return (
            (report && report.status.toLowerCase() === filterStatus) ||
            (attendance && attendance.status.toLowerCase() === filterStatus)
        );
    });

    const PayrollCard = ({ title, value, icon, trend, trendValue }: { title: string, value: number | string, icon: React.ReactNode, trend?: 'up' | 'down' | 'neutral', trendValue?: string }) => (
        <div className="bg-indigo-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-indigo-600/30">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-indigo-200 text-sm font-medium mb-1">{title}</p>
                    <p className="text-white text-2xl font-bold">{typeof value === 'number' ? `₹${value.toLocaleString()}` : value}</p>
                    {trend && trendValue && (
                        <div className={`flex items-center mt-2 text-xs ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-indigo-300'}`}>
                            {trend === 'up' ? (
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            ) : trend === 'down' ? (
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            )}
                            {trendValue}
                        </div>
                    )}
                </div>
                <div className="bg-indigo-700/50 p-3 rounded-full">
                    {icon}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-400"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex justify-center items-center">
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg max-w-lg">
                    <p className="font-bold mb-2">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Format the month and year for display
    const currentMonthYear = format(currentDate, 'MMMM yyyy');

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-indigo-900/90 p-4 rounded-lg border border-indigo-600/50 shadow-lg">
                    <p className="font-bold text-indigo-100">{payload[0].name}</p>
                    <p className="text-indigo-200">{`${payload[0].value} ${label === 'Productivity' ? '%' : 'days'}`}</p>
                </div>
            );
        }
        return null;
    };

    // Custom legend for charts
    const renderCustomizedLegend = (props: any) => {
        const { payload } = props;
        return (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
                {payload.map((entry: any, index: number) => (
                    <div key={`legend-${index}`} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs text-indigo-200">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex flex-col items-center gap-6">
            <motion.div
                className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-6xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h2 className="text-white text-4xl font-bold">Employee Payroll Dashboard</h2>

                    <div className="text-white mt-4 md:mt-0 text-right">
                        <p className="text-xl font-medium">{employeeData?.name || "Employee Name"}</p>
                        <p className="text-sm opacity-80">Employee ID: {id}</p>
                    </div>
                </div>

                {/* Month Selector */}
                <div className="bg-indigo-800/30 rounded-xl p-4 mb-6 flex items-center justify-between border border-indigo-600/30">
                    <div className="flex items-center gap-2">
                        <FiCalendar className="text-indigo-300" />
                        <span className="text-indigo-200 font-medium">Viewing Data For:</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePrevious}
                            className="p-2 rounded-full hover:bg-indigo-700/50 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-200" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <span className="text-indigo-100 font-medium text-lg">
                            {currentMonthYear}
                        </span>
                        <button
                            onClick={handleNext}
                            className="p-2 rounded-full hover:bg-indigo-700/50 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-200" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex bg-indigo-700/50 rounded-lg p-1">
                        <button
                            className={`px-3 py-1 rounded-md transition-all ${viewMode === "week" ? "bg-indigo-600 text-white" : "text-indigo-200 hover:text-white"}`}
                            onClick={() => setViewMode("week")}
                        >
                            Weekly View
                        </button>
                        <button
                            className={`px-3 py-1 rounded-md transition-all ${viewMode === "month" ? "bg-indigo-600 text-white" : "text-indigo-200 hover:text-white"}`}
                            onClick={() => setViewMode("month")}
                        >
                            Monthly View
                        </button>
                    </div>
                </div>

                {/* Payroll Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <PayrollCard
                        title="Monthly Salary"
                        value={employeeData?.salary || 0}
                        icon={<FiDollarSign className="text-indigo-200 w-6 h-6" />}
                        trend="up"
                        trendValue="+2.5% from last month"
                    />
                    <PayrollCard
                        title={`${format(currentDate, 'MMMM')} Earnings`}
                        value={earnings}
                        icon={<FiTrendingUp className="text-indigo-200 w-6 h-6" />}
                        trend={earnings > (employeeData?.salary || 0) * 0.8 ? "up" : "down"}
                        trendValue={earnings > (employeeData?.salary || 0) * 0.8 ? "+5.2%" : "-3.8%"}
                    />
                    <PayrollCard
                        title="Pending Payroll"
                        value={employeeData?.pendingPayroll || 0}
                        icon={<FiAlertCircle className="text-indigo-200 w-6 h-6" />}
                        trend="neutral"
                        trendValue="No change"
                    />
                    <PayrollCard
                        title={`${format(currentDate, 'MMMM')} Deductions`}
                        value={deductions}
                        icon={<FiMinusCircle className="text-indigo-200 w-6 h-6" />}
                        trend={deductions < (employeeData?.salary || 0) * 0.2 ? "down" : "up"}
                        trendValue={deductions < (employeeData?.salary || 0) * 0.2 ? "-1.5%" : "+2.3%"}
                    />
                </div>

                {/* Charts Section */}
                <div className="bg-indigo-800/30 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-indigo-600/30 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FiPieChart className="text-indigo-300" />
                            Monthly Analytics
                        </h3>
                        <div className="flex items-center gap-2 bg-indigo-700/50 rounded-lg px-3 py-1 mt-4 md:mt-0">
                            <FiFilter className="text-indigo-200" />
                            <select
                                className="bg-transparent outline-none text-indigo-200 appearance-none"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all" className="bg-indigo-800 text-white">All Status</option>
                                <option value="approved" className="bg-indigo-800 text-white">Approved Reports</option>
                                <option value="pending" className="bg-indigo-800 text-white">Pending Reports</option>
                                <option value="rejected" className="bg-indigo-800 text-white">Rejected Reports</option>
                                <option value="present" className="bg-indigo-800 text-white">Present</option>
                                <option value="absent" className="bg-indigo-800 text-white">Absent</option>
                                <option value="half day" className="bg-indigo-800 text-white">Half Day</option>
                                <option value="leave" className="bg-indigo-800 text-white">Leave</option>
                                <option value="late" className="bg-indigo-800 text-white">Late</option>
                                <option value="early departure" className="bg-indigo-800 text-white">Early Departure</option>
                                <option value="not-submitted" className="bg-indigo-800 text-white">Not Submitted</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Attendance Chart */}
                        <div className="bg-indigo-800/20 p-4 rounded-lg border border-indigo-600/20">
                            <h4 className="text-indigo-200 font-medium mb-4 text-center">Attendance Distribution</h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={attendanceChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            animationDuration={1000}
                                            animationEasing="ease-out"
                                        >
                                            {attendanceChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="#1E1B4B" strokeWidth={1} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend content={renderCustomizedLegend} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Work Report Chart */}
                        <div className="bg-indigo-800/20 p-4 rounded-lg border border-indigo-600/20">
                            <h4 className="text-indigo-200 font-medium mb-4 text-center">Work Report Status</h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={workReportChartData}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                        barSize={30}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: '#94A3B8', fontSize: 12 }}
                                            axisLine={{ stroke: '#4B5563' }}
                                        />
                                        <YAxis
                                            tick={{ fill: '#94A3B8', fontSize: 12 }}
                                            axisLine={{ stroke: '#4B5563' }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar
                                            dataKey="value"
                                            radius={[4, 4, 0, 0]}
                                            animationDuration={1500}
                                        >
                                            {workReportChartData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                    stroke="#1E1B4B"
                                                    strokeWidth={1}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Productivity Chart */}
                        <div className="bg-indigo-800/20 p-4 rounded-lg border border-indigo-600/20">
                            <h4 className="text-indigo-200 font-medium mb-4 text-center">Productivity Metrics</h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={productivityChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            animationDuration={1200}
                                            animationEasing="ease-in-out"
                                        >
                                            {productivityChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="#1E1B4B" strokeWidth={1} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip label="Productivity" />} />
                                        <Legend content={renderCustomizedLegend} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daily Status Table */}
                <div className="bg-indigo-800/30 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-indigo-600/30">
                    <h3 className="text-2xl font-bold text-white mb-6">Daily Status Records</h3>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-indigo-600/30">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">Day</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">Work Report</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">Attendance</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">Hours</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-600/20">
                                {filteredDates.map((date) => {
                                    const report = employeeData?.workReports?.find(r => isSameDay(new Date(r.date), date));
                                    const attendance = employeeData?.attendance?.find(a => isSameDay(new Date(a.date), date));
                                    const isCurrentMonth = isSameMonth(date, currentDate);

                                    // Calculate hours worked if available
                                    let hoursWorked = "N/A";
                                    if (attendance?.checkIn && attendance?.checkOut) {
                                        const checkIn = new Date(attendance.checkIn);
                                        const checkOut = new Date(attendance.checkOut);
                                        const diffMs = checkOut.getTime() - checkIn.getTime();
                                        const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
                                        const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
                                        hoursWorked = `${diffHrs}h ${diffMins}m`;
                                    }

                                    return (
                                        <tr key={date.toString()} className={`transition-all hover:bg-indigo-700/20 ${!isCurrentMonth ? "opacity-50" : ""}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-200">
                                                {format(date, 'yyyy-MM-dd')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-300">
                                                {format(date, 'EEEE')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {report ? (
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(report.status)}
                                                        <span className={`capitalize ${report.status === "Approved" ? "text-green-400" :
                                                            report.status === "Pending" ? "text-yellow-400" :
                                                                "text-red-400"
                                                            }`}>
                                                            {report.status.toLowerCase()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="text-indigo-400/60 flex items-center gap-2">
                                                        <FiX className="text-indigo-400/60" />
                                                        Not Submitted
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {attendance ? (
                                                    <div className="flex items-center gap-2">
                                                        {getAttendanceIcon(attendance.status)}
                                                        <span className={`capitalize ${attendance.status === "Present" ? "text-green-400" :
                                                            attendance.status === "Absent" ? "text-red-400" :
                                                                attendance.status === "Half Day" ? "text-yellow-400" :
                                                                    attendance.status === "Leave" ? "text-blue-400" :
                                                                        attendance.status === "Late" ? "text-orange-400" :
                                                                            "text-violet-400"
                                                            }`}>
                                                            {attendance.status.toLowerCase()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="text-indigo-400/60 flex items-center gap-2">
                                                        <FiX className="text-indigo-400/60" />
                                                        Not Recorded
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-200">
                                                {hoursWorked}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredDates.length === 0 && (
                        <div className="text-center py-12 text-indigo-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-700/30 mb-4">
                                <FiFilter className="w-8 h-8 text-indigo-300" />
                            </div>
                            <p className="text-xl">No records found matching your filters</p>
                            <p className="text-indigo-400 mt-2">Try changing your filter criteria or date range</p>
                        </div>
                    )}
                </div>

                {/* Payroll Actions */}
                <div className="mt-8 flex flex-wrap justify-between items-center gap-4">
                    <div className="text-indigo-300 text-sm">
                        Showing data for {format(start, 'MMM d, yyyy')} to {format(end, 'MMM d, yyyy')}
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
                            <FiDownload />
                            Export Data
                        </button>
                        <button className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
                            <FiPrinter />
                            Print Report
                        </button>
                        <button className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2">
                            <FaRupeeSign />
                            Process Payroll
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EmployeePayroll;