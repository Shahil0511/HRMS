import React, { useEffect, useState } from "react";
import LogoutButton from "../../utils/LogoutButton";
import { fetchUserName } from "../../services/UserServices";

const DashboardNavbar: React.FC = () => {
    const [userName, setUserName] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch user data when component mounts
        const getUserData = async () => {
            try {
                setLoading(true);  // Ensuring loading state is true when initiating fetch
                const user = await fetchUserName();

                if (user?.name && user?.role) {
                    setUserName(user.name);
                    setRole(user.role);
                } else {
                    setError("User data is incomplete.");
                    console.error("User data is incomplete."); // Debugging log
                }
            } catch (err) {
                setError("Failed to fetch user information.");
                console.error("Error fetching user data:", err); // Debugging log
            } finally {
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
