// src/api/auth.ts
import axios from "axios";

const API_BASE_URL = "https://hrms-backend-7176.onrender.com/api/auth";
// const API_BASE_URL = "http://localhost:8000/api/auth";

// Login user
export const loginUser = async (data: { email: string; password: string }) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, data);
        // Check if the response contains necessary data
        if (!response.data || !response.data.token || !response.data.user) {
            console.error("❌ Invalid response format:", response.data);
            throw new Error("Invalid response format: Missing token or user data");
        }

        // Destructure token and user from the response
        const { token, user } = response.data;
        const { role } = user; // Destructure role from the user object

        // Return the necessary data in the correct format
        return {
            token, // The token
            role, // The user's role
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                employeeId: user.employeeId || null, // Optional employeeId
                employeeName: user.employeeName || null, // Optional employeeName
            },
        };
    } catch (error) {
        console.error("❌ Login failed:", error);
        throw error; // Rethrow the error to handle it in the calling code
    }
};

// Signup user
export const signupUser = async (data: { name: string; email: string; password: string }) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/signup`, data);
        return response.data;
    } catch (error) {
        console.error("Signup failed:", error);
        throw error; // Rethrow the error to handle it in the calling code
    }
};
