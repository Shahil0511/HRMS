
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, AuthPayload } from "../../../src/types/common";


interface AuthState {
    isLoading: boolean;
    token: string | null;
    user: User | null;
    role: string | null;
    isLoggedIn: boolean;
}

// Initial state
const initialState: AuthState = {
    isLoading: false,
    token: null,
    user: null,
    role: null,
    isLoggedIn: false,
};

// Create the auth slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Start the login process
        loginStart: (state) => {
            state.isLoading = true;
        },
        // Handle successful login
        loginSuccess: (state, action: PayloadAction<AuthPayload>) => {
            state.isLoading = false;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.role = action.payload.role;
            state.isLoggedIn = true;
        },
        // Handle login failure
        loginFailure: (state) => {
            state.isLoading = false;
            state.isLoggedIn = false;
        },
        // Handle logout
        logout: (state) => {
            state.isLoading = false;
            state.token = null;
            state.user = null;
            state.role = null;
            state.isLoggedIn = false;
        },
        // Set auth state (for persistence across refreshes)
        setAuthState: (state, action: PayloadAction<{ token: string; role: string }>) => {
            state.token = action.payload.token;
            state.role = action.payload.role;
            state.isLoggedIn = true;
        },
    },
});

// Export the auth actions and reducer
export const { loginStart, loginSuccess, loginFailure, logout, setAuthState } = authSlice.actions;
export default authSlice.reducer;
