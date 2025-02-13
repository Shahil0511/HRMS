import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadAdminAttendance } from "../../store/slices/attendanceSlice";
import { RootState, AppDispatch } from "../../store/store";

const AdminAttendance = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { adminRecords } = useSelector((state: RootState) => state.attendance);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    const fetchAttendance = useCallback(() => {
        dispatch(loadAdminAttendance());
    }, [dispatch]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const handlePageChange = (page: number) => setCurrentPage(page);
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
        <div className="min-h-screen bg-gradient-to-r from-indigo-900 to-blue-900 text-white p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold">Today's Present Employees (Admin View)</h2>
            </div>

            {paginatedRecords.length > 0 ? (
                <>
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="border border-gray-100 px-4 py-2 hidden sm:table-cell">#Id</th>
                                <th className="border border-gray-300 px-4 py-2">Name</th>
                                <th className="border border-gray-100 px-4 py-2 hidden sm:table-cell">Email</th>
                                <th className="border border-gray-300 px-4 py-2">Check-in Time</th>
                                <th className="border border-gray-300 px-4 py-2">Check-out Time</th>
                                <th className="border border-gray-300 px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRecords.map((record, index) => (
                                <tr key={record.id || `attendance-${index}`} className="bg-gray-900 bg-opacity-50">
                                    <td className="border border-gray-300 px-4 py-2 hidden sm:table-cell">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">{record.employeeName || "N/A"}</td>
                                    <td className="border border-gray-300 px-4 py-2 hidden sm:table-cell">{record.email || "N/A"}</td>
                                    <td className="border border-gray-300 px-4 py-2">{record.checkIn || "N/A"}</td>
                                    <td className="border border-gray-300 px-4 py-2">{record.checkOut || "N/A"}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <div className="flex gap-2">
                                            <button className="bg-green-500 px-2 py-1 rounded hover:bg-green-600">View</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* PAGINATION BUTTONS */}
                    <div className="flex justify-center mt-4 gap-2 pb-6">
                        <button
                            onClick={handlePrevPage}
                            className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}`}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>

                        {[...Array(Math.ceil(adminRecords.length / itemsPerPage))].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"}`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={handleNextPage}
                            className={`px-3 py-1 rounded ${currentPage === Math.ceil(adminRecords.length / itemsPerPage) ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
                                }`}
                            disabled={currentPage === Math.ceil(adminRecords.length / itemsPerPage)}
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center text-gray-300 py-4">No employees checked in today.</div>
            )}
        </div>
    );



};

export default AdminAttendance;
