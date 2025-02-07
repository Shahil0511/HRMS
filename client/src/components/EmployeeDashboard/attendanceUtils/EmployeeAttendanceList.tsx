import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAttendanceRecords } from "../../../store/slices/attendanceSlice";
import { RootState, AppDispatch } from "../../../store/store";
import { format } from "date-fns";

const EmployeeAttendanceList = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { records, loading, error } = useSelector((state: RootState) => state.attendance);

    useEffect(() => {
        dispatch(fetchAttendanceRecords()); // Fetch attendance data when component mounts
    }, [dispatch]);

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Employee Attendance</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Day</th>
                            <th className="border p-2">Check In & Check Out</th>
                            <th className="border p-2">Total Time Worked</th>
                            <th className="border p-2">Present</th>
                            <th className="border p-2">Absent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records?.map((record) => {
                            // ✅ Ensure checkIn and checkOut are treated as single Date values
                            const checkInTime = Array.isArray(record.checkIn)
                                ? new Date(record.checkIn[0])
                                : new Date(record.checkIn);

                            const checkOutTime = record.checkOut
                                ? (Array.isArray(record.checkOut)
                                    ? new Date(record.checkOut[0])
                                    : new Date(record.checkOut))
                                : null;

                            return (
                                <tr key={record.id} className="text-center">
                                    <td className="border p-2">{format(new Date(record.date), "yyyy-MM-dd")}</td>
                                    <td className="border p-2">{format(new Date(record.date), "EEEE")}</td>
                                    <td className="border p-2">
                                        {checkInTime ? format(checkInTime, "HH:mm:ss") : "N/A"} -{" "}
                                        {checkOutTime ? format(checkOutTime, "HH:mm:ss") : "N/A"}
                                    </td>
                                    <td className="border p-2">
                                        {checkInTime && checkOutTime
                                            ? ((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)).toFixed(2) +
                                            " hrs"
                                            : "N/A"}
                                    </td>
                                    <td className="border p-2">
                                        {record.status === "Present" ? (
                                            <span className="text-green-600 font-bold">✔</span>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td className="border p-2">
                                        {record.status === "Absent" ? (
                                            <span className="text-red-600 font-bold">✘</span>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeAttendanceList;
