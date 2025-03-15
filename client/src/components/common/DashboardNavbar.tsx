import React, { useEffect, useState } from "react";
import { FaBars, FaUser } from "react-icons/fa";
import LogoutButton from "../../utils/LogoutButton";
import { fetchUserName } from "../../services/UserServices";

interface DashboardNavbarProps {
    toggleSidebar: () => void;
    notificationCount?: number;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
    toggleSidebar,

}) => {
    const [userData, setUserData] = useState({
        name: null as string | null,
        role: null as string | null,
        loading: true,
        error: null as string | null
    });

    useEffect(() => {
        const getUserData = async () => {
            try {
                setUserData(prev => ({ ...prev, loading: true, error: null }));
                const user = await fetchUserName();

                if (user?.name && user?.role) {
                    setUserData({
                        name: user.name,
                        role: user.role,
                        loading: false,
                        error: null
                    });
                } else {
                    setUserData(prev => ({
                        ...prev,
                        loading: false,
                        error: "User data is incomplete"
                    }));
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                setUserData(prev => ({
                    ...prev,
                    loading: false,
                    error: "Failed to load user information"
                }));
            }
        };

        getUserData();
    }, []);

    // Create user initials for avatar
    const initials = userData.name
        ?.split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    return (
        <nav className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white h-16 w-full flex items-center justify-between px-3 sm:px-6 shadow-lg relative z-20">
            {/* Sidebar Toggle Button for Mobile */}
            <button
                className="md:hidden text-white focus:outline-none"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
            >
                <FaBars size={24} />
            </button>

            {/* Center Section: User Info - Hidden on smaller screens */}
            <div className="hidden md:flex items-center gap-3">
                {userData.loading ? (
                    <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Loading...</span>
                    </div>
                ) : userData.error ? (
                    <div className="text-sm text-red-300 flex items-center">
                        <span>{userData.error}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white text-sm font-medium">
                            {initials || <FaUser />}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium truncate max-w-xs">
                                {userData.name}
                            </span>
                            <span className="text-xs text-gray-300 truncate">
                                {userData.role
                                    ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1)
                                    : ''}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Center logo or brand name - Visible on mobile */}
            <div className="md:hidden flex-grow flex justify-center">
                <span className="text-xs text-gray-300 truncate">
                    {userData.role
                        ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1)
                        : ''}
                </span>
            </div>

            {/* Right Section: Logout Button */}
            <div className="flex-shrink-0">
                <LogoutButton />
            </div>
        </nav>
    );
};

export default DashboardNavbar;