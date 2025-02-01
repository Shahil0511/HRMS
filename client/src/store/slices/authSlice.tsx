import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthPayload } from "../../../src/types/common";

// Define the initial state for auth
interface AuthState {
    isLoading: boolean;
    token: string | null;
    user: any | null;  // Store user as part of the auth state
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

// Create auth slice
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
            state.user = action.payload.user;  // Save user data
            state.role = action.payload.role;
            state.isLoggedIn = true;

            // Persist user data in localStorage (for persistence across refreshes)
            if (state.user && state.token && state.role) {
                localStorage.setItem("user", JSON.stringify(state.user));
                localStorage.setItem("token", state.token);
                localStorage.setItem("role", state.role);  // Ensure role is also stored in localStorage
            }
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

            // Clear from localStorage on logout
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("role");  // Ensure role is also removed from localStorage
        },
        // Set auth state from persisted localStorage (for persistence across refreshes)
        setAuthState: (state) => {
            const user = localStorage.getItem("user");
            const token = localStorage.getItem("token");
            const role = localStorage.getItem("role");

            // If user, token, and role exist in localStorage
            if (user && token && role) {
                try {
                    const parsedUser = JSON.parse(user);
                    state.user = parsedUser;  // Safely parse user data
                    state.token = token;
                    state.role = role;  // Set role from localStorage
                    state.isLoggedIn = true;
                } catch (error) {
                    console.error("Error parsing user data from localStorage", error);
                    state.isLoggedIn = false;
                    state.user = null;
                    state.token = null;
                    state.role = null;
                }
            } else {
                // If no user, token, or role found in localStorage, reset state
                state.isLoggedIn = false;
                state.user = null;
                state.token = null;
                state.role = null;
            }
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, setAuthState } = authSlice.actions;
export default authSlice.reducer;
