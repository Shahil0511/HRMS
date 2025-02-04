import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthPayload } from "../../../src/types/common";

// Define the initial state for auth
interface AuthState {
    isLoading: boolean;
    token: string | null;
    user: {
        id: string;
        email: string;
        employeeId?: string;  // 🔥 Add employeeId here
    } | null;
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
            state.user = {
                id: action.payload.user._id,  // ✅ User ID
                email: action.payload.user.email,
                employeeId: action.payload.user.employeeId || "", // ✅ Store employeeId
            };
            state.role = action.payload.role;
            state.isLoggedIn = true;

            // Persist user data in localStorage
            if (state.user && state.token && state.role) {
                localStorage.setItem("user", JSON.stringify(state.user));
                localStorage.setItem("token", state.token);
                localStorage.setItem("role", state.role);
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
            localStorage.removeItem("role");
        },
        // Set auth state from persisted localStorage
        setAuthState: (state) => {
            const user = localStorage.getItem("user");
            const token = localStorage.getItem("token");
            const role = localStorage.getItem("role");

            if (user && token && role) {
                try {
                    const parsedUser = JSON.parse(user);
                    state.user = {
                        id: parsedUser.id,
                        email: parsedUser.email,
                        employeeId: parsedUser.employeeId || "", // ✅ Ensure employeeId is loaded
                    };
                    state.token = token;
                    state.role = role;
                    state.isLoggedIn = true;
                } catch (error) {
                    console.error("Error parsing user data from localStorage", error);
                    state.isLoggedIn = false;
                    state.user = null;
                    state.token = null;
                    state.role = null;
                }
            } else {
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
