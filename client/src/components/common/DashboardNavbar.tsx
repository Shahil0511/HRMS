import React from "react";
import LogoutButton from "../../utils/LogoutButton";

interface User {
    name: string;
    role: "admin" | "employee"; // You can add more roles as needed
    // image?: string; // Optional image for the user
}

interface DashboardNavbarProps {
    user: User;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ user }) => {
    return (
        <nav className="bg-indigo-900 text-white h-16 flex items-center justify-between px-4 sm:px-6 shadow-md">
            {/* User Info */}
            <div className="flex items-center gap-3">
                {/* 
                {user.image && (
                    <img
                        src={user.image}
                        alt={`${user.name}'s Profile`}
                        className="w-10 h-10 rounded-full border-2 border-gray-200"
                    />
                )}
                */}
                <span className="font-medium hidden sm:block">{user.name}</span>
            </div>

            {/* Logout Button */}
            <LogoutButton />
        </nav>
    );
};

export default DashboardNavbar;
