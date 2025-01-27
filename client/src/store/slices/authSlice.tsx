// src/redux/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthState {
    isLoading: boolean;
    token: string | null;
    user: User | null;
    role: string | null;
    isLoggedIn: boolean;
}

const initialState: AuthState = {
    isLoading: false,
    token: null,
    user: null,
    role: null,
    isLoggedIn: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true;
        },
        loginSuccess: (
            state,
            action: PayloadAction<{ token: string; user: User; role: string }>
        ) => {
            state.isLoading = false;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.role = action.payload.role;
            state.isLoggedIn = true;
        },
        loginFailure: (state) => {
            state.isLoading = false;
            state.isLoggedIn = false;
        },
        logout: (state) => {
            state.isLoading = false;
            state.token = null;
            state.user = null;
            state.role = null;
            state.isLoggedIn = false;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

export default authSlice.reducer;
