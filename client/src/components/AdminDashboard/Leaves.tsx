import { useEffect, useState } from "react";
import { fetchLeavesAdmin, LeaveRequest } from '../../services/leaveServices';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Table } from "../common/Table";

const Leaves = () => {
    const navigate = useNavigate();
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [filteredLeaves, setFilteredLeaves] = useState<LeaveRequest[]>([]);
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
                const data = await fetchLeavesAdmin();
                setLeaves(data);
                setFilteredLeaves(data);
            } catch (err) {
                setError("Failed to fetch leave requests");
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    // Apply filters whenever filter states change
    useEffect(() => {
        let result = [...leaves];

        // Apply status filter
        if (statusFilter !== "All") {
            result = result.filter(leave => leave.status === statusFilter.toLowerCase());
        }

        // Apply date filter
        if (dateFilter === "Today") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            result = result.filter(leave => {
                const leaveDate = new Date(leave.startDate);
                leaveDate.setHours(0, 0, 0, 0);
                return leaveDate.getTime() === today.getTime();
            });
        } else if (dateFilter === "Yesterday") {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            result = result.filter(leave => {
                const leaveDate = new Date(leave.startDate);
                leaveDate.setHours(0, 0, 0, 0);
                return leaveDate.getTime() === yesterday.getTime();
            });
        } else if (dateFilter === "Custom" && selectedDate) {
            const customDate = new Date(selectedDate);
            customDate.setHours(0, 0, 0, 0);
            result = result.filter(leave => {
                const leaveDate = new Date(leave.startDate);
                leaveDate.setHours(0, 0, 0, 0);
                return leaveDate.getTime() === customDate.getTime();
            });
        }

        setFilteredLeaves(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [statusFilter, dateFilter, selectedDate, leaves]);

    const handleViewClick = (id: string) => {
        navigate(`/admin/leaves/${id}`);
    };

    const handleApprove = async (id: string) => {
        setIsSubmitting(prev => ({ ...prev, [id]: true }));
        try {
            // TODO: Implement approveLeave function in your leaveServices
            // const success = await approveLeave(id);
            // if (success) {
            //     toast.success("Leave request approved successfully!");
            //     setLeaves(prevLeaves => prevLeaves.map(leave =>
            //         leave._id === id ? { ...leave, status: "approved" } : leave
            //     ));
            // } else {
            //     toast.error("Error approving leave request");
            // }
            toast.success("Leave request approved successfully! (Demo)");
        } catch (error) {
            toast.error("Error approving leave request");
        } finally {
            setIsSubmitting(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleReject = async (id: string) => {
        setIsSubmitting(prev => ({ ...prev, [id]: true }));
        try {
            // TODO: Implement rejectLeave function in your leaveServices
            // const success = await rejectLeave(id);
            // if (success) {
            //     toast.success("Leave request rejected successfully!");
            //     setLeaves(prevLeaves => prevLeaves.map(leave =>
            //         leave._id === id ? { ...leave, status: "rejected" } : leave
            //     ));
            // } else {
            //     toast.error("Error rejecting leave request");
            // }
            toast.success("Leave request rejected successfully! (Demo)");
        } catch (error) {
            toast.error("Error rejecting leave request");
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
    const currentItems = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);

    const columns = [
        {
            header: "Employee",
            accessor: (item: LeaveRequest) => item.employeeName,
        },
        {
            header: "Department",
            accessor: (item: LeaveRequest) => item.department,
            hideOnMobile: true,
        },
        {
            header: "Start Date",
            accessor: (item: LeaveRequest) =>
                new Date(item.startDate).toLocaleDateString(),
        },
        {
            header: "End Date",
            accessor: (item: LeaveRequest) =>
                new Date(item.endDate).toLocaleDateString(),
        },
        {
            header: "Total Days",
            accessor: (item: LeaveRequest) => {
                const startDate = new Date(item.startDate)
                const endDate = new Date(item.endDate);
                const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                return totalDays;
            }
        },
        {
            header: "Status",
            accessor: (item: LeaveRequest) => (
                <span
                    className={`px-3 py-1 rounded text-xs md:text-sm font-medium ${item.status === "pending"
                        ? "bg-yellow-900 text-yellow-300"
                        : item.status === "approved"
                            ? "bg-green-900 text-green-300"
                            : "bg-red-900 text-red-300"
                        }`}
                >
                    {item.status}
                </span>
            ),
        },
        {
            header: "Actions",
            accessor: (item: LeaveRequest) => (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs md:text-sm transition"
                        onClick={() => handleViewClick(item._id)}
                    >
                        View
                    </button>
                    {item.status !== "approved" && (
                        <button
                            className={`bg-green-600 hover:bg-green-700 text-white px-3 py-1 hidden sm:block rounded-md text-xs md:text-sm transition ${isSubmitting[item._id] ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                            onClick={() => handleApprove(item._id)}
                            disabled={isSubmitting[item._id]}
                        >
                            {isSubmitting[item._id] ? 'Approving...' : 'Approve'}
                        </button>
                    )}
                    {item.status !== "rejected" && (
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
                <h1 className="text-2xl font-bold text-white text-center sm:text-left">Leave Requests</h1>
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
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
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

            <Table<LeaveRequest>
                data={currentItems}
                columns={columns}
                loading={loading}
                error={error || undefined}
                emptyMessage="No leave requests found"
                // Pagination props
                pagination={true}
                currentPage={currentPage}
                totalItems={filteredLeaves.length}
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

export default Leaves;