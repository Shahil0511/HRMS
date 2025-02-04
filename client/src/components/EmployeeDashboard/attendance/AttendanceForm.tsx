import { useState, useCallback, useEffect } from "react";
import { checkIn, checkOut, AttendanceEntry } from "../../../services/AttendanceService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AttendanceForm = () => {
    const [attendance, setAttendance] = useState<AttendanceEntry | null>(null);
    const [loading, setLoading] = useState(false);

    // ✅ Retrieve employeeId from localStorage
    const userData = localStorage.getItem("user");
    const employeeId = userData ? JSON.parse(userData)?.employeeId || JSON.parse(userData)?._id : null;



    // ✅ Fetch attendance status from localStorage on mount
    useEffect(() => {

        const storedAttendance = localStorage.getItem("attendance");
        if (storedAttendance) {
            const parsedAttendance = JSON.parse(storedAttendance);
            if (parsedAttendance.data) {

                setAttendance(parsedAttendance.data); // ✅ Extract only `data`
            } else {
                console.warn("⚠️ Attendance Data Missing `data` Field");
            }
        }
    }, []);

    // ✅ Check-In Handler
    const handleCheckIn = useCallback(async () => {

        if (!employeeId) {
            console.error("❌ Check-In Error: No Employee ID Found");
            toast.error("⚠️ Employee ID not found. Please log in again.");
            return;
        }
        if (loading) {
            console.warn("⚠️ Check-In Blocked: Already Loading...");
            return;
        }
        if (attendance && !attendance.checkOut) {
            console.warn("⚠️ Check-In Blocked: Check-Out Required First");
            return;
        }

        setLoading(true);
        try {

            const response = await checkIn(employeeId);


            const newAttendance = response.data; // ✅ Extract only `data`

            setAttendance(newAttendance);
            localStorage.setItem("attendance", JSON.stringify(newAttendance));
            toast.success("✅ Check-In Successful!");
        } catch (err: any) {
            console.error("❌ Check-In Error:", err.message);
            toast.error(err.message || "❌ Check-In Failed");
        } finally {
            setLoading(false);
        }
    }, [employeeId, loading, attendance]);

    // ✅ Check-Out Handler
    const handleCheckOut = useCallback(async () => {

        if (!employeeId) {
            console.error("❌ Check-Out Error: No Employee ID Found");
            toast.error("⚠️ Employee ID not found. Please log in again.");
            return;
        }
        if (loading) {
            console.warn("⚠️ Check-Out Blocked: Already Loading...");
            return;
        }
        if (!attendance?.checkIn) {
            console.warn("⚠️ Check-Out Blocked: No Check-In Found");
            return;
        }
        if (attendance?.checkOut) {
            console.warn("⚠️ Check-Out Blocked: Already Checked Out");
            return;
        }

        setLoading(true);
        try {

            const response = await checkOut(employeeId);

            const updatedAttendance = response.data; // ✅ Extract only `data`

            setAttendance(updatedAttendance);
            localStorage.setItem("attendance", JSON.stringify(updatedAttendance));
            toast.success("✅ Check-Out Successful!");
        } catch (err: any) {
            console.error("❌ Check-Out Error:", err.message);
            toast.error(err.message || "❌ Check-Out Failed");
        } finally {
            setLoading(false);
        }
    }, [employeeId, loading, attendance]);

    return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Attendance</h2>
            <div className="space-y-4">
                {/* ✅ Check-In Button */}
                <button
                    onClick={handleCheckIn}
                    className={`w-full px-4 py-2 text-white font-medium rounded-lg transition 
                        ${attendance?.checkIn && !attendance?.checkOut ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                    disabled={!!attendance?.checkIn && !attendance?.checkOut || loading}
                >
                    {loading ? "Processing..." : "Check In"}
                </button>

                {/* ✅ Check-Out Button */}
                <button
                    onClick={handleCheckOut}
                    className={`w-full px-4 py-2 text-white font-medium rounded-lg transition 
                        ${attendance?.checkIn && !attendance?.checkOut
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-gray-400 cursor-not-allowed"}`}
                    disabled={!attendance?.checkIn || !!attendance?.checkOut || loading}
                >
                    {loading ? "Processing..." : "Check Out"}
                </button>
            </div>

            {/* ✅ Attendance Details */}
            {attendance?.checkIn && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <p className="text-gray-600">
                        <strong>Check-In:</strong> {new Date(attendance.checkIn).toLocaleTimeString()}
                    </p>
                    <p className="text-gray-600">
                        <strong>Check-Out:</strong> {attendance.checkOut ? new Date(attendance.checkOut).toLocaleTimeString() : "Pending"}
                    </p>
                    <p className="text-gray-600">
                        <strong>Duration:</strong> {attendance.duration ? `${attendance.duration.toFixed(2)} hrs` : "-"}
                    </p>
                </div>
            )}
        </div>
    );
};
