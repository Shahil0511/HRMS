import axios from "axios";
const API_URL = "https://hrms-backend-7176.onrender.com/api/workreports";
// const API_URL = "http://localhost:8000/api/workreports"; // Backend URL

export const getEmployeeDetails = async () => {
  try {
    const token = localStorage.getItem("token");
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

export const submitWorkReport = async (formData: {
  employeeName: string;
  department: string;
  designation: string;
  date: string;
  completedTasks: string;
  ongoingTasks: string;
}) => {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.employeeId; // Using userId directly from localStorage

    if (!token || !userId) {
      throw new Error("Authorization token or User ID not found");
    }

    // Log the data being sent
    console.log("Submitting Work Report with Data:", { userId, ...formData });

    const response = await axios.post(
      `${API_URL}/submit`,
      { userId, ...formData }, // Sending userId along with formData
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error submitting work report:", error);
    throw error;
  }
};
