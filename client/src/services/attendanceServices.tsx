import axios from 'axios';

const API_URL = 'http://localhost:8000/api/attendance';

// Function to get the authentication token
const getAuthToken = (): string | null => localStorage.getItem('token');

// Function to make authenticated requests
const apiRequest = async (endpoint: string) => {
    try {
        const token = getAuthToken();
        if (!token) throw new Error('Unauthorized: No token found. Please log in.');

        const response = await axios.post(
            `${API_URL}/${endpoint}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error: any) {
        console.error(`Error during ${endpoint}:`, error?.response?.data || error.message);
        throw new Error(error?.response?.data?.message || 'An unexpected error occurred.');
    }
};

// Function to check in
export const checkIn = async () => apiRequest('check-in');

// Function to check out
export const checkOut = async () => apiRequest('check-out');

// Function to get attendance records
export const getAttendanceRecords = async () => {
    try {
        const token = getAuthToken();
        if (!token) throw new Error("Unauthorized: No token found. Please log in.");

        // ✅ Change the URL from `/api/attendance` to `/api/attendance/employee`
        const response = await axios.get("http://localhost:8000/api/attendance/employee", {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;
    } catch (error: any) {
        console.error("Error fetching attendance records:", error?.response?.data || error.message);
        throw new Error(error?.response?.data?.message || "Failed to fetch attendance records.");
    }
};


// Exporting all attendance functions
const attendanceService = { checkIn, checkOut, getAttendanceRecords };
export default attendanceService;
