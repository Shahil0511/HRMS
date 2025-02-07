// FRONTEND - attendanceSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import attendanceService from "../../services/attendanceServices";
import { IAttendance } from "../../types/common";

interface AttendanceState {
    attendance: IAttendance | null;
    loading: boolean;
    error: string | null;
}

const initialState: AttendanceState = {
    attendance: null,
    loading: false,
    error: null,
};

export const checkIn = createAsyncThunk(
    "attendance/checkIn",
    async (_, thunkAPI) => {
        try {
            return await attendanceService.checkIn();
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const checkOut = createAsyncThunk(
    "attendance/checkOut",
    async (_, thunkAPI) => {
        try {
            return await attendanceService.checkOut();
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const attendanceSlice = createSlice({
    name: "attendance",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
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
            .addCase(checkOut.fulfilled, (state, action) => {
                state.attendance = action.payload;
            })
            .addCase(checkOut.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export default attendanceSlice.reducer;
