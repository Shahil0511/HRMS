import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Correct import for jwt-decode

const API_URL = "http://localhost:8000/api/employees";

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
        console.log("Stored Token:", localStorage.getItem("token"));

        const response = await axios.post(API_URL, employeeData, {
            headers: setAuthHeader(token),
        });

        // Log the response to see both employee and user data
        console.log(response.data.employee); // Employee Data
        console.log(response.data.user); // User Data (if necessary)

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

        return response.data;
    } catch (error: any) {
        console.error("Error fetching employee data:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to fetch employee data");
    }
};
