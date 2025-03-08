import { useEffect, useState } from "react";
import { fetchWorkReportManager, approveWorkReport, rejectWorkReport, WorkReport } from "../../services/workreportService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const WorkReportM = () => {
    const navigate = useNavigate();
    const [workReports, setWorkReports] = useState<WorkReport[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const data = await fetchWorkReportManager();
                setWorkReports(data);
            } catch (err) {
                setError("Failed to fetch work reports");
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const handleViewClick = (id: string) => {
        navigate(`/manager/workreports/${id}`);
    };

    const handleApprove = async (id: string) => {
        if (!id) return;
        setIsSubmitting(true);
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
            setIsSubmitting(false);
        }
    };

    const handleReject = async (id: string) => {
        if (!id) return;
        setIsSubmitting(true);
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
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white text-center sm:text-left">Department Work Reports</h1>
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
                                    <th className="px-3 py-2 text-left whitespace-nowrap">Date</th>
                                    <th className="px-3 py-2 text-left whitespace-nowrap">Status</th>
                                    <th className="px-3 py-2 text-center whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workReports.length > 0 ? (
                                    workReports.map((report) => (
                                        <tr key={report._id} className="border-t border-gray-700 hover:bg-blue-950 transition">
                                            <td className="px-2 py-3 text-sm md:text-base">{report.employeeName}</td>
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
                                                        className={`bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs md:text-sm transition ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                                        onClick={() => handleApprove(report._id)}
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? 'Approving...' : 'Approve'}
                                                    </button>
                                                    <button
                                                        className={`bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs md:text-sm transition ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                                        onClick={() => handleReject(report._id)}
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? 'Rejecting...' : 'Reject'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-gray-300">No work reports found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkReportM;
