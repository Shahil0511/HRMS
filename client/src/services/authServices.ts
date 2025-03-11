import axios from "axios";

const API_BASE_URL = "https://hrms-backend-7176.onrender.com/api/auth";
// const API_BASE_URL = "http://localhost:8000/api/auth";

export const loginUser = async (data: { email: string; password: string }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, data);

    if (!response.data || !response.data.token || !response.data.user) {
      console.error("❌ Invalid response format:", response.data);
      throw new Error("Invalid response format: Missing token or user data");
    }

    // Destructure token and user from the response
    const { token, user } = response.data;
    const { role } = user;

    // Return the necessary data in the correct format
    return {
      token,
      role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId || null,
        employeeName: user.employeeName || null,
      },
    };
  } catch (error) {
    console.error("❌ Login failed:", error);
    throw error;
  }
};
