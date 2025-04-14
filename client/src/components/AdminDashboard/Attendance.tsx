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
    const [loading, setLoading] = useState<boolean>(true);
    const itemsPerPage = 6;

    const fetchAttendance = useCallback(() => {
        setLoading(true);
        dispatch(loadAdminAttendance()).finally(() => {
            setLoading(false);
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
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 text-white p-4 md:p-6">
            <div className="w-full max-w-full px-2 md:px-4 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-4">
                    <h2 className="text-xl md:text-2xl font-semibold">Today's Present Employees</h2>
                </div>
            </div>

            {adminRecords.length === 0 || paginatedRecords.length === 0 ? (
                <div className="text-center text-gray-300 py-4">No employees checked in today.</div>
            ) : (
                <>
                    <div className="flex-1 px-2 md:px-4 lg:px-8 pb-4 md:pb-6">
                        <div className="bg-gradient-to-b from-gray-900 via-blue-900 to-indigo-900 rounded-lg md:rounded-2xl shadow-xl overflow-hidden">
                            <div className="overflow-x-auto w-full">
                                <table className="w-full border-collapse text-white">
                                    <thead className="bg-gray-800">
                                        <tr>
                                            <th className="border border-gray-700 px-2 py-2 text-xs md:text-sm font-medium hidden sm:table-cell">#Id</th>
                                            <th className="border border-gray-700 px-2 py-2 text-xs md:text-sm font-medium">Name</th>
                                            <th className="border border-gray-700 px-2 py-2 text-xs md:text-sm font-medium hidden md:table-cell">Email</th>
                                            <th className="border border-gray-700 px-2 py-2 text-xs md:text-sm font-medium">Check-in</th>
                                            <th className="border border-gray-700 px-2 py-2 text-xs md:text-sm font-medium">Check-out</th>
                                            <th className="border border-gray-700 px-2 py-2 text-xs md:text-sm font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading
                                            ? Array.from({ length: itemsPerPage }).map((_, index) => (
                                                <tr key={index} className="bg-gray-900 bg-opacity-50">
                                                    <td className="border border-gray-700 px-2 py-2"><SkeletonLoader /></td>
                                                    <td className="border border-gray-700 px-2 py-2"><SkeletonLoader /></td>
                                                    <td className="border border-gray-700 px-2 py-2 hidden md:table-cell"><SkeletonLoader /></td>
                                                    <td className="border border-gray-700 px-2 py-2"><SkeletonLoader /></td>
                                                    <td className="border border-gray-700 px-2 py-2 hidden xs:table-cell"><SkeletonLoader /></td>
                                                    <td className="border border-gray-700 px-2 py-2"><SkeletonLoader /></td>
                                                </tr>
                                            ))
                                            : paginatedRecords.map((record, index) => (
                                                <tr key={record.id || `attendance-${index}`} className="bg-gray-900 bg-opacity-50 hover:bg-gray-800 transition-colors">
                                                    <td className="border border-gray-700 px-2 py-2 text-xs md:text-sm hidden sm:table-cell">
                                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                                    </td>
                                                    <td className="border border-gray-700 px-2 py-2 text-xs md:text-sm">{record.employeeName || "N/A"}</td>
                                                    <td className="border border-gray-700 px-2 py-2 text-xs md:text-sm hidden md:table-cell truncate max-w-[120px] lg:max-w-none">
                                                        {record.email || "N/A"}
                                                    </td>
                                                    <td className="border border-gray-700 px-2 py-2 text-xs md:text-sm">
                                                        {record.checkIn || "N/A"}
                                                    </td>
                                                    <td className="border border-gray-700 px-2 py-2 text-xs md:text-sm xs:table-cell">
                                                        {record.checkOut || "N/A"}
                                                    </td>
                                                    <td className="border border-gray-700 px-2 py-2 text-xs md:text-sm">
                                                        <div className="flex justify-center">
                                                            <button
                                                                onClick={() => handelClick(record.id)}
                                                                className="bg-green-500 px-2 py-1 rounded hover:bg-green-600 text-xs md:text-sm"
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
                        </div>
                    </div>

                    {/* PAGINATION BUTTONS */}
                    <div className="flex justify-center mt-4 gap-1 md:gap-2 pb-4 md:pb-6 flex-wrap">
                        <button
                            onClick={handlePrevPage}
                            className={`px-2 md:px-3 py-1 rounded text-xs md:text-base ${currentPage === 1 ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}`}
                            disabled={currentPage === 1}
                        >
                            Prev
                        </button>

                        {[...Array(Math.ceil(adminRecords.length / itemsPerPage))].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={`px-2 md:px-3 py-1 rounded text-xs md:text-base ${currentPage === i + 1 ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"}`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={handleNextPage}
                            className={`px-2 md:px-3 py-1 rounded text-xs md:text-base ${currentPage === Math.ceil(adminRecords.length / itemsPerPage) ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}`}
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