import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the user state interface
interface UserState {
    name: string | null;
    email: string | null;
    role: string | null;
    employeeId: string | null;
}

const initialState: UserState = {
    name: null,
    email: null,
    role: null,
    employeeId: null
};

// Create the user slice
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        // Set user details
        setUser: (state, action: PayloadAction<UserState>) => {
            state.name = action.payload.name;
            state.email = action.payload.email;
            state.role = action.payload.role;
            state.employeeId = action.payload.employeeId || null;
        },
        // Add setUserProfile action for compatibility
        setUserProfile: (state, action: PayloadAction<{ name: string, role: string }>) => {
            state.name = action.payload.name;
            state.role = action.payload.role;
        },
        // Clear user details
        clearUser: (state) => {
            state.name = null;
            state.email = null;
            state.role = null;
            state.employeeId = null;
        },
    },
});

export const { setUser, setUserProfile, clearUser } = userSlice.actions;
export default userSlice.reducer;