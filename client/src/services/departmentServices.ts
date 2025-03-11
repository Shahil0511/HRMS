import axios, { AxiosResponse } from "axios";

// const API_URL = "https://hrms-backend-7176.onrender.com/api/departments";
const API_URL = "http://localhost:8000/api/departments";

const handleApiError = (error: any): { success: boolean; message: string } => {
  console.error("API Error:", error);
  return {
    success: false,
    message: error?.response?.data?.message || "An unexpected error occurred.",
  };
};

const getAuthHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const postRequest = async (
  url: string,
  formData: object,
  token: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const response: AxiosResponse = await axios.post(url, formData, {
      headers: getAuthHeaders(token),
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

const getRequest = async (url: string, params?: object): Promise<any> => {
  try {
    const response: AxiosResponse = await axios.get(url, { params });
    return response?.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Add department function using axios
export const addDepartment = async (
  formData: {
    departmentName: string;
    description: string;
    headOfDepartment: string;
  },
  token: string
) => {
  return postRequest(API_URL, formData, token);
};
export const getDepartments = async (searchQuery: string) => {
  return getRequest(API_URL, { search: searchQuery });
};

// Fetch all departments
export const getAllDepartments = async () => {
  return getRequest(API_URL);
};

// Fetch total department count
export const getTotalDepartment = async () => {
  return getRequest(`${API_URL}/totaldepartment`);
};
