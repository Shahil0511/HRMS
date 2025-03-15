import React, { useEffect, useState, useCallback, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaUser, FaBell } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import LogoutButton from "../../utils/LogoutButton";
import { fetchUserName } from "../../services/UserServices";
import { RootState } from "../../store/store";
import { setUser } from "../../store/slices/userSlice";

interface DashboardNavbarProps {
    notificationCount?: number;
}

const UserAvatar: React.FC<{ name: string }> = memo(({ name }) => {
    const initials = name
        ?.split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    return (
        <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white text-sm font-medium">
            {initials || <FaUser />}
        </div>
    );
});

UserAvatar.displayName = "UserAvatar";

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
    notificationCount = 0
}) => {
    // Use Redux state if available, otherwise use local state
    const dispatch = useDispatch();
    const userState = useSelector((state: RootState) => state.user);

    const [userData, setUserData] = useState({
        name: userState?.name || null,
        role: userState?.role || null,
        loading: !userState?.name,
        error: null as string | null
    });

    // Fetch user data if not in Redux already
    const fetchUserData = useCallback(async () => {
        if (userData.name && userData.role) return; // Don't fetch if we already have data

        try {
            setUserData(prev => ({ ...prev, loading: true, error: null }));
            const user = await fetchUserName();

            if (user?.name && user?.role) {
                // Update local state
                setUserData({
                    name: user.name,
                    role: user.role,
                    loading: false,
                    error: null
                });

                // Update Redux state (if available)
                dispatch(setUser({
                    name: user.name,
                    role: user.role,
                    email: null,
                    employeeId: null
                }));
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
    }, [dispatch, userData.name, userData.role]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // Update local state when Redux state changes
    useEffect(() => {
        if (userState?.name && userState?.role) {
            setUserData({
                name: userState.name,
                role: userState.role,
                loading: false,
                error: null
            });
        }
    }, [userState?.name, userState?.role]);

    return (
        <motion.nav
            className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white h-16 w-full flex items-center justify-between px-3 sm:px-6 shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Center Section: User Info */}
            <div className="flex items-center gap-3">
                <AnimatePresence mode="wait">
                    {userData.loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center space-x-2"
                        >
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm">Loading...</span>
                        </motion.div>
                    ) : userData.error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm text-red-300 flex items-center"
                        >
                            <span>{userData.error}</span>
                            <button
                                onClick={fetchUserData}
                                className="ml-2 text-xs bg-indigo-700 px-2 py-1 rounded hover:bg-indigo-600"
                            >
                                Retry
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="user-info"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3"
                        >
                            <UserAvatar name={userData.name || ""} />
                            <div className="flex flex-col">
                                <span className="font-medium hidden sm:block truncate max-w-xs">
                                    {userData.name}
                                </span>
                                <span className="text-xs text-gray-300 truncate">
                                    {userData.role
                                        ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1)
                                        : ''}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <motion.div
                    className="relative cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <FaBell size={18} className="text-gray-300 hover:text-white transition-colors" />
                    {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {notificationCount > 9 ? '9+' : notificationCount}
                        </span>
                    )}
                </motion.div>

                {/* Logout Button */}
                <div className="flex-shrink-0">
                    <LogoutButton />
                </div>
            </div>
        </motion.nav>
    );
};

export default memo(DashboardNavbar);