import axios from "axios";

// const API_URL = "https://hrms-backend-7176.onrender.com/api/departments";
const API_URL = "http://localhost:8000/api/departments";

// Add department function using axios
export const addDepartment = async (
  formData: {
    departmentName: string;
    description: string;
    headOfDepartment: string;
  },
  token: string
) => {
  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle the response and return it
    return {
      success: true,
      message: response?.data?.message || "Department added successfully!",
      data: response?.data, // You can return the actual response data if needed
    };
  } catch (error: any) {
    console.error("Error adding department:", error);

    return {
      success: false,
      message: error?.response?.data?.message || "Failed to add department",
    };
  }
};

// Fetch departments with search query
export const getDepartments = async (searchQuery: string) => {
  try {
    const response = await axios.get(`${API_URL}`, {
      params: { search: searchQuery }, // Add search query as query parameter
    });

    // You can return the response data directly here
    return response?.data; // Assuming response.data contains the department list
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};
export const getAllDepartments = async () => {
  try {
    const response = await axios.get(API_URL); // No parameters are passed

    return response?.data; // Assuming response.data contains the department list
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

export const getTotalDepartment = async () => {
  try {
    const response = await axios.get(`${API_URL}/totaldepartment`);

    return response?.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

// export const getDepartmentById = async (departmentId: string) => {
//   try {
//     const response = await axios.get(`${API_URL}/${departmentId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error(
//       "Error fetching department:",
//       error.response?.data?.message || error.message
//     );
//     throw new Error(error.response?.data?.message || "Failed to fetch");
//   }
// };
