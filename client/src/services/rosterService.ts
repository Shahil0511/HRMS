import axios from "axios";

// const API_URL = "http://localhost:8000/api/roster";
const API_URL = "https://hrms-backend-7176.onrender.com/api/roster";

export interface IAssignedEmployee {
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
    const response = await axios.post<{ data: IWeeklyRoster }>(
      `${API_URL}/weekly`,
      weeklyRosterData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Weekly roster data being sent:", weeklyRosterData);

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error("Failed to create weekly roster:", errorMsg);
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
 * Updates a weekly roster
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
    const response = await axios.put<{ data: IWeeklyRoster }>(
      `${API_URL}/weekly/${rosterId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error("Failed to update weekly roster:", errorMsg);
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
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
    await axios.delete(`${API_URL}/weekly/${rosterId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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
