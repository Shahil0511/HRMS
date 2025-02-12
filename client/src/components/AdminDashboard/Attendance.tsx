import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadAdminAttendance } from "../../store/slices/attendanceSlice";
import { RootState, AppDispatch } from "../../store/store";

const AdminAttendance = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { adminRecords, loading, error } = useSelector((state: RootState) => state.attendance);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    const fetchAttendance = useCallback(() => {
        dispatch(loadAdminAttendance());
    }, [dispatch]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(adminRecords.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const paginatedRecords = adminRecords.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="w-full min-h-screen flex flex-col bg-gradient-to-r from-gray-900 to-indigo-900 text-white">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-center md:text-left">
                    Today's Present Employees (Admin View)
                </h2>
            </div>

            <div className="flex-grow flex flex-col">
                {loading ? (
                    <div className="text-center p-4 text-white animate-pulse flex-grow">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 p-4 text-center flex-grow">{error}</div>
                ) : paginatedRecords.length === 0 ? (
                    <div className="text-center p-4 text-gray-400 flex-grow">
                        No employees checked in today.
                    </div>
                ) : (
                    <div className="px-2 flex-grow">
                        <table className="w-full border-collapse border border-gray-300 text-sm">
                            <thead className="bg-gradient-to-l from-gray-900 to-indigo-900 text-white">
                                <tr>
                                    <th className="border border-gray-100 px-4 py-2 hidden sm:table-cell">#Id</th>
                                    <th className="border border-gray-300 px-4 py-2">Name</th>
                                    <th className="border border-gray-100 px-4 py-2 hidden sm:table-cell">Email</th>
                                    <th className="border border-gray-100 px-4 py-2">Check-in Time</th>
                                    <th className="border border-gray-100 px-4 py-2">Check-out Time</th>
                                    <th className="border border-gray-100 px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRecords.map((record, index) => (
                                    <tr
                                        key={index}
                                        className="bg-gradient-to-r from-gray-900 to-indigo-900 text-white"
                                    >
                                        <td className="border border-gray-300 px-4 py-2 hidden sm:table-cell">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {record.employeeName || "N/A"}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 hidden sm:table-cell">
                                            {record.email || "N/A"}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {record.checkIn || "N/A"}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {record.checkOut || "N/A"}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
                                                View Attendance
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {adminRecords.length > 0 && (
                    <div className="flex justify-center mt-4 gap-2 pb-6">
                        <button
                            onClick={handlePrevPage}
                            className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}`}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {Array.from(
                            { length: Math.ceil(adminRecords.length / itemsPerPage) },
                            (_, i) => i + 1
                        ).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 rounded ${page === currentPage ? "bg-indigo-700 text-white" : "bg-blue-500 hover:bg-blue-600"}`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={handleNextPage}
                            className={`px-3 py-1 rounded ${currentPage === Math.ceil(adminRecords.length / itemsPerPage) ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}`}
                            disabled={currentPage === Math.ceil(adminRecords.length / itemsPerPage)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAttendance;
