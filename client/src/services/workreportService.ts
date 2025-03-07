import axios from "axios";
import { ReactNode } from "react";

const API_URL = "https://hrms-backend-7176.onrender.com/api/workreports";
// const API_URL = "http://localhost:8000/api/workreports";

export interface WorkReport {
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

export const getEmployeeDetails = async () => {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || !user?.employeeId) {
      throw new Error("Token or Employee ID not found in storage");
    }

    const response = await axios.post(
      `${API_URL}/employeedetails`,
      { employeeId: user.employeeId }, // Send employeeId instead of userId
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching employee details:", error);
    throw error;
  }
};

export const submitWorkReport = async (formData: {
  employeeName: string;
  department: string;
  designation: string;
  date: string;
  completedTasks: string;
  ongoingTasks: string;
}) => {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.employeeId;

    if (!token || !userId) {
      throw new Error("Authorization token or User ID not found");
    }

    const response = await axios.post(
      `${API_URL}/submit`,
      { userId, ...formData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error submitting work report:", error);
    throw error;
  }
};

export const fetchWorkReports = async (): Promise<WorkReport[]> => {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || !user?.employeeId) {
      throw new Error("Token or Employee ID not found in storage");
    }

    const response = await axios.post<WorkReport[]>(
      `${API_URL}/history`,
      { employeeId: user.employeeId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching work reports:", error);
    return [];
  }
};

export const fetchWorkReportManager = async (): Promise<WorkReport[]> => {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || !user?.employeeId) {
      throw new Error("Token or Employee ID not found in storage");
    }

    const response = await axios.post<WorkReport[]>(
      `${API_URL}/manager/history`,
      { employeeId: user.employeeId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching work reports:", error);
    return [];
  }
};

export const fetchWorkReportById = async (
  reportId: string
): Promise<WorkReport | null> => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Error: Token not found in localStorage");
      throw new Error("Token not found in storage");
    }

    const response = await axios.get<WorkReport>(
      `${API_URL}/manager/workreport/${reportId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error fetching work report with ID: ${reportId}`, error);
    return null;
  }
};
