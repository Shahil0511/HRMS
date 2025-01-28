// src/redux/slices/user/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the UserState interface
interface UserState {
    name: string | null;
    email: string | null;
    role: string | null;
}

// Initial state
const initialState: UserState = {
    name: null,
    email: null,
    role: null,
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
        },
        // Clear user details
        clearUser: (state) => {
            state.name = null;
            state.email = null;
            state.role = null;
        },
    },
});

// Export the user actions and reducer
export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
