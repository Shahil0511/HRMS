import React from "react";
import { AttendanceForm } from "../EmployeeDashboard/attendance/AttendanceForm";

const Attendance: React.FC = () => {
    return (
        <div className="p-4 bg-white shadow rounded-md">

            {/* Only Attendance Form */}
            <AttendanceForm />
        </div>
    );
};

export default Attendance;
