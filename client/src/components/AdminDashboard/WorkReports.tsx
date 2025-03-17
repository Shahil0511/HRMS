import { useEffect, useState } from "react";
import { fetchWorkReportAdmin, approveWorkReport, rejectWorkReport, WorkReport } from "../../services/workreportService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const WorkReports = () => {
    const navigate = useNavigate();
    const [workReports, setWorkReports] = useState<WorkReport[]>([]);
    const [filteredReports, setFilteredReports] = useState<WorkReport[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<Map<string, boolean>>(new Map());

    // Status and date filter states
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [dateFilter, setDateFilter] = useState<string>("All");
    const [selectedDate, setSelectedDate] = useState<string>("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(8);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const data = await fetchWorkReportAdmin();
                setWorkReports(data);
                setFilteredReports(data);
            } catch (err) {
                setError("Failed to fetch work reports");
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    // Apply filters whenever filter states change
    useEffect(() => {
        let result = [...workReports];

        // Apply status filter
        if (statusFilter !== "All") {
            result = result.filter(report => report.status === statusFilter);
        }

        // Apply date filter
        if (dateFilter === "Today") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            result = result.filter(report => {
                const reportDate = new Date(report.date);
                reportDate.setHours(0, 0, 0, 0);
                return reportDate.getTime() === today.getTime();
            });
        } else if (dateFilter === "Yesterday") {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            result = result.filter(report => {
                const reportDate = new Date(report.date);
                reportDate.setHours(0, 0, 0, 0);
                return reportDate.getTime() === yesterday.getTime();
            });
        } else if (dateFilter === "Custom" && selectedDate) {
            const customDate = new Date(selectedDate);
            customDate.setHours(0, 0, 0, 0);
            result = result.filter(report => {
                const reportDate = new Date(report.date);
                reportDate.setHours(0, 0, 0, 0);
                return reportDate.getTime() === customDate.getTime();
            });
        }

        setFilteredReports(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [statusFilter, dateFilter, selectedDate, workReports]);

    // Logic for paginated reports
    const indexOfLastReport = currentPage * itemsPerPage;
    const indexOfFirstReport = indexOfLastReport - itemsPerPage;
    const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);

    const handleViewClick = (id: string) => {
        navigate(`/admin/workreports/${id}`);
    };

    const handleApprove = async (id: string) => {
        setIsSubmitting(prev => new Map(prev).set(id, true));
        try {
            const success = await approveWorkReport(id);
            if (success) {
                toast.success("Work report approved successfully!");
                setWorkReports(prevReports => prevReports.map(report => report._id === id ? { ...report, status: "Approved" } : report));
            } else {
                toast.error("Error approving work report");
            }
        } catch (error) {
            toast.error("Error approving work report");
        } finally {
            setIsSubmitting(prev => new Map(prev).set(id, false));
        }
    };

    const handleReject = async (id: string) => {
        setIsSubmitting(prev => new Map(prev).set(id, true));
        try {
            const success = await rejectWorkReport(id);
            if (success) {
                toast.success("Work report rejected successfully!");
                setWorkReports(prevReports => prevReports.map(report => report._id === id ? { ...report, status: "Rejected" } : report));
            } else {
                toast.error("Error rejecting work report");
            }
        } catch (error) {
            toast.error("Error rejecting work report");
        } finally {
            setIsSubmitting(prev => new Map(prev).set(id, false));
        }
    };

    // Pagination Logic
    const pageCount = Math.ceil(filteredReports.length / itemsPerPage);
    const handlePageChange = (page: number) => {
        if (page < 1 || page > pageCount) return;
        setCurrentPage(page);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white text-center sm:text-left">Department Work Reports</h1>
            </div>

            {/* Filter controls */}
            <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 text-white lg:px-6 md:px-6 sm:px-1 py-6 rounded-lg shadow-md my-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    {/* Status filter */}
                    <div className="flex flex-col">

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-900 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Date filter */}
                    <div className="flex flex-col">

                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="bg-slate-950 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All Dates</option>
                            <option value="Today">Today</option>
                            <option value="Yesterday">Yesterday</option>
                            <option value="Custom">Custom Date</option>
                        </select>
                    </div>

                    {/* Calendar input for custom date */}
                    {dateFilter === "Custom" && (
                        <div className="flex flex-col">
                            <label className="text-white text-sm mb-1">Select Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <p className="text-center text-white">Loading work reports...</p>
            ) : error ? (
                <p className="text-center text-red-400">{error}</p>
            ) : (
                <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 text-white lg:px-6 md:px-6 sm:px-1 py-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-center sm:text-left">Department Work Reports</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-blue-950 text-sm md:text-base">
                                    <th className="px-3 py-2 text-left whitespace-nowrap">Employee</th>
                                    <th className="px-3 py-2 text-left whitespace-nowrap hidden sm:table-cell">Department</th>
                                    <th className="px-3 py-2 text-left whitespace-nowrap">Date</th>
                                    <th className="px-3 py-2 text-left whitespace-nowrap">Status</th>
                                    <th className="px-3 py-2 text-center whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentReports.length > 0 ? (
                                    currentReports.map((report) => (
                                        <tr key={report._id} className="border-t border-gray-700 hover:bg-blue-950 transition">
                                            <td className="px-2 py-3 text-sm md:text-base">{report.employeeName}</td>
                                            <td className="px-2 py-3 text-sm md:text-base hidden sm:table-cell">{report.department}</td>
                                            <td className="px-2 py-3 text-sm md:text-base">{new Date(report.date).toLocaleDateString()}</td>
                                            <td className="px-2 py-3">
                                                <span className={`px-3 py-1 rounded text-xs md:text-sm font-medium ${report.status === "Pending" ? "bg-yellow-900 text-yellow-300" :
                                                    report.status === "Approved" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>{report.status}</span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                                                    <button
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs md:text-sm transition"
                                                        onClick={() => handleViewClick(report._id)}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className={`bg-green-600 hover:bg-green-700 text-white px-3 py-1 hidden sm:table-cell rounded-md text-xs md:text-sm transition ${isSubmitting.get(report._id) ? 'opacity-75 cursor-not-allowed' : ''}`}
                                                        onClick={() => handleApprove(report._id)}
                                                        disabled={isSubmitting.get(report._id)}
                                                    >
                                                        {isSubmitting.get(report._id) ? 'Approving...' : 'Approve'}
                                                    </button>
                                                    <button
                                                        className={`bg-red-600 hover:bg-red-700 hidden sm:table-cell text-white px-3 py-1 rounded-md text-xs md:text-sm transition ${isSubmitting.get(report._id) ? 'opacity-75 cursor-not-allowed' : ''}`}
                                                        onClick={() => handleReject(report._id)}
                                                        disabled={isSubmitting.get(report._id)}
                                                    >
                                                        {isSubmitting.get(report._id) ? 'Rejecting...' : 'Reject'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4 text-gray-300">No work reports found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredReports.length > itemsPerPage && (
                        <div className="flex flex-wrap justify-center gap-2 pt-6">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                className={`px-3 py-1 rounded text-white transition-all ${currentPage === 1
                                    ? "bg-gray-700 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                                    }`}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>

                            {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 rounded text-white transition-all hover:scale-105 ${page === currentPage
                                        ? "bg-indigo-700"
                                        : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                className={`px-3 py-1 rounded text-white transition-all ${currentPage === pageCount
                                    ? "bg-gray-700 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                                    }`}
                                disabled={currentPage === pageCount}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkReports;