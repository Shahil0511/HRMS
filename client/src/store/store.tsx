import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import attendanceReducer from "./slices/attendanceSlice";
import { useDispatch } from "react-redux";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        attendance: attendanceReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();