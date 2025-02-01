import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchTodayAttendance,
  markAttendance,
} from "../../services/AttendanceService";

// Define a type for Attendance state
interface AttendanceState {
  status: "Present" | "Absent" | "Pending";
  checkInTime: string | null;
  checkOutTime: string | null;
  isLoading: boolean;
  message: string | null;
  error: string | null;
}

const initialState: AttendanceState = {
  status: "Absent",
  checkInTime: null,
  checkOutTime: null,
  isLoading: false,
  message: null,
  error: null,
};

// Thunk to fetch today's attendance
export const fetchAttendance = createAsyncThunk<
  {
    status: "Present" | "Absent" | "Pending";
    checkInTime: string | null;
    checkOutTime: string | null;
    message: string;
  },
  string,
  { rejectValue: string }
>("attendance/fetchToday", async (employeeId, { rejectWithValue }) => {
  try {
    const response = await fetchTodayAttendance(employeeId);
    return response; // Ensure this matches the expected shape
  } catch (error) {
    return rejectWithValue("An error occurred while fetching attendance.");
  }
});

// Thunk to mark attendance (check-in & check-out)
export const markEmployeeAttendance = createAsyncThunk<
  { checkIn: string; checkOut: string },
  { employeeId: string; checkIn: string; checkOut: string },
  { rejectValue: string }
>(
  "attendance/mark",
  async ({ employeeId, checkIn, checkOut }, { rejectWithValue }) => {
    try {
      const response = await markAttendance(employeeId, checkIn, checkOut);
      return response; // Ensure this matches the expected shape
    } catch (error) {
      return rejectWithValue("An error occurred while marking attendance.");
    }
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = action.payload.status;
        state.checkInTime = action.payload.checkInTime;
        state.checkOutTime = action.payload.checkOutTime;
        state.message = action.payload.message;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.message = null;
      })
      .addCase(markEmployeeAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markEmployeeAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = "Present";
        state.checkInTime = action.payload.checkIn;
        state.checkOutTime = action.payload.checkOut;
        state.message = "Attendance marked successfully.";
      })
      .addCase(markEmployeeAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.message = null;
      });
  },
});

export default attendanceSlice.reducer;
