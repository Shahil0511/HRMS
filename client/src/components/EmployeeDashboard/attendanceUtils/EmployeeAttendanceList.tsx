import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAttendanceRecords } from "../../../store/slices/attendanceSlice";
import { RootState, AppDispatch } from "../../../store/store";
import { format } from "date-fns";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { fetchUserName } from "../../../services/UserServices";

const EmployeeAttendanceList = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { records, loading, error } = useSelector((state: RootState) => state.attendance);

    const [userName, setUserName] = useState<string | null>(null);
    const [userLoading, setUserLoading] = useState<boolean>(true);
    const [userError, setUserError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch user data (used in Navbar as well)
        const getUserData = async () => {
            try {
                setUserLoading(true);
                const user = await fetchUserName();
                if (user?.name) {
                    setUserName(user.name);
                } else {
                    setUserError("User data is incomplete.");
                }
            } catch (err) {
                setUserError("Failed to fetch user information.");
            } finally {
                setUserLoading(false);
            }
        };

        getUserData();
    }, []); // Runs once on mount

    useEffect(() => {
        dispatch(fetchAttendanceRecords()); // Fetch all attendance records
    }, [dispatch]);

    if (loading || userLoading) return <div className="text-center p-4 text-white">Loading...</div>;
    if (error || userError) return <div className="text-red-500 p-4 text-center">{error || userError}</div>;

    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 text-white p-6">
            <div className="max-w-6xl mx-auto bg-gradient-to-l from-indigo-900 to-blue-800 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-center mb-6">{userName ? `${userName}'s Attendance` : "Attendance"}</h2>

                <div className="overflow-x-auto rounded-sm">
                    <table className="w-full border border-gray-700 rounded-sm">
                        <thead className="bg-blue-700 text-white">
                            <tr>
                                <th className="border border-gray-200 p-3">Date</th>
                                <th className="border border-gray-200 p-3 hidden sm:table-cell">Day</th>
                                <th className="border border-gray-200 p-3">Check In & Check Out</th>
                                <th className="border border-gray-200 p-3">Total Time Worked</th>
                                <th className="border border-gray-200 p-3 sm:hidden">Status</th>
                                <th className="border border-gray-200 p-3 hidden sm:table-cell">Present</th>
                                <th className="border border-gray-200 p-3 hidden sm:table-cell">Absent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records?.map((record) => {
                                const checkIns = Array.isArray(record.checkIn) ? record.checkIn : [record.checkIn];
                                const checkOuts = Array.isArray(record.checkOut) ? record.checkOut : [record.checkOut];

                                return (
                                    <tr key={record.id} className="text-center hover:bg-blue-800 transition duration-300">
                                        <td className="border border-gray-200 p-3">{format(new Date(record.date), "yyyy-MM-dd")}</td>
                                        <td className="border border-gray-200 p-3 hidden sm:table-cell">{format(new Date(record.date), "EEEE")}</td>
                                        <td className="border border-gray-200 p-3">
                                            {checkIns.map((checkIn, index) => (
                                                <div key={index} className="py-1">
                                                    {format(new Date(checkIn), "HH:mm:ss")} -{" "}
                                                    {checkOuts[index] ? format(new Date(checkOuts[index]), "HH:mm:ss") : "N/A"}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="border border-gray-200 p-3">
                                            {checkIns.map((checkIn, index) => {
                                                const checkOut = checkOuts[index];
                                                return (
                                                    <div key={index} className="py-1">
                                                        {checkOut
                                                            ? ((new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                                                                (1000 * 60 * 60)
                                                            ).toFixed(2) + " hrs"
                                                            : "N/A"}
                                                    </div>
                                                );
                                            })}
                                        </td>
                                        <td className="border border-gray-200 p-3 sm:hidden">
                                            {record.status === "Present" ? (
                                                <FaCheckCircle className="text-green-400 text-xl mx-auto" />
                                            ) : record.status === "Absent" ? (
                                                <FaTimesCircle className="text-red-500 text-xl mx-auto" />
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td className="border border-gray-200 p-3 hidden sm:table-cell">
                                            {record.status === "Present" ? (
                                                <FaCheckCircle className="text-green-400 text-xl mx-auto" />
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td className="border border-gray-200 p-3 hidden sm:table-cell">
                                            {record.status === "Absent" ? (
                                                <FaTimesCircle className="text-red-500 text-xl mx-auto" />
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
        </div>
    );
};

export default EmployeeAttendanceList;
