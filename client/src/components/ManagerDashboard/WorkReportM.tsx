import { useEffect, useState } from "react";
import { fetchWorkReportManager, WorkReport } from "../../services/workreportService";


const WorkReportM = () => {
    const [workReports, setWorkReports] = useState<WorkReport[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 px-6 py-2">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">Department Work Reports</h1>
            </div>

            {loading ? (
                <p className="text-center text-white">Loading work reports...</p>
            ) : error ? (
                <p className="text-center text-red-400">{error}</p>
            ) : (
                <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 text-white py-4 px-4 rounded-md shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Department Work Reports</h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="bg-blue-950">
                                    <th className="px-4 py-2 text-left">Employee</th>
                                    <th className="px-4 py-2 text-left">Date</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workReports.length > 0 ? (
                                    workReports.map((report) => (
                                        <tr key={report._id} className="border-t border-gray-700 hover:bg-blue-950 transition-colors">
                                            <td className="px-4 py-3">{report.employeeName}</td>
                                            <td className="px-4 py-3">{new Date(report.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${report.status === "Pending" ? "bg-yellow-900 text-yellow-300" :
                                                    report.status === "Approved" ? "bg-green-900 text-green-300" :
                                                        "bg-red-900 text-red-300"
                                                    }`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors">View</button>
                                                <div className="mt-1 space-x-1 inline-flex">
                                                    <button className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md text-xs transition-colors">Approve</button>
                                                    <button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs transition-colors">Reject</button>
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
