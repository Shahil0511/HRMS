import axios from "axios";
const API_URL = "https://hrms-backend-7176.onrender.com/api/workreports";
// const API_URL = "http://localhost:8000/api/workreports/"; // Backend URL

export const getEmployeeDetails = async () => {
  try {
    const token = localStorage.getItem("token"); // Use localStorage for consistency
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || !user?.employeeId) {
      throw new Error("Token or Employee ID not found in storage");
    }

    const response = await axios.post(
      `${API_URL}/employeedetails`,
      { employeeId: user.employeeId }, // Send employeeId instead of userId
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching employee details:", error);
    throw error;
  }
};
