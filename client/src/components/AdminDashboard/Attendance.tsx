import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadAdminAttendance } from "../../store/slices/attendanceSlice";
import { RootState, AppDispatch } from "../../store/store";

const AdminAttendance = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { adminRecords, loading, error } = useSelector((state: RootState) => state.attendance);

    /**
     * Fetches admin attendance data.
     * Uses `useCallback` to optimize re-renders.
     */
    const fetchAttendance = useCallback(() => {
        dispatch(loadAdminAttendance());
    }, [dispatch]);

    /**
     * Fetches attendance records on component mount.
     */
    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-6xl mx-auto bg-gray-800 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-center mb-6">
                    Today's Present Employees (Admin View)
                </h2>

                {loading ? (
                    <div className="text-center p-4 text-white animate-pulse">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 p-4 text-center">{error}</div>
                ) : adminRecords.length === 0 ? (
                    <div className="text-center p-4 text-gray-400">
                        No employees checked in today.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-700 rounded-lg shadow-md">
                            <thead className="bg-blue-700 text-white">
                                <tr>
                                    <th className="border border-gray-200 p-3">Name</th>
                                    <th className="border border-gray-200 p-3">Email</th>
                                    <th className="border border-gray-200 p-3">Check-in Time</th>
                                    <th className="border border-gray-200 p-3">Check-out Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminRecords.map((record, index) => (
                                    <tr key={index} className="text-center hover:bg-blue-800 transition duration-300">
                                        <td className="border border-gray-200 p-3">{record.employeeName || "N/A"}</td>
                                        <td className="border border-gray-200 p-3">{record.email || "N/A"}</td>
                                        <td className="border border-gray-200 p-3">{record.checkIn || "N/A"}</td>
                                        <td className="border border-gray-200 p-3">{record.checkOut || "N/A"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAttendance;
