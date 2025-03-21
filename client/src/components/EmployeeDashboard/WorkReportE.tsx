import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWorkReports, WorkReport } from '../../services/workreportService';

const WorkReportE = () => {
    const navigate = useNavigate();
    const [reportHistory, setReportHistory] = useState<WorkReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const loadReports = async () => {
            try {
                setIsLoading(true);
                const data = await fetchWorkReports();
                if (Array.isArray(data)) {
                    setReportHistory(data.reverse());
                } else {
                    setReportHistory([]);
                    console.error("Unexpected API response format:", data);
                }
                setError(null);
            } catch (err) {
                setError("Failed to load reports. Please try again later.");
                setReportHistory([]);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadReports();
    }, []);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(reportHistory.length / itemsPerPage)));
    };

    const handleAddWorkReportClick = () => {
        navigate('/employee/workreports/add-work-report');
    };

    const handleEditClick = (reportId: string) => {
        navigate(`/employee/workreports/edit/${reportId}`);
    };

    const handleViewClick = (reportId: string) => {
        navigate(`/employee/workreports/view/${reportId}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const paginatedReports = reportHistory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 px-6 py-2">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">Work Reports</h1>
                <button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                    onClick={handleAddWorkReportClick}
                >
                    Add Work Report
                </button>
            </div>

            <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 text-white py-4 px-4 rounded-md shadow-md">
                <h2 className="text-xl font-semibold mb-4">Work Report Submission History</h2>

                {isLoading ? (
                    <div className="text-center py-8">
                        <p>Loading reports...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-400">
                        <p>{error}</p>
                    </div>
                ) : reportHistory.length === 0 ? (
                    <div className="text-center py-8">
                        <p>No reports found. Create your first work report.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className="bg-blue-950">
                                        <th className="px-4 py-2 text-left">ID</th>
                                        <th className="px-4 py-2 text-left sm:table-cell hidden">Name</th>
                                        <th className="px-4 py-2 text-left">Date</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedReports.map((report) => (
                                        <tr key={report._id} className="border-t border-gray-700 hover:bg-blue-950 transition-colors">
                                            <td className="px-4 py-3">{report._id.substring(report._id.length - 6)}</td>
                                            <td className="px-4 py-3 sm:table-cell hidden">{report.employeeName}</td>
                                            <td className="px-4 py-3">{formatDate(report.createdAt)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${report.status === 'Approved'
                                                    ? "bg-green-900 text-green-300"
                                                    : report.status === 'Rejected'
                                                        ? "bg-red-900 text-red-300"
                                                        : "bg-yellow-900 text-yellow-300"
                                                    }`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className='px-4 py-3'>
                                                <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                                                    <button
                                                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md text-xs md:text-sm transition"
                                                        onClick={() => handleEditClick(report._id)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs md:text-sm transition"
                                                        onClick={() => handleViewClick(report._id)}
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {reportHistory.length > itemsPerPage && (
                            <div className="flex flex-wrap justify-center gap-2 pt-6">
                                <button
                                    onClick={handlePrevPage}
                                    className={`px-3 py-1 rounded text-white transition-all ${currentPage === 1
                                        ? "bg-gray-700 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                                        }`}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>

                                {Array.from({ length: Math.ceil(reportHistory.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
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
                                    onClick={handleNextPage}
                                    className={`px-3 py-1 rounded text-white transition-all ${currentPage === Math.ceil(reportHistory.length / itemsPerPage)
                                        ? "bg-gray-700 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                                        }`}
                                    disabled={currentPage === Math.ceil(reportHistory.length / itemsPerPage)}
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

export default WorkReportE;
