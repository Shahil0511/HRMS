import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import { fetchAttendance, markEmployeeAttendance } from "../../../store/slices/attendanceSlice";
import { toast } from "react-toastify";

// Define the prop types to accept onSubmit function
interface AttendanceFormProps {
    onSubmit: (checkIn: string, checkOut: string) => void;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ onSubmit }) => {
    const dispatch = useDispatch<AppDispatch>();

    // Get attendance state from Redux
    const { status, checkInTime, checkOutTime, isLoading, message, error } =
        useSelector((state: RootState) => state.attendance);

    // Get the employee ID from auth or user state (assuming it's stored there)
    const { user } = useSelector((state: RootState) => state.auth);
    const employeeId = user?.id || ""; // Default to an empty string if user is not found

    // Fetch attendance when the component mounts
    useEffect(() => {
        if (employeeId) {
            console.log("Dispatching fetchAttendance for employeeId:", employeeId); // Debugging log
            dispatch(fetchAttendance(employeeId));
        } else {
            console.log("Employee ID not found.");
        }
    }, [dispatch, employeeId]);

    // Handle attendance submission for Check In
    const handleCheckIn = async () => {
        const checkIn = new Date().toISOString(); // Get current time
        console.log("Checking in with time:", checkIn); // Debugging log
        onSubmit(checkIn, ""); // Passing checkIn to onSubmit
        toast.success("Checked in successfully!");
    };

    // Handle attendance submission for Check Out
    const handleCheckOut = async () => {
        if (!checkInTime) {
            toast.error("You need to check in first.");
            return;
        }
        const checkOut = new Date().toISOString(); // Get current time
        console.log("Checking out with time:", checkOut); // Debugging log
        onSubmit(checkInTime, checkOut); // Passing checkOut to onSubmit
        toast.success("Checked out successfully!");
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl">
            <h2 className="text-xl font-bold text-center mb-4">Attendance</h2>

            {isLoading && <p className="text-blue-500 text-center">Loading...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {message && <p className="text-green-500 text-center">{message}</p>}

            <div className="text-center my-4">
                <p className="text-lg font-semibold">Status: {status}</p>
                <p>Check-in Time: {checkInTime || "Not checked in yet"}</p>
                <p>Check-out Time: {checkOutTime || "Not checked out yet"}</p>
            </div>

            <div className="flex justify-center gap-4">
                <button
                    onClick={handleCheckIn}
                    disabled={status === "Present"}
                    className={`px-4 py-2 rounded-lg ${status === "Present" ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                        } text-white`}
                >
                    Check In
                </button>
                <button
                    onClick={handleCheckOut}
                    disabled={!checkInTime || checkOutTime !== null}
                    className={`px-4 py-2 rounded-lg ${!checkInTime || checkOutTime ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                        } text-white`}
                >
                    Check Out
                </button>
            </div>
        </div>
    );
};

export default AttendanceForm;
