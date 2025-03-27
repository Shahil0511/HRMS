import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { getEmployeeAttendance } from "../../../services/attendanceServices";
import { fetchWorkReports, WorkReport as APIWorkReport } from "../../../services/workreportService";
import { format, addDays, eachDayOfInterval, isSameDay, parseISO, differenceInMinutes } from "date-fns";

interface AttendanceRecord {
    id: string;
    date: string;
    status: string;
    hoursWorked?: number;
    checkIn?: string;
    checkOut?: string;
}

type WorkReport = APIWorkReport;

const MIN_COMPLETION_MINUTES = 8 * 60 + 45; // 8 hours 45 minutes

interface PayrollTableProps {
    onWorkingDaysCalculated?: (workingDaysData: {
        workingDays: number;
        weekOffs: number;
        fullMonthData: {
            date: string;
            status: string;
            hoursWorked: number;
            completionStatus: string;
        }[];
    }) => void;
}

const PayrollTable: React.FC<PayrollTableProps> = ({ onWorkingDaysCalculated }) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [workReports, setWorkReports] = useState<WorkReport[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
    const [currentDateRange, setCurrentDateRange] = useState<Date>(new Date());

    const itemsPerPage = 7;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [attendanceResponse, workReportsResponse] = await Promise.all([
                    getEmployeeAttendance(),
                    fetchWorkReports()
                ]);

                if (Array.isArray(attendanceResponse)) {
                    setAttendanceData(attendanceResponse);
                } else {
                    throw new Error("Invalid attendance data format");
                }

                if (Array.isArray(workReportsResponse)) {
                    setWorkReports(workReportsResponse);
                } else {
                    throw new Error("Invalid work reports data format");
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const dateRange = useMemo(() => {
        const startDate = new Date(currentDateRange);
        const endDate = new Date(currentDateRange);

        if (viewMode === "weekly") {
            startDate.setDate(startDate.getDate() - startDate.getDay());
            endDate.setDate(startDate.getDate() + 6);
        } else {
            startDate.setDate(1);
            endDate.setMonth(startDate.getMonth() + 1);
            endDate.setDate(0);
        }

        return { startDate, endDate };
    }, [currentDateRange, viewMode]);

    const processedData = useMemo(() => {
        const { startDate, endDate } = dateRange;
        const allDates = eachDayOfInterval({ start: startDate, end: endDate });

        return allDates.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayStr = format(date, 'EEEE');

            const attendanceRecord = attendanceData.find(record =>
                isSameDay(parseISO(record.date), date)
            );

            const workReport = workReports.find(report =>
                isSameDay(parseISO(report.date), date)
            );

            let minutesWorked = 0;
            if (attendanceRecord?.checkIn && attendanceRecord?.checkOut) {
                const start = parseISO(attendanceRecord.checkIn);
                const end = parseISO(attendanceRecord.checkOut);
                minutesWorked = differenceInMinutes(end, start);
            } else if (attendanceRecord?.hoursWorked) {
                minutesWorked = attendanceRecord.hoursWorked * 60;
            }

            const hoursWorked = Math.floor(minutesWorked / 60);
            const remainingMinutes = minutesWorked % 60;
            const hoursDisplay = `${hoursWorked}h ${remainingMinutes}m`;

            let completionStatus = "Not Completed";
            if (attendanceRecord) {
                if (workReport) {
                    if (workReport.status === "Approved" && minutesWorked >= MIN_COMPLETION_MINUTES) {
                        completionStatus = "Completed";
                    } else if (workReport.status === "Approved") {
                        completionStatus = "Partially Completed";
                    } else if (workReport.status === "Pending") {
                        completionStatus = "Pending Approval";
                    } else {
                        completionStatus = "Rejected";
                    }
                } else if (minutesWorked >= MIN_COMPLETION_MINUTES) {
                    completionStatus = "Worked (No Report)";
                } else {
                    completionStatus = "Incomplete";
                }
            }

            return {
                id: dateStr,
                date,
                day: dayStr,
                status: attendanceRecord?.status || "Absent",
                hoursWorked: minutesWorked / 60,
                hoursDisplay,
                isRecorded: !!attendanceRecord,
                hasWorkReport: !!workReport,
                workReportStatus: workReport?.status,
                completionStatus,
                tasks: workReport ?
                    `${workReport.completedTasks} completed` :
                    'No tasks recorded'
            };
        });
    }, [attendanceData, workReports, dateRange]);

    // Calculate working days and week offs
    useEffect(() => {
        if (onWorkingDaysCalculated) {
            // Get the full month data
            const monthStart = new Date(currentDateRange);
            monthStart.setDate(1);
            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            monthEnd.setDate(0);

            const allMonthDates = eachDayOfInterval({ start: monthStart, end: monthEnd });

            const fullMonthData = allMonthDates.map(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const attendanceRecord = attendanceData.find(record =>
                    isSameDay(parseISO(record.date), date)
                );
                const workReport = workReports.find(report =>
                    isSameDay(parseISO(report.date), date)
                );

                let minutesWorked = 0;
                if (attendanceRecord?.checkIn && attendanceRecord?.checkOut) {
                    minutesWorked = differenceInMinutes(
                        parseISO(attendanceRecord.checkOut),
                        parseISO(attendanceRecord.checkIn)
                    );
                } else if (attendanceRecord?.hoursWorked) {
                    minutesWorked = attendanceRecord.hoursWorked * 60;
                }

                let completionStatus = "Not Completed";
                if (attendanceRecord) {
                    if (workReport) {
                        if (workReport.status === "Approved" && minutesWorked >= MIN_COMPLETION_MINUTES) {
                            completionStatus = "Completed";
                        } else if (workReport.status === "Approved") {
                            completionStatus = "Partially Completed";
                        } else if (workReport.status === "Pending") {
                            completionStatus = "Pending Approval";
                        } else {
                            completionStatus = "Rejected";
                        }
                    } else if (minutesWorked >= MIN_COMPLETION_MINUTES) {
                        completionStatus = "Worked (No Report)";
                    } else {
                        completionStatus = "Incomplete";
                    }
                }

                return {
                    date: dateStr,
                    status: attendanceRecord?.status || "Absent",
                    hoursWorked: minutesWorked / 60,
                    completionStatus
                };
            });
            // Calculate working days (must have worked at least 8h45m and work report not rejected)
            const workingDays = fullMonthData.filter(day =>
                day.hoursWorked >= MIN_COMPLETION_MINUTES / 60 &&
                day.completionStatus !== "Rejected"
            ).length;

            // Calculate week offs (1 week off for every 7 days absent)
            const absentDays = fullMonthData.filter(day =>
                day.status === "Absent"
            ).length;
            const weekOffs = Math.floor(absentDays / 7);

            // Send data to parent component
            onWorkingDaysCalculated({
                workingDays,
                weekOffs,
                fullMonthData
            });
        }
    }, [processedData, onWorkingDaysCalculated, currentDateRange, attendanceData, workReports]);


    const totals = useMemo(() => {
        const completedDays = processedData.filter(d =>
            d.completionStatus === "Completed"
        ).length;

        return {
            presentDays: processedData.filter(d => d.status === "Present").length,
            absentDays: processedData.filter(d => d.status === "Absent").length,
            totalHours: processedData.reduce((sum, d) => sum + d.hoursWorked, 0),
            holidays: processedData.filter(d =>
                ["Holiday", "Week Off"].includes(d.status)
            ).length,
            completedDays,
            completionRate: processedData.length > 0
                ? Math.round((completedDays / processedData.length) * 100)
                : 0
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
            case "Pending Approval":
                return "bg-yellow-500";
            case "Partially Completed":
            case "Worked (No Report)":
                return "bg-orange-500";
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-indigo-800/50 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">Present Days</p>
                    <p className="text-white text-2xl font-bold">{totals.presentDays}</p>
                </div>
                <div className="bg-indigo-800/50 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">Completed Days</p>
                    <p className="text-white text-2xl font-bold">{totals.completedDays}</p>
                </div>
                <div className="bg-indigo-800/50 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">Total Hours</p>
                    <p className="text-white text-2xl font-bold">{totals.totalHours.toFixed(1)}</p>
                </div>
                <div className="bg-indigo-800/50 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">Completion Rate</p>
                    <p className="text-white text-2xl font-bold">{totals.completionRate}%</p>
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
                            <th className="py-3 px-4 text-left font-medium">Work Report</th>
                            <th className="py-3 px-4 text-left font-medium">Completion</th>

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
                                    {report.hoursWorked > 0 ? report.hoursDisplay : '-'}
                                </td>
                                <td className="py-3 px-4">
                                    {report.hasWorkReport ? (
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(report.workReportStatus || "")}`}>
                                            {report.workReportStatus}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">Not Submitted</span>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(report.completionStatus)}`}>
                                        {report.completionStatus}
                                    </span>
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
    );
};

export default PayrollTable;