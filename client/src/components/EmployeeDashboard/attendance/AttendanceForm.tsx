import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import { checkIn, checkOut } from "../../../store/slices/attendanceSlice";
import { toast } from "react-toastify";

export const AttendanceForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((state: RootState) => state.attendance);

    // Trigger toast error after the component renders (side-effect)
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]); // This will run only when the error state changes

    const handleCheckIn = async () => {
        try {
            await dispatch(checkIn()).unwrap(); // Using unwrap to handle success/failure
            toast.success("Checked in successfully!");
        } catch (err) {
            toast.error("Failed to check in");
        }
    };

    const handleCheckOut = async () => {
        try {
            await dispatch(checkOut()).unwrap(); // Using unwrap to handle success/failure
            toast.success("Checked out successfully!");
        } catch (err) {
            toast.error("Failed to check out");
        }
    };

    return (
        <div className="p-4 bg-white shadow rounded-md mt-4">
            <h2 className="text-xl font-bold mb-4">Attendance</h2>

            {/* Display error message using toast */}
            {/* No need to call toast.error directly in render phase */}

            {/* Check-In Button */}
            <button
                onClick={handleCheckIn}
                className="px-4 py-2 bg-green-500 text-white rounded mr-2"
                disabled={loading}
            >
                {loading ? "Checking In..." : "Check In"}
            </button>

            {/* Check-Out Button */}
            <button
                onClick={handleCheckOut}
                className="px-4 py-2 bg-red-500 text-white rounded"
                disabled={loading}
            >
                {loading ? "Checking Out..." : "Check Out"}
            </button>
        </div>
    );
};
