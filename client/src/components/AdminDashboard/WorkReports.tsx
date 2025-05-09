import { useEffect, useState } from "react";
import { fetchWorkReportAdmin, approveWorkReport, rejectWorkReport, WorkReport } from "../../services/workreportService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Table } from "../common/Table";

const WorkReports = () => {
    const navigate = useNavigate();
    const [workReports, setWorkReports] = useState<WorkReport[]>([]);
    const [filteredReports, setFilteredReports] = useState<WorkReport[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

    // Status and date filter states
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [dateFilter, setDateFilter] = useState<string>("All");
    const [selectedDate, setSelectedDate] = useState<string>("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(7);

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

    const handleViewClick = (id: string) => {
        navigate(`/admin/workreports/${id}`);
    };

    const handleApprove = async (id: string) => {
        setIsSubmitting(prev => ({ ...prev, [id]: true }));
        try {
            const success = await approveWorkReport(id);
            if (success) {
                toast.success("Work report approved successfully!");
                setWorkReports(prevReports => prevReports.map(report =>
                    report._id === id ? { ...report, status: "Approved" } : report
                ));
            } else {
                toast.error("Error approving work report");
            }
        } catch (error) {
            toast.error("Error approving work report");
        } finally {
            setIsSubmitting(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleReject = async (id: string) => {
        setIsSubmitting(prev => ({ ...prev, [id]: true }));
        try {
            const success = await rejectWorkReport(id);
            if (success) {
                toast.success("Work report rejected successfully!");
                setWorkReports(prevReports => prevReports.map(report =>
                    report._id === id ? { ...report, status: "Rejected" } : report
                ));
            } else {
                toast.error("Error rejecting work report");
            }
        } catch (error) {
            toast.error("Error rejecting work report");
        } finally {
            setIsSubmitting(prev => ({ ...prev, [id]: false }));
        }
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle items per page change
    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Calculate pagination data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    // Get only current page items
    const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);

    // Define table columns
    const columns = [
        {
            header: "Employee",
            accessor: (item: WorkReport) => item.employeeName,
        },
        {
            header: "Department",
            accessor: (item: WorkReport) => item.department,
            hideOnMobile: true,
        },
        {
            header: "Date",
            accessor: (item: WorkReport) => new Date(item.date).toLocaleDateString(),
        },
        {
            header: "Status",
            accessor: (item: WorkReport) => (
                <span className={`px-3 py-1 rounded text-xs md:text-sm font-medium ${item.status === "Pending" ? "bg-yellow-900 text-yellow-300" :
                    item.status === "Approved" ? "bg-green-900 text-green-300" :
                        "bg-red-900 text-red-300"
                    }`}>
                    {item.status}
                </span>
            ),
        },
        {
            header: "Actions",
            accessor: (item: WorkReport) => (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs md:text-sm transition"
                        onClick={() => handleViewClick(item._id)}
                    >
                        View
                    </button>
                    {item.status !== "Approved" && (
                        <button
                            className={`bg-green-600 hover:bg-green-700 text-white px-3 py-1 hidden sm:block rounded-md text-xs md:text-sm transition ${isSubmitting[item._id] ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                            onClick={() => handleApprove(item._id)}
                            disabled={isSubmitting[item._id]}
                        >
                            {isSubmitting[item._id] ? 'Approving...' : 'Approve'}
                        </button>
                    )}
                    {item.status !== "Rejected" && (
                        <button
                            className={`bg-red-600 hover:bg-red-700 hidden sm:block text-white px-3 py-1 rounded-md text-xs md:text-sm transition ${isSubmitting[item._id] ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                            onClick={() => handleReject(item._id)}
                            disabled={isSubmitting[item._id]}
                        >
                            {isSubmitting[item._id] ? 'Rejecting...' : 'Reject'}
                        </button>
                    )}
                </div>
            ),
        },
    ];

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
                            className="bg-slate-900 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-slate-900 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                </div>
            </div>

            <Table<WorkReport>
                data={currentItems}
                columns={columns}
                loading={loading}
                error={error || undefined}
                emptyMessage="No work reports found"
                // Pagination props
                pagination={true}
                currentPage={currentPage}
                totalItems={filteredReports.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                showItemsPerPage={true}
                itemsPerPageOptions={[5, 7, 10, 20, 50]}
                onItemsPerPageChange={handleItemsPerPageChange}
                paginationClassName="mt-4"
                rowClassName="border-t border-gray-700 hover:bg-blue-950 transition"
                headerClassName="bg-blue-950 text-sm md:text-base"
            />
        </div>
    );
};

export default WorkReports;