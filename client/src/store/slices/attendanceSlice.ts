import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API URL
const API_URL = "http://localhost:8000/api/attendance";

// Type definitions
interface AttendanceState {
  data: AttendanceEntry[];
  loading: boolean;
  error: string | null;
}

interface AttendanceEntry {
  _id: string;
  checkIn: string | null;
  checkOut: string | null;
}

// Helper function to get the token from localStorage
const getToken = () => {
  return localStorage.getItem("token");
};

// Async Thunks
export const checkIn = createAsyncThunk(
  "attendance/checkIn",
  async (_, { rejectWithValue }) => {
    const token = getToken(); // Get token here dynamically
    if (!token) {
      return rejectWithValue("No token found");
    }

    try {
      const response = await axios.post(
        `${API_URL}/check-in`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the header
          },
        }
      );
      return response.data; // Assuming the payload contains the check-in entry with time
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Check-in failed"
        );
      } else {
        return rejectWithValue(error.message || "Check-in failed");
      }
    }
  }
);

export const checkOut = createAsyncThunk(
  "attendance/checkOut",
  async (_, { rejectWithValue }) => {
    const token = getToken(); // Get token here dynamically
    if (!token) {
      return rejectWithValue("No token found");
    }

    try {
      const response = await axios.post(
        `${API_URL}/check-out`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the header
          },
        }
      );
      return response.data; // Assuming the payload contains the check-out entry with time
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Check-out failed"
        );
      } else {
        return rejectWithValue(error.message || "Check-out failed");
      }
    }
  }
);

export const fetchTodayAttendance = createAsyncThunk(
  "attendance/fetchToday",
  async (_, { rejectWithValue }) => {
    const token = getToken(); // Get token here dynamically
    if (!token) {
      return rejectWithValue("No token found");
    }

    try {
      const response = await axios.get(`${API_URL}/today`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the header
        },
      });
      return response.data; // Assuming the payload contains an array of attendance entries
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to fetch today's attendance"
        );
      } else {
        return rejectWithValue(
          error.message || "Failed to fetch today's attendance"
        );
      }
    }
  }
);

// Initial State
const initialState: AttendanceState = {
  data: [],
  loading: false,
  error: null,
};

// Slice
const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handling Check-In
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        const checkInEntry = action.payload;
        state.data.push({ ...checkInEntry, checkOut: null });
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Handling Check-Out
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        const checkOutEntry = action.payload;
        state.data = state.data.map((entry) =>
          entry._id === checkOutEntry._id
            ? { ...entry, checkOut: checkOutEntry.checkOut }
            : entry
        );
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetching Today's Attendance
      .addCase(fetchTodayAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTodayAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default attendanceSlice.reducer;
