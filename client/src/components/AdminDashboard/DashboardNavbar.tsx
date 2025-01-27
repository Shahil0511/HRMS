import React from "react";

import LogoutButton from "../../utils/LogoutButton";

const DashboardNavbar: React.FC = () => {


    // Simulated user data
    const admin = {
        name: "Admin User",
        // image: "https://via.placeholder.com/40", 
    };

    return (
        <nav className="bg-indigo-900 text-white h-16 flex items-center justify-between px-4 sm:px-6 shadow-md">
            {/* Admin Info */}
            <div className="flex items-center gap-3">
                {/* <img
                    src={admin.image}
                    alt="Admin Profile"
                    className="w-10 h-10 rounded-full border-2 border-gray-200"
                /> */}
                <span className="font-medium hidden sm:block">{admin.name}</span>
            </div>

            {/* Logout Button */}
            <LogoutButton />
        </nav>
    );
};

export default DashboardNavbar;
