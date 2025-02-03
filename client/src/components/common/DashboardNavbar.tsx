import React, { useEffect, useState } from "react";
import LogoutButton from "../../utils/LogoutButton";
import { fetchUserName } from "../../services/UserServices"; // Import the service to fetch user data

const DashboardNavbar: React.FC = () => {
    const [userName, setUserName] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch user data when component mounts
        const getUserData = async () => {
            try {
                const user = await fetchUserName(); // Fetch user data
                if (user?.name && user?.role) {
                    setUserName(user.name);  // Set the user name
                    setRole(user.role);  // Set the user role
                } else {
                    setError("User data is incomplete.");
                }
                setLoading(false);
            } catch (error) {
                setError("Failed to fetch user information.");
                setLoading(false);
            }
        };

        getUserData();
    }, []); // Empty dependency array to run on component mount

    return (
        <nav className="bg-indigo-900 text-white h-16 flex items-center justify-between px-4 sm:px-6 shadow-md">
            {/* User Info */}
            <div className="flex items-center gap-3">
                {loading ? (
                    <span>Loading...</span> // Display loading state
                ) : error ? (
                    <span>{error}</span> // Display error message
                ) : (
                    <>
                        <span className="font-medium hidden sm:block">{`Welcome, ${userName}`}</span>
                        <span className="text-sm text-gray-300">{`Role: ${role}`}</span> {/* Display role */}
                    </>
                )}
            </div>

            {/* Logout Button */}
            <LogoutButton />
        </nav>
    );
};

export default DashboardNavbar;
