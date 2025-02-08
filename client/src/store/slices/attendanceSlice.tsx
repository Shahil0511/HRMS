import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import attendanceService from "../../services/attendanceServices";
import { Attendance } from "../../types/common";

interface AttendanceState {
    attendance: Attendance | null;
    records: Attendance[]; // Store all attendance records
    adminRecords: Attendance[]; // Separate records for Admin Dashboard
    loading: boolean;
    error: string | null;
}

const initialState: AttendanceState = {
    attendance: null,
    records: [], // Store all attendance records for employees
    adminRecords: [], // Store all attendance records for Admin
    loading: false,
    error: null,
};

/**
 * Fetch all attendance records for employees.
 */
export const fetchAttendanceRecords = createAsyncThunk(
    "attendance/fetchRecords",
    async (_, thunkAPI) => {
        try {
            const response = await attendanceService.getAttendanceRecords();
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.message || "Failed to fetch attendance records.");
        }
    }
);

/**
 * Check-in action and refresh state.
 */
export const checkIn = createAsyncThunk("attendance/checkIn", async (_, thunkAPI) => {
    try {
        await attendanceService.checkIn();
        return thunkAPI.dispatch(fetchAttendanceRecords()).unwrap(); // Refresh all records after check-in
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error?.message || "Check-in failed.");
    }
});

/**
 * Check-out action and refresh state.
 */
export const checkOut = createAsyncThunk("attendance/checkOut", async (_, thunkAPI) => {
    try {
        await attendanceService.checkOut();
        return thunkAPI.dispatch(fetchAttendanceRecords()).unwrap(); // Refresh all records after check-out
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error?.message || "Check-out failed.");
    }
});

/**
 * Load employee-specific attendance records.
 */
export const loadEmployeeAttendance = createAsyncThunk(
    "attendance/loadEmployeeAttendance",
    async (_, thunkAPI) => {
        try {
            const response = await attendanceService.getAttendanceRecords();
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.message || "Failed to load employee attendance records.");
        }
    }
);

/**
 * Fetch today's attendance records for the Admin Dashboard.
 */
export const loadAdminAttendance = createAsyncThunk(
    "attendance/loadAdminAttendance",
    async (_, thunkAPI) => {
        try {
            const response = await attendanceService.getTodayPresentEmployees();
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.message || "Failed to load admin attendance records.");
        }
    }
);

const attendanceSlice = createSlice({
    name: "attendance",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Check-In
            .addCase(checkIn.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkIn.fulfilled, (state, action) => {
                state.loading = false;
                state.records = action.payload || []; // Store all records
                state.attendance = action.payload.length > 0 ? action.payload[0] : null; // Latest record
            })
            .addCase(checkIn.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Check-Out
            .addCase(checkOut.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkOut.fulfilled, (state, action) => {
                state.loading = false;
                state.records = action.payload || []; // Store all records
                state.attendance = action.payload.length > 0 ? action.payload[0] : null; // Latest record
            })
            .addCase(checkOut.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch Attendance Records
            .addCase(fetchAttendanceRecords.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAttendanceRecords.fulfilled, (state, action) => {
                state.loading = false;
                state.records = action.payload || []; // Store all records
                state.attendance = action.payload.length > 0 ? action.payload[0] : null; // Latest record
            })
            .addCase(fetchAttendanceRecords.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Load Employee-specific Attendance Records
            .addCase(loadEmployeeAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadEmployeeAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.records = action.payload || []; // Store all records
            })
            .addCase(loadEmployeeAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch Today's Attendance for Admin Dashboard
            .addCase(loadAdminAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadAdminAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.adminRecords = action.payload || []; // Store admin attendance records separately
            })
            .addCase(loadAdminAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default attendanceSlice.reducer;
