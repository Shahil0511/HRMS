import axios from "axios";

const API_URL = "https://hrms-backend-7176.onrender.com/api/leave";
// const API_URL = "http://localhost:8000/api/leave";

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

export interface LeaveRequest extends LeaveForm {
  startDate: string;
  endDate: string;
  totalLeaveDuration: number;
  status: LeaveStatus;
}

// Define the LeaveStatus type
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

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

export const fetchLeaveHistoryByEmployeeId = async (): Promise<
  LeaveRequest[]
> => {
  try {
    const userDataString = localStorage.getItem("user");
    if (!userDataString) {
      throw new Error("No user data found in localStorage");
    }

    const userData = JSON.parse(userDataString);
    const employeeId = userData._id || userData.id;

    if (!employeeId) {
      throw new Error("Employee ID not found in user data");
    }

    const response = await axios.get(
      `${API_URL}/getLeavesByEmpID/${employeeId}`
    );

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid response data format");
    }

    const normalizedLeaves: LeaveRequest[] = response.data.map((leave: any) => {
      const startDate = new Date(leave.startDate).toISOString();
      const endDate = new Date(leave.endDate).toISOString();
      const totalLeaveDuration =
        Math.round(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      return {
        ...leave,
        _id: leave.id || leave._id,
        employeeId: leave.employeeId?.toString(),
        startDate,
        endDate,
        totalLeaveDuration,
        status: capitalizeStatus(leave.status),
        createdAt: new Date(leave.createdAt).toISOString(),
        updatedAt: new Date(leave.updatedAt).toISOString(),
      };
    });

    return normalizedLeaves;
  } catch (error) {
    console.error("Error fetching leave history:", error);
    throw error;
  }
};

function capitalizeStatus(
  status: string
): "Pending" | "Approved" | "Rejected" | "Cancelled" {
  const map: Record<string, "Pending" | "Approved" | "Rejected" | "Cancelled"> =
    {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      cancelled: "Cancelled",
    };

  return map[status.toLowerCase()] || "Pending";
}
