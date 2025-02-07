import axios from "axios";

const API_URL = "http://localhost:8000/api/attendance";

// Assuming you store the token in localStorage or another secure location
const getAuthToken = () => {
    return localStorage.getItem('token'); // Or wherever you store the token
};

// Function to check in
const checkIn = async () => {
    try {
        const token = getAuthToken();

        // Ensure the token exists before making the request
        if (!token) {
            throw new Error("No token found, please login");
        }

        const response = await axios.post(
            `${API_URL}/check-in`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error during check-in:", error);
        throw error;
    }
};

// Function to check out
const checkOut = async () => {
    try {
        const token = getAuthToken();

        // Ensure the token exists before making the request
        if (!token) {
            throw new Error("No token found, please login");
        }

        const response = await axios.post(
            `${API_URL}/check-out`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error during check-out:", error);
        throw error;
    }
};

export default { checkIn, checkOut };
