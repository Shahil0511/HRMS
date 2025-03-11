import axios from "axios";

const BASE_URL = "https://hrms-backend-7176.onrender.com/api";
// const BASE_URL = "http://localhost:8000/api";

// Define the types for the responses
interface DepartmentEmployeesResponse {
  totalEmployees: number;
}

interface TodayDepartmentAttendanceResponse {
  totalPresent: number;
  totalPresentToday: number;
}

// Helper function to get token and user data from localStorage
const getAuthData = () => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (!token) throw new Error("Authorization token is missing");
  if (!userData) throw new Error("User data not found in localStorage");

  return { token, userData: JSON.parse(userData) };
};

// Service to get total department employees
export const getDepartmentEmployees =
  async (): Promise<DepartmentEmployeesResponse> => {
    try {
      const { token, userData } = getAuthData();

      // Get userId from the parsed user data
      const userId = userData?.id;
      if (!userId) throw new Error("User ID is missing");

      // Set headers for the request
      const headers = {
        Authorization: `Bearer ${token}`,
        "X-User-ID": userId,
      };

      // Make the API request
      const response = await axios.get(
        `${BASE_URL}/department/totalEmployees`,
        { headers }
      );

      // Return the response data
      return response.data;
    } catch (error: any) {
      console.error("Error fetching department employees:", error);

      // Handle error based on type
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.message);
        if (error.response) {
          console.error("Response error:", error.response.data);
        }
      } else {
        console.error("Unexpected error:", error.message);
      }

      throw new Error("Error fetching department employees");
    }
  };

// Service to get today's total department present
export const getTodayTotalDepartmentPresent =
  async (): Promise<TodayDepartmentAttendanceResponse> => {
    try {
      const { token, userData } = getAuthData();

      // Get userId from the parsed user data
      const userId = userData?.id;
      if (!userId) throw new Error("User ID is required");

      const role = localStorage.getItem("role");
      if (!role) throw new Error("Role is missing");

      // Set Authorization header with token
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Send role, userId, and other user data in request body
      const response = await axios.post(
        `${BASE_URL}/department/todayPresent`,
        {
          role,
          userId,
          email: userData?.email,
          employeeId: userData?.employeeId,
        },
        { headers }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error fetching today's department attendance:", error);
      throw error;
    }
  };
