import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import attendanceService from "../../services/attendanceServices";
import { Attendance } from "../../types/common";

interface AttendanceState {
    attendance: Attendance | null;
    records: Attendance[]; // Added for storing multiple attendance records
    loading: boolean;
    error: string | null;
}

const initialState: AttendanceState = {
    attendance: null,
    records: [],
    loading: false,
    error: null,
};

// Async thunk to check in
export const checkIn = createAsyncThunk("attendance/checkIn", async (_, thunkAPI) => {
    try {
        return await attendanceService.checkIn();
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error?.message || "Check-in failed.");
    }
});

// Async thunk to check out
export const checkOut = createAsyncThunk("attendance/checkOut", async (_, thunkAPI) => {
    try {
        return await attendanceService.checkOut();
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error?.message || "Check-out failed.");
    }
});

// Async thunk to fetch attendance records
export const fetchAttendanceRecords = createAsyncThunk(
    "attendance/fetchRecords",
    async (_, thunkAPI) => {
        try {
            return await attendanceService.getAttendanceRecords();
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.message || "Failed to fetch attendance records.");
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
                state.attendance = action.payload;
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
                state.attendance = action.payload;
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
                state.records = action.payload;
            })
            .addCase(fetchAttendanceRecords.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default attendanceSlice.reducer;
