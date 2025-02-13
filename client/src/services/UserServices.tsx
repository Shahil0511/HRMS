import axios from "axios";
// const API_URL = "https://hrms-backend-7176.onrender.com/api/employees/user";
const API_URL = "http://localhost:8000/api/employees/user";

export const fetchUserName = async () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("No token found, user might not be logged in.");
            throw new Error("No token found, user might not be logged in.");
        }
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Check if response data contains 'user' object
        if (response && response.data && response.data.user) {
            return response.data.user;
        } else {
            console.error("User data not found in response:", response); // Debugging log
            throw new Error("User data not found in response.");
        }
    } catch (error) {
        console.error("Error fetching user info:", error); // Debugging log
        throw new Error("Failed to fetch user info");
    }
};
