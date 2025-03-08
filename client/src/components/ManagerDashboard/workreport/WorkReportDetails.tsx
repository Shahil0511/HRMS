import { useState, useEffect } from 'react';
import { fetchWorkReportById, WorkReport, approveWorkReport, rejectWorkReport } from "../../../services/workreportService";
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function WorkReportDetail() {
    const { id } = useParams<{ id: string }>(); // Get report ID from URL
    const navigate = useNavigate();

    const [formData, setFormData] = useState<WorkReport | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const fetchReport = async () => {
            if (!id) {
                setError("Invalid work report ID");
                return;
            }

            setLoading(true);
            try {
                const data = await fetchWorkReportById(id);

                if (data) {
                    setFormData(data);
                } else {
                    setError("Work report not found");
                }
            } catch (err) {
                console.error("Error fetching work report details:", err);
                setError("Failed to load work report");
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]);

    if (loading) return <p className="text-center text-white">Loading...</p>;
    if (error) return <p className="text-center text-red-400">{error}</p>;

    const handleApprove = async () => {
        if (!id) return;

        setIsSubmitting(true);
        try {
            const success = await approveWorkReport(id);

            if (success) {
                toast.success("Work report approved successfully!");
                navigate("/manager/workreports"); // Redirect after approval
            } else {
                toast.error("Error approving work report");
            }
        } catch (error) {
            toast.error("Error approving work report");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!id) return;

        setIsSubmitting(true);
        try {
            const success = await rejectWorkReport(id);

            if (success) {
                toast.success("Work report rejected successfully!");
                navigate("/manager/workreports"); // Redirect after rejection
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
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 py-3 px-6">
            <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 rounded-lg shadow-xl p-6 max-w-6xl mx-auto">
                <div className="flex items-center mb-6">
                    <div className="bg-blue-600 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Work Report Details</h2>
                </div>

                {formData && (
                    <div className="space-y-6">
                        {/* Employee Information Card */}
                        <div className="bg-indigo-950/50 rounded-lg p-4 shadow-inner">
                            <h3 className="text-lg font-semibold text-blue-300 mb-4 border-b border-blue-800 pb-2">Employee Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-white text-sm font-semibold mb-2">Employee Name</label>
                                    <input
                                        type="text"
                                        value={formData.employeeName}
                                        readOnly
                                        className="shadow appearance-none border border-blue-800 rounded-md w-full py-3 px-3 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white text-sm font-semibold mb-2">Department</label>
                                    <input
                                        type="text"
                                        value={formData.department}
                                        readOnly
                                        className="shadow appearance-none border border-blue-800 rounded-md w-full py-3 px-3 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white text-sm font-semibold mb-2">Designation</label>
                                    <input
                                        type="text"
                                        value={formData.designation}
                                        readOnly
                                        className="shadow appearance-none border border-blue-800 rounded-md w-full py-3 px-3 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white text-sm font-semibold mb-2">Report Date</label>
                                    <input
                                        type="text"
                                        value={formData.date}
                                        readOnly
                                        className="shadow appearance-none border border-blue-800 rounded-md w-full py-3 px-3 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Task Details Card */}
                        <div className="bg-indigo-950/50 rounded-lg p-4 shadow-inner">
                            <h3 className="text-lg font-semibold text-blue-300 mb-4 border-b border-blue-800 pb-2">Task Details</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white text-sm font-semibold mb-2">
                                        <span className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Completed Tasks
                                        </span>
                                    </label>
                                    <textarea
                                        value={formData.completedTasks}
                                        readOnly
                                        className="shadow appearance-none border border-blue-800 rounded-md w-full py-3 px-3 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        rows={4}
                                    />
                                </div>
                                <div>
                                    <label className="block text-white text-sm font-semibold mb-2">
                                        <span className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Ongoing Tasks
                                        </span>
                                    </label>
                                    <textarea
                                        value={formData.ongoingTasks}
                                        readOnly
                                        className="shadow appearance-none border border-blue-800 rounded-md w-full py-3 px-3 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Approve/Reject Buttons */}
                        <div className="flex justify-between items-center pt-4">
                            <button
                                type="button"
                                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                                onClick={() => navigate('/manager/workreports')}
                            >
                                Back
                            </button>
                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    className={`bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    onClick={handleApprove}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Approving...
                                        </>
                                    ) : (
                                        <>Approve</>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className={`bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    onClick={handleReject}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Rejecting...
                                        </>
                                    ) : (
                                        <>Reject</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WorkReportDetail;