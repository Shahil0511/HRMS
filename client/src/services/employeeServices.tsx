import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = "https://hrms-backend-7176.onrender.com/api/employees";
// const API_URL = "http://localhost:8000/api/employees";

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => localStorage.getItem("token");

/**
 * Check if the token is expired
 */
const isTokenValid = (token: string): boolean => {
    try {
        const decoded: any = jwtDecode(token); // Decode the JWT
        return decoded.exp * 1000 > Date.now(); // Check if token is expired
    } catch {
        return false; // Invalid or malformed token
    }
};

/**
 * Set the Authorization header for API requests
 */
const setAuthHeader = (token: string) => ({
    "Content-Type": "application/json", // Corrected content type
    Authorization: `Bearer ${token}`,
});

/**
 * Handle token validation and return error if invalid
 */
const handleTokenValidation = () => {
    const token = getAuthToken();
    if (!token) {
        throw new Error("User not authenticated. Please log in.");
    }

    if (!isTokenValid(token)) {
        localStorage.removeItem("token"); // Clear expired token
        throw new Error("Session expired. Please log in again.");
    }

    return token;
};

/**
 * Add a new employee
 */
export const addEmployee = async (employeeData: any) => {
    try {
        const token = handleTokenValidation();


        const response = await axios.post(API_URL, employeeData, {
            headers: setAuthHeader(token),
        });



        return response.data;
    } catch (error: any) {
        console.error("Error adding employee:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to add employee");
    }
};

/**
 * Get all employees
 */
export const getAllEmployees = async (search?: string) => {
    try {
        const token = handleTokenValidation();

        const response = await axios.get(API_URL, {
            headers: setAuthHeader(token),
            params: search ? { search } : {},
        });

        return response.data;
    } catch (error: any) {
        console.error("Error fetching employees:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to fetch employees");
    }
};

/**
 * Get the current authenticated user's employee data
 */
export const getUserEmployeeData = async () => {
    try {
        const token = handleTokenValidation();
        const response = await axios.get(`${API_URL}/user`, {
            headers: setAuthHeader(token),
        });
        console.log(response.data)
        return response.data;
    } catch (error: any) {
        console.error("Error fetching employee data:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to fetch employee data");
    }
};


export const getTotalEmployee = async () => {
    try {
        const response = await axios.get(`${API_URL}/totalemployees`);

        return response?.data;
    } catch (error) {
        console.error("Error fetching departments:", error);
        throw error;
    }
};
export const getTodayTotalEmployeePresent = async () => {
    try {
        const response = await axios.get(`${API_URL}/todaypresent`);

        return response?.data;
    } catch (error) {
        console.error("Error fetching departments:", error);
        throw error;
    }
};

export const getEmployeeById = async (employeeId: string) => {
    try {
        const response = await axios.get(`${API_URL}/${employeeId}`);

        if (response.data.success) {
            return response.data.data;
        } else {

            throw new Error("Employee not found");
        }
    } catch (error: any) {
        console.error("Error fetching employee:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || "Failed to fetch employee");
    }
};


export const getEmployeeProfile = async () => {
    try {
        const token = handleTokenValidation(); // Validate the token first

        const response = await axios.get(`${API_URL}/profile/myprofile`, {
            headers: setAuthHeader(token), // Set authorization header with the token
        });

        return response.data;
    } catch (error: any) {
        console.error("Error fetching employee profile:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to fetch employee profile");
    }
};