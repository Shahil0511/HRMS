import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import ConfirmationModal from "./ConfirmationModal";
import { logout } from "../store/slices/authSlice";

const LogoutButton: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("No active session found.");
                return;
            }

            // Optional: Call backend API to invalidate token
            // await axios.post(
            //     "https://your-backend-domain.com/api/auth/logout",
            //     {},
            //     {
            //         headers: { Authorization: `Bearer ${token}` },
            //     }
            // );

            // Clear user data
            localStorage.removeItem("token");
            dispatch(logout());

            // Notify user and redirect
            toast.success("Logged out successfully!");
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Failed to log out. Please try again.");
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
                Logout
            </button>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isModalOpen}
                title="Logout Confirmation"
                message="Are you sure you want to log out?"
                onConfirm={() => {
                    setIsModalOpen(false);
                    handleLogout();
                }}
                onCancel={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default LogoutButton;
