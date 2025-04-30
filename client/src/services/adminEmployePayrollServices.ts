import axios from "axios";

// const API_URL = "https://hrms-backend-7176.onrender.com/api/payroll/admin";
const API_URL = "http://localhost:8000/api/payroll/admin";

export interface WorkReport {
  _id: string;
  employeeName: string;
  department: string;
  designation: string;
  date: string;
  completedTasks: string;
  ongoingTasks: string;
  status: "Approved" | "Pending" | "Rejected";
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Attendance {
  _id: string;
  employeeId: string;
  date: string;
  status: "Present" | "Absent" | "Half Day" | "Leave";
  checkIn?: string;
  checkOut?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface PayrollData {
  attendance: Attendance[];
  name: string;
  salary: number;
  workReports: WorkReport[];
  earnings?: number;
  pendingPayroll?: number;
  deductions?: number;
}

const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

/**
 * Fetches complete employee payroll data including work reports and attendance
 * @param id Employee ID
 * @returns Promise with Payroll data or null if error occurs
 */
export const fetchEmployeePayrollData = async (
  id: string | undefined
): Promise<PayrollData | null> => {
  if (!id) return null;

  const token = getAuthToken();
  if (!token) {
    console.error("Authentication token not found");
    return null;
  }

  try {
    const response = await axios.get<PayrollData>(
      `${API_URL}/employees/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000, // 5 seconds timeout
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error("Failed to fetch payroll data:", errorMsg);
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
};
