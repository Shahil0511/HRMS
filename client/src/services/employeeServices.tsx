import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = "https://hrms-backend-7176.onrender.com/api/employees";
// const API_URL = "http://localhost:8000/api/employees";

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => localStorage.getItem("token");

/**
 * Check if the token is expired
 */
const isTokenValid = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token); // Decode the JWT
    return decoded.exp * 1000 > Date.now(); // Check if token is expired
  } catch {
    return false; // Invalid or malformed token
  }
};

/**
 * Set the Authorization header for API requests
 */
const setAuthHeader = (token: string) => ({
  "Content-Type": "application/json", // Corrected content type
  Authorization: `Bearer ${token}`,
});

/**
 * Handle token validation and return error if invalid
 */
const handleTokenValidation = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("User not authenticated. Please log in.");
  }

  if (!isTokenValid(token)) {
    localStorage.removeItem("token"); // Clear expired token
    throw new Error("Session expired. Please log in again.");
  }

  return token;
};

/**
 * Handle API errors and structure them in a common format
 */
const handleApiError = (error: any): { success: boolean; message: string } => {
  console.error("API Error:", error);
  return {
    success: false,
    message: error?.response?.data?.message || "An unexpected error occurred.",
  };
};

/**
 * Make POST request to the API
 */
const postRequest = async (
  url: string,
  data: object,
  token: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const response = await axios.post(url, data, {
      headers: setAuthHeader(token),
    });

    return {
      success: true,
      message: response?.data?.message || "Operation successful!",
      data: response?.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Make GET request to the API
 */
const getRequest = async (url: string, params?: object): Promise<any> => {
  try {
    const token = handleTokenValidation();
    const response = await axios.get(url, {
      headers: setAuthHeader(token),
      params,
    });

    return response?.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Add a new employee
 */
export const addEmployee = async (employeeData: any) => {
  const token = handleTokenValidation();
  return postRequest(API_URL, employeeData, token);
};

/**
 * Get all employees with optional search
 */
export const getAllEmployees = async (search?: string) => {
  const response = await getRequest(API_URL, { search });
  return response;
};

/**
 * Get the current authenticated user's employee data
 */
export const getUserEmployeeData = async () => {
  const token = handleTokenValidation();
  return getRequest(`${API_URL}/user`, { token });
};

/**
 * Get the total number of employees
 */
export const getTotalEmployee = async () => {
  return getRequest(`${API_URL}/totalemployees`);
};

/**
 * Get total employees present today
 */
export const getTodayTotalEmployeePresent = async () => {
  return getRequest(`${API_URL}/todaypresent`);
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async (employeeId: string) => {
  try {
    const token = handleTokenValidation();
    const response = await axios.get(`${API_URL}/${employeeId}`, {
      headers: {
        Authorization: `Bearer ${token}` // Proper way to send the token
      }
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error("Employee not found");
    }
  } catch (error: any) {
    return handleApiError(error);
  }
};

/**
 * Get the profile of the current authenticated employee
 */
export const getEmployeeProfile = async () => {
  const token = handleTokenValidation();
  return getRequest(`${API_URL}/profile/myprofile`, { token });
};

/**
 * Get employees by department
 */
export const getEmployeesByDepartment = async () => {
  try {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!userData || !token || !role) {
      throw new Error("User data, token, or role not found in localStorage");
    }

    const user = JSON.parse(userData);
    const userId = user?.id;
    if (!userId) throw new Error("User ID is required");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.post(
      `${API_URL}/department_employee`,
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
    console.error("Error fetching employees by department:", error);
    throw error;
  }
};



export const fetchEmployeeById = async (attendanceId: string) => {
  try {
    const token = handleTokenValidation();
    const response = await axios.get(`${API_URL}/attendance/${attendanceId}`, {
      headers: setAuthHeader(token),
    });
    return {
      success: true,
      name: response.data.data.name,
      data: response.data.data
    };
  } catch (error) {
    console.error("Error fetching employee:", error);
    return { success: false, message: "Failed to fetch employee" };
  }
};