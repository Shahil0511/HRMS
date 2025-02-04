import axios from "axios";

const API_URL = "http://localhost:8000/api/attendance";

// ✅ Get Token from LocalStorage
const getToken = (): string | null => localStorage.getItem("token");

// ✅ Strict TypeScript Interface for Attendance Data
export interface AttendanceEntry {
    data: any;
    _id: string;
    employeeId: string;
    date: string;
    checkIn: string;
    checkOut?: string;
    status: string;
    duration?: number;
}

// ✅ Centralized Check-In API Call
export const checkIn = async (employeeId: string): Promise<AttendanceEntry> => {
    if (!employeeId) throw new Error("Employee ID is required");

    console.log("🚀 Sending Check-In Request: Employee ID:", employeeId); // ✅ Debugging Log

    try {
        const response = await axios.post(
            `${API_URL}/check-in`,
            { employeeId },
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("✅ Check-In Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("❌ Check-In API Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Check-in failed");
    }
};

// ✅ Centralized Check-Out API Call
export const checkOut = async (employeeId: string): Promise<AttendanceEntry> => {
    if (!employeeId) throw new Error("Employee ID is required");

    try {
        const response = await axios.post(
            `${API_URL}/check-out`,
            { employeeId },
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("✅ Check-Out Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("❌ Check-Out API Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Check-out failed");
    }
};
