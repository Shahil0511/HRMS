import axios from "axios";

const API_URL = "http://localhost:8000/api/attendance";

/**
 * Retrieves the authentication token from local storage.
 * @returns {string | null} The stored token or null if not found.
 */
const getAuthToken = (): string | null => localStorage.getItem("token");

/**
 * Makes an authenticated API request.
 * @param {string} endpoint - The API endpoint to call.
 * @param {"GET" | "POST"} method - The HTTP method (default is "GET").
 * @returns {Promise<any>} The response data from the API.
 * @throws {Error} Throws an error if authentication fails or request errors occur.
 */
const apiRequest = async (endpoint: string, method: "GET" | "POST" = "GET") => {
    try {
        const token = getAuthToken();
        if (!token) throw new Error("Unauthorized: No token found. Please log in.");

        const headers = { Authorization: `Bearer ${token}` };

        let response;
        if (method === "GET") {
            response = await axios.get(`${API_URL}/${endpoint}`, { headers });
        } else {
            response = await axios.post(`${API_URL}/${endpoint}`, {}, { headers });
        }

        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "An unexpected error occurred.");
    }
};

/**
 * Checks in an employee.
 */
export const checkIn = async () => apiRequest("check-in", "POST");

/**
 * Checks out an employee.
 */
export const checkOut = async () => apiRequest("check-out", "POST");

/**
 * Retrieves attendance records for an admin.
 */
export const getAttendanceRecords = async () => apiRequest("employee", "GET");

/**
 * Retrieves attendance records for a specific employee.
 */
export const getEmployeeAttendance = async () => apiRequest("employee", "GET");

/**
 * Retrieves the list of employees who checked in today (Admin).
 */
export const getTodayPresentEmployees = async () => apiRequest("today", "GET");

// Exporting all attendance-related functions as a service
const attendanceService = { checkIn, checkOut, getAttendanceRecords, getEmployeeAttendance, getTodayPresentEmployees };
export default attendanceService;
