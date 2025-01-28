import { ReactNode, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { setAuthState } from "../../store/slices/authSlice";

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const dispatch = useDispatch();
    const { token, role } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        // Persist authentication state from localStorage in case of page refresh
        const savedToken = localStorage.getItem("token");
        const savedRole = localStorage.getItem("role");

        if (savedToken && savedRole) {
            dispatch(setAuthState({ token: savedToken, role: savedRole }));
        }
    }, [dispatch]);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role !== requiredRole) {
        return <Navigate to="/employee/dashboard" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;