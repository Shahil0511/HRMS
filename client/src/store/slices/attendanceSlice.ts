import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  checkIn as apiCheckIn,
  checkOut as apiCheckOut,
  AttendanceEntry,
} from "../../services/AttendanceService";

// ✅ Type Definitions
interface AttendanceState {
  data: AttendanceEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  data: [],
  loading: false,
  error: null,
};

// ✅ Helper Function to Get Employee ID
const getEmployeeId = (state: RootState): string | null =>
  state.auth.user?.employeeId || null;

// ✅ Async Check-In Action
export const checkIn = createAsyncThunk(
  "attendance/checkIn",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const employeeId = getEmployeeId(state);

      if (!employeeId) {
        return rejectWithValue("⚠️ Employee ID is missing in Redux store.");
      }

      console.log("📌 Sending Check-In Request:", employeeId);
      return await apiCheckIn(employeeId);
    } catch (error: any) {
      console.error("❌ Check-In Error:", error.message);
      return rejectWithValue(
        error.response?.data?.message || "Check-in failed."
      );
    }
  }
);

// ✅ Async Check-Out Action
export const checkOut = createAsyncThunk(
  "attendance/checkOut",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const employeeId = getEmployeeId(state);

      if (!employeeId) {
        return rejectWithValue("⚠️ Employee ID is missing in Redux store.");
      }

      console.log("📌 Sending Check-Out Request:", employeeId);
      return await apiCheckOut(employeeId);
    } catch (error: any) {
      console.error("❌ Check-Out Error:", error.message);
      return rejectWithValue(
        error.response?.data?.message || "Check-out failed."
      );
    }
  }
);

// ✅ Redux Slice for Attendance Management
const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🔵 Handling Check-In
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push({ ...action.payload, checkOut: undefined }); // ✅ Fix: Use undefined instead of null
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔴 Handling Check-Out
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((entry) =>
          entry._id === action.payload._id
            ? { ...entry, checkOut: action.payload.checkOut }
            : entry
        );
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default attendanceSlice.reducer;
