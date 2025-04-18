import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEmployeeAttendanceForAdmin } from "../../../services/attendanceServices";
import {
    format,
    eachDayOfInterval,
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks,
    isSameDay,
    subMonths,
    startOfMonth,
    endOfMonth,
    addMonths
} from "date-fns";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaChevronLeft,
    FaChevronRight,
    FaFilter,
    FaTimes,
    FaCalendarAlt,
    FaSearch
} from "react-icons/fa";
import { fetchEmployeeById } from "../../../services/employeeServices";

// Types
type AttendanceRecord = {
    _id: string;
    employeeId: string;
    date: string;
    checkIn: string;
    checkOut?: string;
    status: "Present" | "Absent" | "Late" | "Half-Day";
};

type DateRange = "week" | "month" | "custom";

const AdminEmployeeAttendanceView = () => {
    const { id } = useParams();
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [employeeName, setEmployeeName] = useState<string>("Employee");

    // Pagination and date range states
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [dateRangeType, setDateRangeType] = useState<DateRange>("week");
    const [customStartDate, setCustomStartDate] = useState<Date>(subMonths(new Date(), 1));
    const [customEndDate, setCustomEndDate] = useState<Date>(new Date());

    // Filter states
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dayFilter, setDayFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [workTimeFilter, setWorkTimeFilter] = useState<string>("all");
    const [showFilters, setShowFilters] = useState<boolean>(false);

    // Derived date range based on selected range type
    const getDateRange = () => {
        switch (dateRangeType) {
            case "week":
                return {
                    start: currentWeekStart,
                    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
                };
            case "month":
                return {
                    start: startOfMonth(currentWeekStart),
                    end: endOfMonth(currentWeekStart)
                };
            case "custom":
                return {
                    start: customStartDate,
                    end: customEndDate
                };
        }
    };

    // Prepare complete data with absences
    const [displayData, setDisplayData] = useState<AttendanceRecord[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (!id) return;

                // Fetch employee details
                const employee = await fetchEmployeeById(id);
                if (employee?.name) {
                    setEmployeeName(employee.name);
                }

                // Fetch attendance records
                const records = await getEmployeeAttendanceForAdmin(id);
                setAttendanceRecords(records);
            } catch (err: any) {
                setError(err.message || "Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Generate complete data whenever records or date range changes
    useEffect(() => {
        if (!attendanceRecords || loading) return;

        const { start, end } = getDateRange();
        const daysInRange = eachDayOfInterval({ start, end });

        const completeData = daysInRange.map(day => {
            // Find if there's a record for this day
            const existingRecord = attendanceRecords.find(record =>
                isSameDay(new Date(record.date), day)
            );

            if (existingRecord) {
                return existingRecord;
            } else {
                // Create an "absent" record for days without attendance
                return {
                    _id: `absent-${format(day, 'yyyy-MM-dd')}`,
                    employeeId: id || "",
                    date: day.toISOString(),
                    checkIn: "",
                    checkOut: undefined,
                    status: "Absent" as const
                };
            }
        });

        setDisplayData(completeData);
    }, [attendanceRecords, currentWeekStart, dateRangeType, customStartDate, customEndDate, loading, id]);

    // Apply filters to the data
    const filteredData = displayData.filter(record => {
        const recordDate = new Date(record.date);

        // Status filter
        if (statusFilter !== "all" && record.status !== statusFilter) {
            return false;
        }

        // Day filter
        const dayOfWeek = format(recordDate, "EEEE").toLowerCase();
        if (dayFilter !== "all" && dayOfWeek !== dayFilter.toLowerCase()) {
            return false;
        }

        // Search by date
        if (searchTerm) {
            const formattedDate = format(recordDate, "yyyy-MM-dd").toLowerCase();
            if (!formattedDate.includes(searchTerm.toLowerCase())) {
                return false;
            }
        }

        // Work time filter
        if (workTimeFilter !== "all") {
            const checkIn = record.checkIn;
            const checkOut = record.checkOut;

            // Skip the record if no check-in/check-out when filtering by work time
            if (!checkIn || !checkOut) {
                return false;
            }

            // Calculate total work time
            const totalMinutes = Math.floor(
                (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60)
            );
            const hours = totalMinutes / 60;

            switch (workTimeFilter) {
                case "lessThan4":
                    return hours < 4;
                case "4to8":
                    return hours >= 4 && hours <= 8;
                case "moreThan8":
                    return hours > 8;
                default:
                    return true;
            }
        }

        return true;
    });

    // Navigation handlers
    const navigatePrevious = () => {
        if (dateRangeType === "week") {
            setCurrentWeekStart(prevDate => subWeeks(prevDate, 1));
        } else if (dateRangeType === "month") {
            setCurrentWeekStart(prevDate => subMonths(prevDate, 1));
        }
    };

    const navigateNext = () => {
        if (dateRangeType === "week") {
            setCurrentWeekStart(prevDate => addWeeks(prevDate, 1));
        } else if (dateRangeType === "month") {
            setCurrentWeekStart(prevDate => addMonths(prevDate, 1));
        }
    };

    // Reset all filters
    const resetFilters = () => {
        setStatusFilter("all");
        setDayFilter("all");
        setSearchTerm("");
        setWorkTimeFilter("all");
    };

    // Format the date range for display
    const formatDateRange = () => {
        const { start, end } = getDateRange();
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    };

    if (loading) return <div className="text-center p-4 text-white">Loading...</div>;
    if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;

    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-900 via-blue-800 to-slate-900 text-white">
            <div className="mx-auto bg-gradient-to-l from-indigo-900 to-blue-800 text-white p-2 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-center mb-4">{employeeName}'s Attendance Records</h2>

                {/* Search and Filter Controls */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            placeholder="Search by date (YYYY-MM-DD)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-blue-950 border border-blue-700 rounded px-3 py-1 pl-8 text-sm focus:outline-none focus:border-blue-500"
                        />
                        <FaSearch className="absolute left-2 text-blue-400" />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2 text-blue-400 hover:text-blue-300"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm"
                    >
                        <FaFilter className="mr-1" /> {showFilters ? "Hide Filters" : "Show Filters"}
                    </button>
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="mb-4 p-3 bg-blue-950 rounded border border-blue-800">
                        <div className="flex flex-wrap gap-3">
                            <div className="flex flex-col">
                                <label className="text-xs mb-1 text-blue-300">Date Range</label>
                                <select
                                    value={dateRangeType}
                                    onChange={(e) => setDateRangeType(e.target.value as DateRange)}
                                    className="bg-blue-900 border border-blue-700 rounded px-2 py-1 text-sm"
                                >
                                    <option value="week">Weekly</option>
                                    <option value="month">Monthly</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            {dateRangeType === "custom" && (
                                <div className="flex gap-2">
                                    <div className="flex flex-col">
                                        <label className="text-xs mb-1 text-blue-300">From</label>
                                        <input
                                            type="date"
                                            value={format(customStartDate, 'yyyy-MM-dd')}
                                            onChange={(e) => setCustomStartDate(new Date(e.target.value))}
                                            className="bg-blue-900 border border-blue-700 rounded px-2 py-1 text-sm"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-xs mb-1 text-blue-300">To</label>
                                        <input
                                            type="date"
                                            value={format(customEndDate, 'yyyy-MM-dd')}
                                            onChange={(e) => setCustomEndDate(new Date(e.target.value))}
                                            className="bg-blue-900 border border-blue-700 rounded px-2 py-1 text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col">
                                <label className="text-xs mb-1 text-blue-300">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-blue-900 border border-blue-700 rounded px-2 py-1 text-sm"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="Present">Present</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Late">Late</option>
                                    <option value="Half-Day">Half-Day</option>
                                </select>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-xs mb-1 text-blue-300">Day</label>
                                <select
                                    value={dayFilter}
                                    onChange={(e) => setDayFilter(e.target.value)}
                                    className="bg-blue-900 border border-blue-700 rounded px-2 py-1 text-sm"
                                >
                                    <option value="all">All Days</option>
                                    <option value="Monday">Monday</option>
                                    <option value="Tuesday">Tuesday</option>
                                    <option value="Wednesday">Wednesday</option>
                                    <option value="Thursday">Thursday</option>
                                    <option value="Friday">Friday</option>
                                    <option value="Saturday">Saturday</option>
                                    <option value="Sunday">Sunday</option>
                                </select>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-xs mb-1 text-blue-300">Work Hours</label>
                                <select
                                    value={workTimeFilter}
                                    onChange={(e) => setWorkTimeFilter(e.target.value)}
                                    className="bg-blue-900 border border-blue-700 rounded px-2 py-1 text-sm"
                                >
                                    <option value="all">All Hours</option>
                                    <option value="lessThan4">Less than 4h</option>
                                    <option value="4to8">4h to 8h</option>
                                    <option value="moreThan8">More than 8h</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={resetFilters}
                                    className="bg-blue-800 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Date Navigation */}
                <div className="flex justify-between items-center mb-4 px-2">
                    <button
                        onClick={navigatePrevious}
                        className="flex items-center bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm"
                        disabled={dateRangeType === "custom"}
                    >
                        <FaChevronLeft className="mr-1" /> Previous {dateRangeType === "week" ? "Week" : "Month"}
                    </button>

                    <div className="flex items-center text-lg font-medium">
                        <FaCalendarAlt className="mr-2 text-blue-300" />
                        {formatDateRange()}
                    </div>

                    <button
                        onClick={navigateNext}
                        className="flex items-center bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm"
                        disabled={dateRangeType === "custom"}
                    >
                        Next {dateRangeType === "week" ? "Week" : "Month"} <FaChevronRight className="ml-1" />
                    </button>
                </div>

                {/* Results Summary */}
                <div className="mb-4 text-center text-sm">
                    <span className="bg-blue-950 px-3 py-1 rounded">
                        Showing {filteredData.length} records
                        {filteredData.filter(r => r.status === "Present").length > 0 &&
                            ` (${filteredData.filter(r => r.status === "Present").length} present)`}
                        {filteredData.filter(r => r.status === "Absent").length > 0 &&
                            ` (${filteredData.filter(r => r.status === "Absent").length} absent)`}
                    </span>
                </div>

                {/* Attendance Table */}
                <div className="overflow-x-auto rounded-sm">
                    <table className="w-full border border-gray-700 rounded-sm">
                        <thead className="bg-blue-700 text-white">
                            <tr>
                                <th className="border border-gray-200 p-3">#</th>
                                <th className="border border-gray-200 p-3">Date</th>
                                <th className="border border-gray-200 p-3 hidden sm:table-cell">Day</th>
                                <th className="border border-gray-200 p-3">Check In</th>
                                <th className="border border-gray-200 p-3">Check Out</th>
                                <th className="border border-gray-200 p-3">Total Time</th>
                                <th className="border border-gray-200 p-3 sm:hidden">Status</th>
                                <th className="border border-gray-200 p-3 hidden sm:table-cell">Present</th>
                                <th className="border border-gray-200 p-3 hidden sm:table-cell">Absent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((record, index) => {
                                    const checkInTime = record.checkIn ? format(new Date(record.checkIn), "HH:mm:ss") : "-";
                                    const checkOutTime = record.checkOut ? format(new Date(record.checkOut), "HH:mm:ss") : "-";

                                    let totalTime = "-";
                                    if (record.checkIn && record.checkOut) {
                                        const totalMinutes = Math.floor(
                                            (new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime()) / (1000 * 60)
                                        );
                                        const hours = Math.floor(totalMinutes / 60);
                                        const minutes = totalMinutes % 60;
                                        totalTime = `${hours}h ${minutes}m`;
                                    }

                                    return (
                                        <tr key={record._id || index}
                                            className={`text-center hover:bg-blue-800 transition duration-300 ${record.status === "Absent" ? "bg-blue-900/40" :
                                                record.status === "Late" ? "bg-amber-900/20" :
                                                    record.status === "Half-Day" ? "bg-indigo-900/20" : ""
                                                }`}>
                                            <td className="border border-gray-200 p-3">{index + 1}</td>

                                            <td className="border border-gray-200 p-3">
                                                <span className="hidden sm:inline">{format(new Date(record.date), "yyyy-MM-dd")}</span>
                                                <span className="sm:hidden">{format(new Date(record.date), "dd/MM")}</span>
                                            </td>

                                            <td className="border border-gray-200 p-3 hidden sm:table-cell">{format(new Date(record.date), "EEEE")}</td>

                                            <td className="border border-gray-200 p-3">
                                                <span className="hidden sm:inline">{checkInTime}</span>
                                                <span className="sm:hidden">{checkInTime.split(':').slice(0, 2).join(':')}</span>
                                            </td>

                                            <td className="border border-gray-200 p-3">
                                                <span className="hidden sm:inline">{checkOutTime}</span>
                                                <span className="sm:hidden">{checkOutTime.split(':').slice(0, 2).join(':')}</span>
                                            </td>

                                            <td className="border border-gray-200 p-3">
                                                {totalTime}
                                            </td>

                                            <td className="border border-gray-200 p-3 sm:hidden">
                                                {record.status === "Present" ? (
                                                    <FaCheckCircle className="text-green-400 text-xl mx-auto" />
                                                ) : record.status === "Absent" ? (
                                                    <FaTimesCircle className="text-red-500 text-xl mx-auto" />
                                                ) : record.status === "Late" ? (
                                                    <span className="text-amber-400 text-sm font-medium">LATE</span>
                                                ) : record.status === "Half-Day" ? (
                                                    <span className="text-indigo-300 text-sm font-medium">HALF</span>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

                                            <td className="border border-gray-200 p-3 hidden sm:table-cell">
                                                {record.status === "Present" || record.status === "Late" || record.status === "Half-Day" ? (
                                                    <FaCheckCircle className={`text-xl mx-auto ${record.status === "Present" ? "text-green-400" :
                                                        record.status === "Late" ? "text-amber-400" :
                                                            "text-indigo-300"
                                                        }`} />
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

                                            <td className="border border-gray-200 p-3 hidden sm:table-cell">
                                                {record.status === "Absent" ? (
                                                    <FaTimesCircle className="text-red-500 text-xl mx-auto" />
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={9} className="border border-gray-200 p-4 text-center">
                                        No records found matching your filters
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* No results message */}
                {filteredData.length === 0 && (
                    <div className="my-4 text-center bg-blue-950 p-4 rounded">
                        <p>No attendance records found matching your filters.</p>
                        <button
                            onClick={resetFilters}
                            className="mt-2 bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded text-sm"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminEmployeeAttendanceView;