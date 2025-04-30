import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LeaveRequest {
    _id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    designation: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    totalLeaveDuration: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
    createdAt: string;
    updatedAt: string;
}

const LeavePageE = () => {
    const navigate = useNavigate();
    const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(leaveHistory.length / itemsPerPage)));
    };

    const handleAddLeaveClick = () => {
        navigate('/employee/leaves/leave-application');
    };

    const handleEditClick = (leaveId: string) => {
        if (!leaveId) return;
        navigate(`/employee/leaves/edit/${leaveId}`);
    };

    const handleViewClick = (leaveId: string) => {
        if (!leaveId) return;
        navigate(`/employee/leaves/view/${leaveId}`);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const paginatedLeaves = leaveHistory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        const fetchLeaveHistory = async () => {
            try {
                const userDataString = localStorage.getItem('user');
                if (!userDataString) {
                    throw new Error('No user data found in localStorage');
                }

                const userData = JSON.parse(userDataString);
                const employeeId = userData._id || userData.id;

                if (!employeeId) {
                    throw new Error('Employee ID not found in user data');
                }

                const response = await axios.get(`http://localhost:8000/api/leave/getLeavesByEmpID/${employeeId}`);
                if (!response.data || !Array.isArray(response.data)) {
                    throw new Error('Invalid response data format');
                }

                // Transform the leave data to ensure proper formatting
                const normalizedLeaves = response.data.map(leave => ({
                    ...leave,
                    _id: leave.id || leave._id, // Convert ObjectId to string
                    employeeId: leave.employeeId?.toString(),
                    startDate: new Date(leave.startDate).toISOString(),
                    endDate: new Date(leave.endDate).toISOString(),
                    createdAt: new Date(leave.createdAt).toISOString(),
                    updatedAt: new Date(leave.updatedAt).toISOString()
                }));



                setLeaveHistory(normalizedLeaves);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching leave history:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch leave history');
                setLoading(false);
            }
        };

        fetchLeaveHistory();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 px-6 py-2 flex items-center justify-center">
                <div className="text-white">Loading leave history...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 px-6 py-2 flex items-center justify-center">
                <div className="text-red-300">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 px-6 py-2">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">Leave Requests</h1>
                <button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                    onClick={handleAddLeaveClick}
                >
                    Apply for Leave
                </button>
            </div>

            <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 text-white py-4 px-4 rounded-md shadow-md">
                <h2 className="text-xl font-semibold mb-4">Leave Request History</h2>

                {leaveHistory.length === 0 ? (
                    <div className="text-center py-8">
                        <p>No leave records found. Apply for leave to get started.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className="bg-blue-950">
                                        <th className="px-4 py-2 text-left">Request ID</th>
                                        <th className="px-4 py-2 text-left sm:table-cell hidden">Employee</th>
                                        <th className="px-4 py-2 text-left">From</th>
                                        <th className="px-4 py-2 text-left">To</th>
                                        <th className="px-4 py-2 text-left">Days</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedLeaves.map((leave) => {
                                        const shortId = leave._id ? leave._id.substring(leave._id.length - 6) : 'N/A';
                                        return (
                                            <tr key={leave._id} className="border-t border-gray-700 hover:bg-blue-950 transition-colors">
                                                <td className="px-4 py-3">{shortId}</td>
                                                <td className="px-4 py-3 sm:table-cell hidden">{leave.employeeName}</td>
                                                <td className="px-4 py-3">{formatDate(leave.startDate)}</td>
                                                <td className="px-4 py-3">{formatDate(leave.endDate)}</td>
                                                <td className="px-4 py-3">{leave.totalLeaveDuration}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${leave.status === 'Approved' ? "bg-green-900 text-green-300" :
                                                        leave.status === 'Rejected' ? "bg-red-900 text-red-300" :
                                                            leave.status === 'Cancelled' ? "bg-gray-700 text-gray-300" :
                                                                "bg-yellow-900 text-yellow-300"
                                                        }`}>
                                                        {leave.status}
                                                    </span>
                                                </td>
                                                <td className='px-4 py-3'>
                                                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                                                        {leave.status === 'Pending' && (
                                                            <button
                                                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md text-xs md:text-sm transition"
                                                                onClick={() => handleEditClick(leave._id)}
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                        <button
                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs md:text-sm transition"
                                                            onClick={() => handleViewClick(leave._id)}
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {leaveHistory.length > itemsPerPage && (
                            <div className="flex flex-wrap justify-center gap-2 pt-6">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded text-white transition-all ${currentPage === 1 ? "bg-gray-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                                        }`}
                                >
                                    Previous
                                </button>

                                {Array.from({ length: Math.ceil(leaveHistory.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-1 rounded text-white transition-all hover:scale-105 ${page === currentPage ? "bg-indigo-700" : "bg-blue-600 hover:bg-blue-700"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === Math.ceil(leaveHistory.length / itemsPerPage)}
                                    className={`px-3 py-1 rounded text-white transition-all ${currentPage === Math.ceil(leaveHistory.length / itemsPerPage)
                                        ? "bg-gray-700 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LeavePageE;