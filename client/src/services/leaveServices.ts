import axios from "axios";

export interface LeaveForm {
  employeeId: any;
  _id: string;
  employeeName: string;
  department: string;
  designation: string;
  date: string;
  leaveType: string;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Define the LeaveStatus type
export type LeaveStatus = "pending" | "approved" | "rejected";

const API_URL = "http://localhost:8000/api/leave";

// Helper function to get token and user data
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}") || {};

  if (!token) {
    throw new Error("Authorization token or Employee/User ID not found");
  }
  const userId = user?.employeeId || user?.id;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    employeeId: userId,
    isAdmin: user?.role === "admin",
  };
};

export const getEmployeeDetails = async () => {
  try {
    const { headers, employeeId } = getAuthHeaders();
    const response = await axios.post(
      `http://localhost:8000/api/workreports/employeedetails`,
      { employeeId },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching employee details:", error);
    throw error;
  }
};

//submit leaves details
export const submitLeaveForm = async (
  formData: Omit<LeaveForm, "_id" | "status" | "createdAt" | "updatedAt">
) => {
  try {
    const { headers, employeeId } = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/submit`,
      { userId: employeeId, ...formData },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting work report:", error);
    throw error;
  }
};

// Service to fetch all leaves
export const fetchLeaves = async (): Promise<LeaveForm[]> => {
  try {
    const { headers, employeeId } = getAuthHeaders();
    const response = await axios.post<LeaveForm[]>(
      `${API_URL}/history`,
      { employeeId },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching work reports:", error);
    return [];
  }
};

// fetch leaves by ID
export const fetchLeavesById = async (
  reportId: string
): Promise<LeaveForm | null> => {
  try {
    const { headers } = getAuthHeaders();
    const { employeeId } = getAuthHeaders();
    const response = await axios.get<LeaveForm>(
      `${API_URL}/employee/leaves/${employeeId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching work report with ID: ${reportId}`, error);
    return null;
  }
};

export const updateLeave = async (
  reportId: string,
  formData: Omit<LeaveForm, "_id" | "status" | "createdAt" | "updatedAt">
): Promise<LeaveForm | null> => {
  try {
    const { headers } = getAuthHeaders();

    const response = await axios.put<LeaveForm>(
      `${API_URL}/edit/${reportId}`,
      formData,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating work report with ID: ${reportId}`, error);
    return null;
  }
};
