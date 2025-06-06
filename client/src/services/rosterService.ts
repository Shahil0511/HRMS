import axios from "axios";

// const API_URL = "http://localhost:8000/api/roster";
const API_URL = "https://hrms-backend-7176.onrender.com/api/roster";

export interface IAssignedEmployee {
  employeeObject: any;
  employee: string;
  department?: string;
}

// New interfaces for weekly roster structure
export interface IDayAssignment {
  date: string; // YYYY-MM-DD format
  dayName: string; // Monday, Tuesday, etc.
  timeSlots: ITimeSlotAssignment[];
}

export interface ITimeSlotAssignment {
  timeSlot: string; // e.g., "08-17", "09-18"
  shiftStart: string; // e.g., "08:00"
  shiftEnd: string; // e.g., "17:00"
  assignedEmployees: IAssignedEmployee[];
}

export interface IWeeklyRoster {
  _id?: string;
  department: string;
  weekStartDate: string; // Start date of the week (Monday)
  weekEndDate: string; // End date of the week (Sunday)
  weekNumber: number; // Week number of the year
  year: number;
  dailyAssignments: IDayAssignment[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Keep the original interface for backward compatibility
export interface IRoster {
  _id?: string;
  department: string;
  shiftDate: string;
  shiftType: "Morning" | "Evening" | "Night" | "Custom";
  shiftStart: string;
  shiftEnd: string;
  assignedEmployees: IAssignedEmployee[];
  autoRepeat?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

/**
 * Creates a weekly roster with day-wise assignments
 * @param weeklyRosterData Weekly roster data with daily assignments
 * @returns Promise with created weekly roster or null if error occurs
 */
export const createWeeklyRoster = async (
  weeklyRosterData: Omit<
    IWeeklyRoster,
    "_id" | "createdBy" | "updatedBy" | "createdAt" | "updatedAt"
  >
): Promise<IWeeklyRoster | null> => {
  const token = getAuthToken();
  if (!token) {
    console.error("Authentication token not found");
    return null;
  }

  try {
    console.log("Creating weekly roster with data:", weeklyRosterData);

    const response = await axios.post<{ data: IWeeklyRoster }>(
      `${API_URL}/weekly`,
      weeklyRosterData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Weekly roster created successfully:", response.data.data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error("Failed to create weekly roster:", errorMsg);
      console.error("Error details:", error.response?.data);
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
};

/**
 * Fetches weekly rosters for a specific date range
 * @param startDate Start date in ISO format
 * @param endDate End date in ISO format
 * @returns Promise with weekly roster data or null if error occurs
 */
export const fetchWeeklyRosters = async (
  startDate: string,
  endDate: string
): Promise<IWeeklyRoster[] | null> => {
  const token = getAuthToken();
  if (!token) {
    console.error("Authentication token not found");
    return null;
  }

  try {
    console.log(`Fetching weekly rosters from ${startDate} to ${endDate}`);

    const response = await axios.get<{ data: IWeeklyRoster[] }>(
      `${API_URL}/weekly`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          startDate,
          endDate,
        },
      }
    );

    console.log("Weekly rosters fetched successfully:", response.data.data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error("Failed to fetch weekly rosters:", errorMsg);
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
};

/**
 * Updates a weekly roster - ENHANCED VERSION
 * @param rosterId Weekly roster ID
 * @param updateData Updated weekly roster data
 * @returns Promise with updated weekly roster or null if error occurs
 */
export const updateWeeklyRoster = async (
  rosterId: string,
  updateData: Partial<IWeeklyRoster>
): Promise<IWeeklyRoster | null> => {
  const token = getAuthToken();
  if (!token) {
    console.error("Authentication token not found");
    return null;
  }

  try {
    console.log(`Updating weekly roster ${rosterId} with data:`, updateData);

    const response = await axios.put<{ data: IWeeklyRoster }>(
      `${API_URL}/weekly/${rosterId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Weekly roster updated successfully:", response.data.data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error("Failed to update weekly roster:", errorMsg);
      console.error("Error details:", error.response?.data);

      // Provide more specific error information
      if (error.response?.status === 404) {
        console.error("Roster not found - check if the roster ID exists");
      } else if (error.response?.status === 403) {
        console.error("Permission denied - check user authorization");
      } else if (error.response?.status === 400) {
        console.error("Bad request - check the update data format");
      }
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
};

/**
 * NEW: Updates specific time slot assignments for a roster
 * @param rosterId Weekly roster ID
 * @param dayName Day name (e.g., "Monday")
 * @param timeSlot Time slot (e.g., "08-17")
 * @param assignedEmployees New employee assignments
 * @returns Promise with updated weekly roster or null if error occurs
 */
export const updateTimeSlotAssignments = async (
  rosterId: string,
  dayName: string,
  timeSlot: string,
  assignedEmployees: IAssignedEmployee[]
): Promise<IWeeklyRoster | null> => {
  const token = getAuthToken();
  if (!token) {
    console.error("Authentication token not found");
    return null;
  }

  try {
    console.log(
      `Updating time slot ${timeSlot} for ${dayName} in roster ${rosterId}`
    );

    const response = await axios.patch<{ data: IWeeklyRoster }>(
      `${API_URL}/weekly/${rosterId}/timeslot`,
      {
        dayName,
        timeSlot,
        assignedEmployees,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Time slot updated successfully:", response.data.data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error("Failed to update time slot:", errorMsg);
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
};

/**
 * NEW: Validates roster data before saving/updating
 * @param rosterData Roster data to validate
 * @returns Validation result with any errors
 */
export const validateRosterData = (
  rosterData: Partial<IWeeklyRoster>
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!rosterData.department) {
    errors.push("Department is required");
  }

  if (!rosterData.weekStartDate || !rosterData.weekEndDate) {
    errors.push("Week start and end dates are required");
  }

  if (
    !rosterData.dailyAssignments ||
    rosterData.dailyAssignments.length === 0
  ) {
    errors.push("Daily assignments are required");
  }

  if (rosterData.dailyAssignments) {
    rosterData.dailyAssignments.forEach((day, dayIndex) => {
      if (!day.date || !day.dayName) {
        errors.push(`Day ${dayIndex + 1}: Date and day name are required`);
      }

      if (!day.timeSlots || day.timeSlots.length === 0) {
        errors.push(`Day ${day.dayName}: Time slots are required`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Deletes a weekly roster
 * @param rosterId Weekly roster ID
 * @returns Promise with success status or null if error occurs
 */
export const deleteWeeklyRoster = async (
  rosterId: string
): Promise<boolean | null> => {
  const token = getAuthToken();
  if (!token) {
    console.error("Authentication token not found");
    return null;
  }

  try {
    console.log(`Deleting weekly roster ${rosterId}`);

    await axios.delete(`${API_URL}/weekly/${rosterId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Weekly roster deleted successfully");
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error("Failed to delete weekly roster:", errorMsg);
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
};

// Keep original functions for backward compatibility
export const fetchRosters = async (
  startDate: string,
  endDate: string
): Promise<IRoster[] | null> => {
  const token = getAuthToken();
  if (!token) {
    console.error("Authentication token not found");
    return null;
  }

  try {
    const response = await axios.get<{ data: IRoster[] }>(`${API_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        startDate,
        endDate,
      },
    });

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error("Failed to fetch rosters:", errorMsg);
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
};
// Add these functions to your existing rosterService.ts file

/**
 * Fetches weekly roster for current user/employee
 * @param startDate Start date in ISO format
 * @param endDate End date in ISO format
 * @returns Promise with weekly roster data for employee view
 */
export const fetchEmployeeWeeklyRoster = async (
  startDate: string,
  endDate: string
): Promise<IWeeklyRoster[] | null> => {
  const token = getAuthToken();
  if (!token) {
    console.error("Authentication token not found");
    return null;
  }

  try {
    console.log(
      `Fetching employee weekly roster from ${startDate} to ${endDate}`
    );

    const response = await axios.get<{ data: IWeeklyRoster[] }>(
      `${API_URL}/employee/weekly`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          startDate,
          endDate,
        },
      }
    );

    console.log(
      "Employee weekly roster fetched successfully:",
      response.data.data
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error("Failed to fetch employee weekly roster:", errorMsg);
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
};

/**
 * Fetches roster assignments for a specific employee
 * @param employeeId Employee ID
 * @param startDate Start date in ISO format
 * @param endDate End date in ISO format
 * @returns Promise with employee's assignments
 */
export const fetchEmployeeAssignments = async (
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<any[] | null> => {
  const token = getAuthToken();
  if (!token) {
    console.error("Authentication token not found");
    return null;
  }

  try {
    console.log(`Fetching assignments for employee ${employeeId}`);

    const response = await axios.get<{ data: any[] }>(
      `${API_URL}/employee/${employeeId}/assignments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          startDate,
          endDate,
        },
      }
    );

    console.log(
      "Employee assignments fetched successfully:",
      response.data.data
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error("Failed to fetch employee assignments:", errorMsg);
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
};

/**
 * Gets current user's roster for today
 * @returns Promise with today's roster data
 */
export const getTodayRoster = async (): Promise<any[] | null> => {
  const today = new Date().toISOString().split("T")[0];
  return await fetchEmployeeAssignments("me", today, today);
};

/**
 * Gets current user's weekly roster
 * @param weekStartDate Start of the week
 * @returns Promise with week's roster data
 */
export const getMyWeeklyRoster = async (
  weekStartDate: string
): Promise<IWeeklyRoster[] | null> => {
  const weekStart = new Date(weekStartDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return await fetchEmployeeWeeklyRoster(
    weekStart.toISOString().split("T")[0],
    weekEnd.toISOString().split("T")[0]
  );
};
