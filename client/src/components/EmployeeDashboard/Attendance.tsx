import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkIn, checkOut, fetchAttendanceRecords } from "../../store/slices/attendanceSlice";
import { RootState, AppDispatch } from "../../store/store";
import { toast } from "react-toastify";

const AttendanceForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { attendance, loading } = useSelector((state: RootState) => state.attendance);
    const [isCheckedIn, setIsCheckedIn] = useState(false);

    // Update check-in state based on attendance data
    useEffect(() => {
        dispatch(fetchAttendanceRecords()); // Fetch latest attendance data
    }, [dispatch]);

    useEffect(() => {
        if (attendance?.checkIn && !attendance?.checkOut) {
            setIsCheckedIn(true);
        } else {
            setIsCheckedIn(false);
        }
    }, [attendance]);

    const handleCheckIn = async () => {
        console.log("Attempting to check in...");
        try {
            await dispatch(checkIn()).unwrap();
            toast.success("Checked in successfully");
            console.log("Check-in successful!");
        } catch (error: any) {
            toast.error(error.message || "Failed to check in");
            console.error("Check-in error:", error);
        }
    };

    const handleCheckOut = async () => {
        console.log("Attempting to check out...");
        try {
            await dispatch(checkOut()).unwrap();
            toast.success("Checked out successfully");
            console.log("Check-out successful!");
        } catch (error: any) {
            toast.error(error.message || "Failed to check out");
            console.error("Check-out error:", error);
        }
    };

    const goToAttendanceList = () => {
        navigate("/employee/attendance-list");
    };

    return (
        <div className="bg-gradient-to-r from-gray-900 to-indigo-900 flex justify-center items-center min-h-screen relative">
            <div className="absolute top-4 right-4">
                <button
                    onClick={goToAttendanceList}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
                >
                    My Attendance
                </button>
            </div>

            {/* Attendance Form */}
            <div className="bg-gradient-to-l from-gray-900 to-indigo-900 p-8 rounded-xl shadow-lg w-full sm:w-96 transition-all">
                <h2 className="text-2xl font-semibold text-center mb-6 text-white">
                    Attendance
                </h2>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xl text-white">Track Your Attendance</h3>
                        <p className="text-white">Please check in when you arrive and check out when you leave.</p>
                    </div>

                    <div className="flex justify-between gap-4">
                        {/* Check In Button */}
                        <button
                            onClick={handleCheckIn}
                            disabled={isCheckedIn || loading}
                            className={`w-full py-3 rounded-lg text-white font-medium transition duration-300 ${isCheckedIn || loading ? "bg-indigo-900 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                        >
                            {loading ? "Checking In..." : "Check In"}
                        </button>

                        {/* Check Out Button */}
                        <button
                            onClick={handleCheckOut}
                            disabled={!isCheckedIn || loading}
                            className={`w-full py-3 rounded-lg text-white font-medium transition duration-300 ${!isCheckedIn || loading ? "bg-blue-900 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {loading ? "Checking Out..." : "Check Out"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceForm;
