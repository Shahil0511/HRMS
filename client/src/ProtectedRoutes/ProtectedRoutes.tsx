import { ReactNode, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../store/store";
import { loginSuccess } from "../store/slices/authSlice";

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const dispatch = useDispatch();
    const { token, role, isLoggedIn } = useSelector((state: RootState) => state.auth);

    // ✅ State to check if authentication is being restored
    const [authRestored, setAuthRestored] = useState(false);

    useEffect(() => {
        if (!token) {
            const savedToken = localStorage.getItem("token");
            const savedRole = localStorage.getItem("role");
            const savedUser = localStorage.getItem("user");

            if (savedToken && savedRole && savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    dispatch(loginSuccess({ token: savedToken, role: savedRole, user: parsedUser }));
                } catch (error) {
                    console.error("Error parsing user data:", error);
                }
            }
        }

        // ✅ Authentication state restored
        setAuthRestored(true);
    }, [dispatch, token]);

    // ✅ If authentication is still restoring, don't render anything (prevents flashing to /auth)
    if (!authRestored) {
        return null;
    }

    // 🔹 If the user is not logged in, send them to login
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // 🔹 If the user has the wrong role, send them to their correct dashboard
    if (role !== requiredRole) {
        return <Navigate to={role === "admin" ? "/admin/dashboard" : "/employee/dashboard"} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
