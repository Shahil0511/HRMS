import axios from "axios";

// const BASE_URL = "https://hrms-backend-7176.onrender.com/api";
const BASE_URL = "http://localhost:8000/api";

// Define the types for the responses
interface DepartmentEmployeesResponse {
  totalEmployees: number;
}

interface TodayDepartmentAttendanceResponse {
  totalPresent: number;
  totalPresentToday: number;
}

// interface LeavesAppliedResponse {
//   leavesApplied: number;
// }

// interface TodaysWorksheetResponse {
//   todaysWorksheet: number;
// }

// interface ComplaintsResponse {
//   complaints: number;
// }

// interface OthersResponse {
//   others: number;
// }

// Service to get total department employees

export const getDepartmentEmployees =
  async (): Promise<DepartmentEmployeesResponse> => {
    try {
      // Retrieve token and user data from localStorage
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      // Check if token and user data exist
      if (!token) throw new Error("Authorization token is missing");
      if (!userData) throw new Error("User data not found in localStorage");

      // Parse user data from localStorage
      const user = JSON.parse(userData);
      const userId = user?.id;

      // Check if userId is available
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

      // Error handling: distinguish between different types of errors
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
      // Get user data from localStorage
      const userData = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!userData || !token || !role) {
        throw new Error("User data, token, or role not found in localStorage");
      }

      // Parse stored user data
      const user = JSON.parse(userData);

      // Extract user details from the session
      const userId = user?.id;
      if (!userId) throw new Error("User ID is required");

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
          email: user?.email,
          employeeId: user?.employeeId,
        },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching today's department attendance:", error);
      throw error;
    }
  };
