import axios from "axios";

const BASE_URL = "https://hrms-backend-7176.onrender.com/api";
// const BASE_URL = "http://localhost:8000/api"; // Replace with your actual API endpoint

// Define the types for the responses
interface DepartmentEmployeesResponse {
  totalEmployees: number;
}

// interface TodayDepartmentAttendanceResponse {
//   totalPresentToday: number;
// }

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
// export const getTodayTotalDepartmentPresent =
//   async (): Promise<TodayDepartmentAttendanceResponse> => {
//     try {
//       // Get user data from localStorage
//       const userData = localStorage.getItem("user");
//       if (!userData) throw new Error("User data not found in localStorage");

//       // Parse stored user data
//       const user = JSON.parse(userData);

//       // Extract departmentId
//       const departmentId = user?.employee?.department;
//       if (!departmentId) throw new Error("Department ID is required");

//       const response = await axios.get(
//         `${BASE_URL}/api/department/todayPresent/${departmentId}`
//       );
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching today's department attendance:", error);
//       throw error;
//     }
//   };

// Service to get leaves applied
// export const getLeavesApplied = async (): Promise<LeavesAppliedResponse> => {
//   try {
//     const response = await axios.get(`${BASE_URL}/api/leaves/applied`);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching leaves applied:", error);
//     throw error;
//   }
// };

// // Service to get today's worksheet count
// export const getTodaysWorksheet =
//   async (): Promise<TodaysWorksheetResponse> => {
//     try {
//       const response = await axios.get(`${BASE_URL}/api/worksheet/today`);
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching today's worksheet:", error);
//       throw error;
//     }
//   };

// // Service to get complaints
// export const getComplaints = async (): Promise<ComplaintsResponse> => {
//   try {
//     const response = await axios.get(`${BASE_URL}/api/complaints`);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching complaints:", error);
//     throw error;
//   }
// };

// // Service to get other stats
// export const getOthersStats = async (): Promise<OthersResponse> => {
//   try {
//     const response = await axios.get(`${BASE_URL}/api/others`);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching other stats:", error);
//     throw error;
//   }
// };
