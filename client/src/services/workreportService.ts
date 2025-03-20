import axios from "axios";
import { ReactNode } from "react";

const API_URL = "https://hrms-backend-7176.onrender.com/api/workreports";
// const API_URL = "http://localhost:8000/api/workreports";

export interface WorkReport {
  submissionDate: any;
  details: ReactNode;
  _id: string;
  employeeName: string;
  department: string;
  designation: string;
  date: string;
  completedTasks: string;
  ongoingTasks: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

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
      `${API_URL}/employeedetails`,
      { employeeId },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching employee details:", error);
    throw error;
  }
};

export const submitWorkReport = async (
  formData: Omit<WorkReport, "_id" | "status" | "createdAt" | "updatedAt">
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

export const fetchWorkReports = async (): Promise<WorkReport[]> => {
  try {
    const { headers, employeeId } = getAuthHeaders();
    const response = await axios.post<WorkReport[]>(
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

export const fetchWorkReportManager = async (): Promise<WorkReport[]> => {
  try {
    const { headers, employeeId } = getAuthHeaders();
    const response = await axios.post<WorkReport[]>(
      `${API_URL}/manager/history`,
      { employeeId },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching work reports for manager:", error);
    return [];
  }
};
export const fetchWorkReportAdmin = async (): Promise<WorkReport[]> => {
  try {
    const { headers, employeeId, isAdmin } = getAuthHeaders();
    const requestBody = isAdmin ? {} : { employeeId };
    const response = await axios.post<WorkReport[]>(
      `${API_URL}/admin/history`,
      requestBody,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching work reports for manager:", error);
    return [];
  }
};

export const fetchWorkReportById = async (
  reportId: string
): Promise<WorkReport | null> => {
  try {
    const { headers } = getAuthHeaders();
    const response = await axios.get<WorkReport>(
      `${API_URL}/manager/workreport/${reportId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching work report with ID: ${reportId}`, error);
    return null;
  }
};

const updateWorkReportStatus = async (
  id: string,
  action: "approve" | "reject"
): Promise<boolean> => {
  try {
    const { headers } = getAuthHeaders();
    await axios.put(`${API_URL}/${id}/${action}`, {}, { headers });
    return true;
  } catch (error) {
    console.error(`Error ${action}ing work report with ID: ${id}`, error);
    return false;
  }
};

export const approveWorkReport = (id: string) =>
  updateWorkReportStatus(id, "approve");
export const rejectWorkReport = (id: string) =>
  updateWorkReportStatus(id, "reject");
