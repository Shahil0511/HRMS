import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchEmployeePayrollData } from "../../../services/adminEmployePayrollServices";
import { FiFilter, FiCheck, FiX, FiClock, FiDollarSign, FiTrendingUp, FiAlertCircle, FiMinusCircle, FiUserCheck, FiUserX } from "react-icons/fi";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addWeeks, addMonths, startOfMonth, endOfMonth } from "date-fns";

interface WorkReport {
    _id: string;
    date: string;
    status: "Approved" | "Pending" | "Rejected";
}

interface Attendance {
    _id: string;
    date: string;
    status: "Present" | "Absent" | "Half Day" | "Leave";
}

interface EmployeeData {
    name: string;
    salary: number;
    workReports: WorkReport[];
    attendance: Attendance[];
    earnings?: number;
    pendingPayroll?: number;
    deductions?: number;
}

const EmployeePayroll = () => {
    const { id } = useParams<{ id: string }>();
    const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"week" | "month">("week");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filterStatus, setFilterStatus] = useState<string>("all");

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
            default:
                return <FiUserX className="text-gray-400" />;
        }
    };

    const filteredDates = dates.filter(date => {
        if (!employeeData?.workReports && !employeeData?.attendance) return false;

        if (filterStatus === "all") return true;

        // Check work reports
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

    const PayrollCard = ({ title, value, icon }: { title: string, value: number | string, icon: React.ReactNode }) => (
        <div className="bg-indigo-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-indigo-600/30">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-indigo-200 text-sm font-medium mb-1">{title}</p>
                    <p className="text-white text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
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

    return (
        <div className="min-h-screen bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex flex-col items-center gap-6">
            <motion.div
                className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-6xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h2 className="text-white text-4xl font-bold">Employee Payroll</h2>

                    <div className="text-white mt-4 md:mt-0 text-right">
                        <p className="text-xl font-medium">{employeeData?.name || "Employee Name"}</p>
                        <p className="text-sm opacity-80">Employee ID: {id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <PayrollCard
                        title="Monthly Salary"
                        value={employeeData?.salary || 0}
                        icon={<FiDollarSign className="text-indigo-200 w-6 h-6" />}
                    />
                    <PayrollCard
                        title="Current Earnings"
                        value={employeeData?.earnings || 0}
                        icon={<FiTrendingUp className="text-indigo-200 w-6 h-6" />}
                    />
                    <PayrollCard
                        title="Pending Payroll"
                        value={employeeData?.pendingPayroll || 0}
                        icon={<FiAlertCircle className="text-indigo-200 w-6 h-6" />}
                    />
                    <PayrollCard
                        title="Deductions"
                        value={employeeData?.deductions || 0}
                        icon={<FiMinusCircle className="text-indigo-200 w-6 h-6" />}
                    />
                </div>

                {/* Work Report and Attendance Section */}
                <div className="bg-indigo-800/30 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-indigo-600/30">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h3 className="text-2xl font-bold text-white">Daily Status</h3>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex bg-indigo-700/50 rounded-lg p-1">
                                <button
                                    className={`px-3 py-1 rounded-md transition-all ${viewMode === "week" ? "bg-indigo-600 text-white" : "text-indigo-200 hover:text-white"}`}
                                    onClick={() => setViewMode("week")}
                                >
                                    Weekly
                                </button>
                                <button
                                    className={`px-3 py-1 rounded-md transition-all ${viewMode === "month" ? "bg-indigo-600 text-white" : "text-indigo-200 hover:text-white"}`}
                                    onClick={() => setViewMode("month")}
                                >
                                    Monthly
                                </button>
                            </div>

                            <div className="flex items-center gap-2 bg-indigo-700/50 rounded-lg px-3 py-1">
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
                                    <option value="not-submitted" className="bg-indigo-800 text-white">Not Submitted</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    className="p-2 rounded-full hover:bg-indigo-700/50 transition-colors"
                                    onClick={handlePrevious}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-200" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                <span className="text-indigo-200 font-medium">
                                    {viewMode === "week"
                                        ? `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
                                        : format(currentDate, 'MMMM yyyy')}
                                </span>

                                <button
                                    className="p-2 rounded-full hover:bg-indigo-700/50 transition-colors"
                                    onClick={handleNext}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-200" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-indigo-600/30">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">Day</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">Work Report</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">Attendance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-600/20">
                                {filteredDates.map((date) => {
                                    const report = employeeData?.workReports?.find(r => isSameDay(new Date(r.date), date));
                                    const attendance = employeeData?.attendance?.find(a => isSameDay(new Date(a.date), date));
                                    const isCurrentMonth = isSameMonth(date, currentDate);

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
                                                                    "text-blue-400"
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
            </motion.div>
        </div>
    );
};

export default EmployeePayroll;