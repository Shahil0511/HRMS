import axios from "axios";
const API_URL = "https://hrms-backend-7176.onrender.com/api/employees/user";
// const API_URL = "http://localhost:8000/api/employees/user";

export const fetchUserName = async () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            const errorMessage = "No token found in localStorage. User might not be logged in.";
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Ensure response contains user data
        if (response?.data?.user) {
            return response.data.user;
        }

        const errorMessage = "User data not found in response.";
        console.error(errorMessage, response);
        throw new Error(errorMessage);

    } catch (error) {
        console.error("Error fetching user info:", error);
        throw new Error("Failed to fetch user info due to an error.");
    }
};
