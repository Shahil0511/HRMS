import axios from "axios";
import { fetchWorkReports } from "./workreportService";

const API_URL = "https://hrms-backend-7176.onrender.com/api/payroll";
// const API_URL = "http://localhost:8000/api/payroll";

// Define TypeScript interfaces
export interface WorkReport {
  id: number;
  day: string;
  date: string;
  status: "Present" | "Absent" | "Week Off" | "Holiday";
  workReportStatus: "Pending" | "Approved" | "Rejected";
  completionStatus: "Completed" | "Pending" | "Rejected";
  hoursWorked?: number;
}

export interface PayrollStat {
  title: string;
  value: string;
  icon: React.ComponentType;
  change?: string;
  isPositive?: boolean;
}

export interface PayrollData {
  employeeId: string;
  employeeName: string;
  monthlySalary: number;
  currentMonthEarnings: number;
  pendingWorkReports: number;
  deductions: number;
  workReports: WorkReport[];
}

export interface SalaryData {
  baseSalary: number;
  deductions: number;
}

export const fetchSalary = async (
  token: string,
  employeeId: string
): Promise<SalaryData> => {
  try {
    const response = await axios.post(
      API_URL,
      { employeeId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      return {
        baseSalary: response.data.data.baseSalary,
        deductions: response.data.data.deductions,
      };
    }
    throw new Error("Failed to fetch salary");
  } catch (error) {
    console.error("Error fetching salary:", error);
    throw new Error("Failed to fetch salary. Please try again.");
  }
};

export const fetchPayrollData = async (
  employeeId: string,
  employeeName: string,
  salary: number,
  deduction: number,
  pendingReports: number
): Promise<PayrollData> => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data for a week
    return {
      employeeId,
      employeeName,
      monthlySalary: salary,
      currentMonthEarnings: salary - deduction,
      pendingWorkReports: pendingReports,
      deductions: deduction,
      workReports: [
        {
          id: 1,
          day: "Monday",
          date: "2025-03-24",
          status: "Present",
          workReportStatus: "Approved",
          completionStatus: "Completed",
          hoursWorked: 8,
        },
        {
          id: 2,
          day: "Tuesday",
          date: "2025-03-25",
          status: "Present",
          workReportStatus: "Approved",
          completionStatus: "Completed",
          hoursWorked: 8.5,
        },
        {
          id: 3,
          day: "Wednesday",
          date: "2025-03-26",
          status: "Present",
          workReportStatus: "Pending",
          completionStatus: "Pending",
          hoursWorked: 7.5,
        },
        {
          id: 4,
          day: "Thursday",
          date: "2025-03-27",
          status: "Present",
          workReportStatus: "Pending",
          completionStatus: "Pending",
          hoursWorked: 0,
        },
        {
          id: 5,
          day: "Friday",
          date: "2025-03-28",
          status: "Absent",
          workReportStatus: "Rejected",
          completionStatus: "Rejected",
          hoursWorked: 0,
        },
        {
          id: 6,
          day: "Saturday",
          date: "2025-03-29",
          status: "Week Off",
          workReportStatus: "Approved",
          completionStatus: "Completed",
          hoursWorked: 0,
        },
        {
          id: 7,
          day: "Sunday",
          date: "2025-03-30",
          status: "Week Off",
          workReportStatus: "Approved",
          completionStatus: "Completed",
          hoursWorked: 0,
        },
      ],
    };
  } catch (err) {
    console.error("Error fetching payroll data:", err);
    throw new Error("Failed to fetch payroll data. Please try again later.");
  }
};

export const getUserDataFromLocalStorage = () => {
  const response = localStorage.getItem("user");
  if (response) {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
  return null;
};

export const reportData = async () => {
  try {
    const reportData = await fetchWorkReports();
    if (!Array.isArray(reportData)) {
      throw new Error("Invalid report data format");
    }

    const pendingReports = reportData.filter(
      (report) => report.status === "Pending"
    );

    return pendingReports;
  } catch (error) {
    console.error("Error fetching or processing report data:", error);
    return null;
  }
};
