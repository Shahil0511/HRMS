import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../store/store";
import { fetchAttendance, markEmployeeAttendance } from "../../store/slices/attendanceSlice";
import { RootState } from "../../store/store";
import AttendanceForm from "../EmployeeDashboard/attendance/AttendanceForm";

const Attendance: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
    const { status, message, isLoading, error, checkInTime, checkOutTime } = useSelector(
        (state: RootState) => state.attendance
    );

    useEffect(() => {
        if (isLoggedIn && user?.id) {
            console.log("Dispatching fetchAttendance with userId:", user.id); // Debugging log
            dispatch(fetchAttendance(user.id));
        } else {
            console.log("User is not logged in or user ID is missing.");
        }
    }, [isLoggedIn, user, dispatch]);

    const handleMarkAttendance = async (checkIn: string, checkOut: string) => {
        if (!user?.id) {
            console.log("No user ID found.");
            return;
        }

        try {
            console.log("Dispatching markEmployeeAttendance:", { checkIn, checkOut }); // Debugging log
            await dispatch(markEmployeeAttendance({ employeeId: user.id, checkIn, checkOut })).unwrap();
        } catch (error) {
            console.error("Error marking attendance:", error);
        }
    };

    return (
        <div>
            <h2>Attendance Status: {isLoading ? "Loading..." : status}</h2>
            {message && <p>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <AttendanceForm onSubmit={handleMarkAttendance} />
        </div>
    );
};

export default Attendance;
