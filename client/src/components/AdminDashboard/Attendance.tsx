import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadAdminAttendance } from "../../store/slices/attendanceSlice";
import { RootState, AppDispatch } from "../../store/store";
import ContentLoader from "react-content-loader";
import { useNavigate } from "react-router-dom";

const AdminAttendance = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>();
    const { adminRecords } = useSelector((state: RootState) => state.attendance);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);  // Loading state
    const itemsPerPage = 6;

    const fetchAttendance = useCallback(() => {
        setLoading(true); // Set loading to true before dispatch
        dispatch(loadAdminAttendance()).finally(() => {
            setLoading(false); // Set loading to false once the data is fetched
        });
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

    const handelClick = (id: string) => {
        navigate(`/admin/attendance/${id}`);
    };


    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 text-white p-6">
            <div className="p-6 w-full max-w-full px-4 md:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-2xl font-semibold">Today's Present Employees (Admin View)</h2>
                </div>
            </div>

            {adminRecords.length === 0 || paginatedRecords.length === 0 ? (
                <div className="text-center text-gray-300 py-4">No employees checked in today.</div>
            ) : (
                <>
                    <div className="flex-1 px-4 md:px-8 pb-6">
                        <div className="bg-gradient-to-b from-gray-900 via-blue-900 to-indigo-900 rounded-2xl shadow-xl overflow-hidden">
                            {/* Scrollable container */}
                            <div className="overflow-x-auto w-full">
                                <table className="w-full border-collapse text-white min-w-max">
                                    <thead className="bg-gray-800">
                                        <tr>
                                            <th className="border border-gray-700 px-4 py-3 text-sm font-medium hidden sm:table-cell">#Id</th>
                                            <th className="border border-gray-700 px-4 py-3 text-sm font-medium">Name</th>
                                            <th className="border border-gray-700 px-4 py-3 text-sm font-medium hidden sm:table-cell">Email</th>
                                            <th className="border border-gray-700 px-4 py-3 text-sm font-medium">Check-in Time</th>
                                            <th className="border border-gray-700 px-4 py-3 text-sm font-medium">Check-out Time</th>
                                            <th className="border border-gray-700 px-4 py-3 text-sm font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading
                                            ? Array.from({ length: itemsPerPage }).map((_, index) => (
                                                <tr key={index} className="bg-gray-900 bg-opacity-50">
                                                    <td className="border border-gray-700 px-4 py-3"><SkeletonLoader /></td>
                                                    <td className="border border-gray-700 px-4 py-3"><SkeletonLoader /></td>
                                                    <td className="border border-gray-700 px-4 py-3 hidden sm:table-cell"><SkeletonLoader /></td>
                                                    <td className="border border-gray-700 px-4 py-3"><SkeletonLoader /></td>
                                                    <td className="border border-gray-700 px-4 py-3"><SkeletonLoader /></td>
                                                    <td className="border border-gray-700 px-4 py-3"><SkeletonLoader /></td>
                                                </tr>
                                            ))
                                            : paginatedRecords.map((record, index) => (
                                                <tr key={record.id || `attendance-${index}`} className="bg-gray-900 bg-opacity-50">
                                                    <td className="border border-gray-700 px-4 py-3 hidden sm:table-cell">
                                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                                    </td>
                                                    <td className="border border-gray-700 px-4 py-3">{record.employeeName || "N/A"}</td>
                                                    <td className="border border-gray-700 px-4 py-3 hidden sm:table-cell">{record.email || "N/A"}</td>
                                                    <td className="border border-gray-700 px-4 py-3">{record.checkIn || "N/A"}</td>
                                                    <td className="border border-gray-700 px-4 py-3">{record.checkOut || "N/A"}</td>
                                                    <td className="border border-gray-700 px-4 py-3">
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handelClick(record.id)} className="bg-green-500 px-2 py-1 rounded hover:bg-green-600">View</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

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
            )}
        </div>
    );
};

// Skeleton Loader Component for Loading State
const SkeletonLoader = () => (
    <ContentLoader
        speed={2}
        width="100%"
        height={20}
        viewBox="0 0 100 20"
        backgroundColor="#374151"
        foregroundColor="#4b5563"
    >
        <rect x="0" y="0" rx="3" ry="3" width="100" height="20" />
    </ContentLoader>
);

export default AdminAttendance;
