import axios from "axios";

const API_URL = "https://hrms-backend-7176.onrender.com/api/payroll/admin";
// const API_URL = "http://localhost:8000/api/payroll/admin";

const getAuthToken = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error(
      "No token found in localStorage. User might not be logged in."
    );
  }
  return token;
};

export const fetchEmployeeName = async (
  id: string | undefined
): Promise<string | null> => {
  const token = getAuthToken();
  if (!id || !token) return null;

  try {
    const response = await axios.get(`${API_URL}/employees/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.name;
  } catch (error: any) {
    console.error(
      "Error fetching employee name:",
      error.response?.data || error.message
    );
    return null;
  }
};
