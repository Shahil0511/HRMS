import axios from "axios";

// Define the API URL
const API_URL = "http://localhost:8000/api/attendance";

// Define the response type for Attendance API calls
export interface AttendanceResponse {
    success: boolean;
    message: string;
    attendance?: {
        status: string;
        checkIn: string;
        checkOut?: string;
    };
}

// Get token from localStorage (or from state if using Redux)
const getToken = () => {
    return localStorage.getItem("authToken"); // Adjust based on your token storage method
}

// ✅ Fetch today's attendance for a specific employee
export const fetchTodayAttendance = async (employeeId: string): Promise<AttendanceResponse> => {
    const token = getToken(); // Get the token from localStorage (or from state)

    try {
        const response = await axios.get(`${API_URL}/${employeeId}/today`, {
            headers: {
                Authorization: `Bearer ${token}`, // Add token in Authorization header
            },
        });
        return response.data;
    } catch (error: unknown) {
        console.error("Error fetching today's attendance:", error);

        // Type guard to check if error is an AxiosError
        if (axios.isAxiosError(error)) {
            // Handle specific error messages from the API
            throw new Error(error.response?.data.message || "Failed to fetch attendance");
        }

        // Fallback for unknown error type
        throw new Error("Error fetching today's attendance");
    }
};

// ✅ Mark attendance (Check-In or Check-Out)
export const markAttendance = async (
    employeeId: string,
    checkIn: string,
    checkOut?: string
): Promise<AttendanceResponse> => {
    const token = getToken(); // Get the token from localStorage (or from state)

    try {
        let response;

        if (checkOut) {
            // Mark Check-Out
            response = await axios.post(
                `${API_URL}/check-out`,
                { employeeId, checkIn, checkOut },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token in Authorization header
                    },
                }
            );
        } else {
            // Mark Check-In
            response = await axios.post(
                `${API_URL}/check-in`,
                { employeeId, checkIn },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token in Authorization header
                    },
                }
            );
        }

        return response.data;
    } catch (error: unknown) {
        console.error("Error marking attendance:", error);

        // Type guard to check if error is an AxiosError
        if (axios.isAxiosError(error)) {
            // Handle specific error messages from the API
            throw new Error(error.response?.data.message || "Failed to mark attendance");
        }

        // Fallback for unknown error type
        throw new Error("Error marking attendance");
    }
};
