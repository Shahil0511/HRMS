import axios from "axios";

export const fetchUserName = async () => {
    try {
        const token = localStorage.getItem("token");



        if (!token) {
            console.error("No token found, user might not be logged in.");
            throw new Error("No token found, user might not be logged in.");
        }


        const response = await axios.get("http://localhost:8000/api/employees/user", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });



        if (response && response.data && response.data.user) {

            return response.data.user;
        } else {

            throw new Error("User data not found in response.");
        }
    } catch (error) {

        throw new Error("Failed to fetch user info");
    }
};
