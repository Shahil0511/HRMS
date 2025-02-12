import { useEffect, useState } from "react";
import LogoutButton from "../../utils/LogoutButton";
import { fetchUserName } from "../../services/UserServices";
import { FaBars } from "react-icons/fa";

interface DashboardNavbarProps {
    toggleSidebar: () => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ toggleSidebar }) => {
    const [userName, setUserName] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getUserData = async () => {
            try {
                setLoading(true);
                const user = await fetchUserName();

                if (user?.name && user?.role) {
                    setUserName(user.name);
                    setRole(user.role);
                } else {
                    setError("User data is incomplete.");
                    console.error("User data is incomplete.");
                }
            } catch (err) {
                setError("Failed to fetch user information.");
                console.error("Error fetching user data:", err);
            } finally {
                setLoading(false);
            }
        };

        getUserData();
    }, []);

    return (
        <nav className="bg-indigo-900 text-white h-16 flex items-center justify-between px-4 sm:px-6 shadow-md">
            {/* Sidebar Toggle Button for Mobile */}
            <button
                className="md:hidden p-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 transition"
                onClick={toggleSidebar}
            >
                <FaBars size={22} className="text-white" />
            </button>

            {/* User Info */}
            <div className="flex items-center gap-3">
                {loading ? (
                    <span>Loading...</span>
                ) : error ? (
                    <span>{error}</span>
                ) : (
                    <>
                        <span className="font-medium hidden sm:block">{`Welcome, ${userName}`}</span>
                        <span className="text-sm text-gray-300">{`Role: ${role}`}</span>
                    </>
                )}
            </div>

            {/* Logout Button */}
            <LogoutButton />
        </nav>
    );
};

export default DashboardNavbar;
