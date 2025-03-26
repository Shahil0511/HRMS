import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { getEmployeeAttendance } from "../../../services/attendanceServices";
import { format, addDays, eachDayOfInterval, isSameDay, parseISO, differenceInHours } from "date-fns";

interface AttendanceRecord {
    id: string;
    date: string;
    status: string;
    hoursWorked?: number;
    checkIn?: string;
    checkOut?: string;
}

const PayrollTable = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
    const [currentDateRange, setCurrentDateRange] = useState<Date>(new Date());

    const itemsPerPage = 7;

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getEmployeeAttendance();
                if (Array.isArray(response)) {
                    setAttendanceData(response);
                } else {
                    setAttendanceData([]);
                    throw new Error("Invalid data format received from server");
                }
            } catch (error) {
                console.error("Error fetching attendance data:", error);
                setError("Failed to load attendance data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    // Calculate date ranges based on view mode
    const dateRange = useMemo(() => {
        const startDate = new Date(currentDateRange);
        const endDate = new Date(currentDateRange);

        if (viewMode === "weekly") {
            // Set to start of week (Sunday)
            startDate.setDate(startDate.getDate() - startDate.getDay());
            endDate.setDate(startDate.getDate() + 6);
        } else {
            // Monthly view
            startDate.setDate(1);
            endDate.setMonth(startDate.getMonth() + 1);
            endDate.setDate(0); // Last day of month
        }

        return { startDate, endDate };
    }, [currentDateRange, viewMode]);

    // Generate all dates in the range and merge with attendance data
    const processedData = useMemo(() => {
        const { startDate, endDate } = dateRange;
        const allDates = eachDayOfInterval({ start: startDate, end: endDate });

        return allDates.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayStr = format(date, 'EEEE');

            // Find matching attendance record
            const record = attendanceData.find(record =>
                isSameDay(parseISO(record.date), date)
            );

            // Calculate hours worked if check-in/out exists
            let hoursWorked = 0;
            if (record?.checkIn && record?.checkOut) {
                const start = parseISO(record.checkIn);
                const end = parseISO(record.checkOut);
                hoursWorked = differenceInHours(end, start);
            } else if (record?.hoursWorked) {
                hoursWorked = record.hoursWorked;
            }

            return {
                id: dateStr,
                date,
                day: dayStr,
                status: record?.status || "Absent",
                hoursWorked,
                isRecorded: !!record
            };
        });
    }, [attendanceData, dateRange]);

    // Calculate totals
    const totals = useMemo(() => {
        return {
            presentDays: processedData.filter(d => d.status === "Present").length,
            absentDays: processedData.filter(d => d.status === "Absent").length,
            totalHours: processedData.reduce((sum, d) => sum + (d.hoursWorked || 0), 0),
            holidays: processedData.filter(d =>
                ["Holiday", "Week Off"].includes(d.status)
            ).length
        };
    }, [processedData]);

    const getPaginatedReports = () => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return processedData.slice(indexOfFirstItem, indexOfLastItem);
    };

    const getTotalPages = () => Math.ceil(processedData.length / itemsPerPage);

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "Present":
            case "Approved":
            case "Completed":
                return "bg-green-500";
            case "Absent":
            case "Rejected":
                return "bg-red-500";
            case "Week Off":
                return "bg-gray-500";
            case "Holiday":
                return "bg-blue-500";
            case "Pending":
                return "bg-yellow-500";
            default:
                return "bg-gray-500";
        }
    };

    const handleDateRangeChange = (direction: "prev" | "next") => {
        const changeValue = viewMode === "weekly" ? 7 : 30;
        setCurrentDateRange(prev =>
            addDays(prev, direction === "prev" ? -changeValue : changeValue)
        );
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
            </div>
        );
    }

    return (
        <div className="w-full">
            <motion.div
                className="w-full max-w-6xl bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 p-8 rounded-2xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="text-white text-2xl font-bold">
                        {viewMode === "weekly" ? "Weekly" : "Monthly"} Attendance Report
                    </h3>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-gray-800 rounded-lg p-1">
                            <button
                                className={`px-3 py-1 rounded-md ${viewMode === "weekly" ? "bg-blue-600 text-white" : "text-gray-300"}`}
                                onClick={() => setViewMode("weekly")}
                            >
                                Weekly
                            </button>
                            <button
                                className={`px-3 py-1 rounded-md ${viewMode === "monthly" ? "bg-blue-600 text-white" : "text-gray-300"}`}
                                onClick={() => setViewMode("monthly")}
                            >
                                Monthly
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                                onClick={() => handleDateRangeChange("prev")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>

                            <span className="text-white text-sm">
                                {format(dateRange.startDate, 'MMM d')} - {format(dateRange.endDate, 'MMM d, yyyy')}
                            </span>

                            <button
                                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                                onClick={() => handleDateRangeChange("next")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-indigo-800/50 p-4 rounded-lg">
                        <p className="text-gray-300 text-sm">Present Days</p>
                        <p className="text-white text-2xl font-bold">{totals.presentDays}</p>
                    </div>
                    <div className="bg-indigo-800/50 p-4 rounded-lg">
                        <p className="text-gray-300 text-sm">Absent Days</p>
                        <p className="text-white text-2xl font-bold">{totals.absentDays}</p>
                    </div>
                    <div className="bg-indigo-800/50 p-4 rounded-lg">
                        <p className="text-gray-300 text-sm">Total Hours</p>
                        <p className="text-white text-2xl font-bold">{totals.totalHours}</p>
                    </div>
                    <div className="bg-indigo-800/50 p-4 rounded-lg">
                        <p className="text-gray-300 text-sm">Holidays/Week Off</p>
                        <p className="text-white text-2xl font-bold">{totals.holidays}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-white">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="py-3 px-4 text-left font-medium">Day</th>
                                <th className="py-3 px-4 text-left font-medium">Date</th>
                                <th className="py-3 px-4 text-left font-medium">Status</th>
                                <th className="py-3 px-4 text-left font-medium">Hours</th>
                                <th className="py-3 px-4 text-left font-medium">Recorded</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getPaginatedReports().map((report) => (
                                <tr
                                    key={report.id}
                                    className={`border-b border-gray-700 transition-colors ${report.isRecorded ? "hover:bg-indigo-800/30" : "opacity-70"
                                        }`}
                                >
                                    <td className="py-3 px-4">{report.day}</td>
                                    <td className="py-3 px-4">{format(report.date, 'MMM d, yyyy')}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(report.status)}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {report.hoursWorked > 0 ? `${report.hoursWorked}h` : '-'}
                                    </td>
                                    <td className="py-3 px-4">
                                        {report.isRecorded ? (
                                            <span className="text-green-400">✓</span>
                                        ) : (
                                            <span className="text-red-400">✗</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {getTotalPages() > 1 && (
                    <div className="mt-6 flex justify-center gap-4">
                        <button
                            className="px-4 py-2 bg-blue-600 rounded-lg text-white disabled:bg-gray-600 disabled:opacity-50 transition-colors"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            Previous
                        </button>
                        <div className="flex items-center text-white">
                            <span>{currentPage} of {getTotalPages()}</span>
                        </div>
                        <button
                            className="px-4 py-2 bg-blue-600 rounded-lg text-white disabled:bg-gray-600 disabled:opacity-50 transition-colors"
                            disabled={currentPage === getTotalPages()}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default PayrollTable;