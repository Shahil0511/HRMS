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
        <nav className="bg-indigo-900 text-white h-16 w-full flex items-center justify-between px-2 sm:px-6 shadow-md">
            {/* Sidebar Toggle Button for Mobile */}
            <button
                className="md:hidden p-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 transition"
                onClick={toggleSidebar}
            >
                <FaBars size={20} className="text-white" />
            </button>

            {/* User Info */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                {loading ? (
                    <span className="text-sm">Loading...</span>
                ) : error ? (
                    <span className="text-sm text-red-300">{error}</span>
                ) : (
                    <>
                        <span className="font-medium hidden sm:block truncate">{`Welcome, ${userName}`}</span>
                        <span className="text-sm text-gray-300 truncate">{`Role: ${role}`}</span>
                    </>
                )}
            </div>

            {/* Logout Button */}
            <div className="flex-shrink-0">
                <LogoutButton />
            </div>
        </nav>
    );
};

export default DashboardNavbar;
