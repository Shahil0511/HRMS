import { useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface ReportHistory {
    Status: ReactNode;
    Actions: ReactNode;
    id: number;
    name: string;
    date: string;
    report: string;
}

const WorkReportE = () => {
    const navigate = useNavigate();
    const [reportHistory] = useState<ReportHistory[]>([
        {
            id: 1,
            name: 'John Doe',
            date: '03-06',
            report: 'work_REPORT_2025-03-06',
            Actions: (
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                    Edit
                </button>
            ),
            Status: <span className="text-green-500">Approved</span>,
        },
        {
            id: 2,
            name: 'Jane Smith',
            date: '03-05',
            report: 'work_REPORT_2025-03-05',
            Actions: (
                <button className="bg-red-500 text-white px-4 py-2 rounded-md">
                    Edit
                </button>
            ),
            Status: <span className="text-red-500">Rejected</span>,
        },
    ]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const filteredEmployees = reportHistory;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredEmployees.length / itemsPerPage)));
    };

    const handleAddWorkReportClick = () => {
        navigate('/employee/workreports/add-work-report');
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 px-6 py-2">
            <div className="flex justify-end mb-2">
                <button className="bg-green-500 text-white px-4 py-2 rounded-md" onClick={handleAddWorkReportClick}>
                    Add Work Report
                </button>
            </div>
            <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 text-white py-4 px-4 rounded-md shadow-md mt-4">
                <h2 className="text-xl font-semibold mb-4">Work Report Submission History</h2>
                <table className="min-w-full table-auto">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left">ID</th>
                            <th className="px-4 py-2 text-left sm:block hidden">Name</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Action</th>
                            <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((report, index) => (
                            <tr key={report.id} className="border-t">
                                <td className="bg-slate-900 p-3">{index + 1}</td>
                                <td className="bg-slate-900 p-5 sm:block hidden">{report.name}</td>
                                <td className="bg-slate-900 p-3">{report.date}</td>
                                <td className="bg-slate-900 p-3">{report.Actions}</td>
                                <td className="bg-slate-900 p-3">{report.Status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredEmployees.length > 0 && (
                    <div className="px-4 md:px-8 pb-6">
                        <div className="flex flex-wrap justify-center gap-2 pt-6">
                            <button
                                onClick={handlePrevPage}
                                className={`px-3 py-1 rounded text-white transform transition-transform duration-300 hover:scale-105 ${currentPage === 1 ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}`}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            {Array.from({ length: Math.ceil(filteredEmployees.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 rounded text-white transform transition-transform duration-300 hover:scale-105 ${page === currentPage ? "bg-indigo-700" : "bg-blue-500 hover:bg-blue-600"}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={handleNextPage}
                                className={`px-3 py-1 rounded text-white transform transition-transform duration-300 hover:scale-105 ${currentPage === Math.ceil(filteredEmployees.length / itemsPerPage) ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}`}
                                disabled={currentPage === Math.ceil(filteredEmployees.length / itemsPerPage)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkReportE;