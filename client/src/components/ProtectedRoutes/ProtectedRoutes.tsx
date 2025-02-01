// ProtectedRoute.tsx
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
    const { isLoggedIn, role } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        // Sync state with localStorage
        const savedToken = localStorage.getItem("token");
        const savedRole = localStorage.getItem("role");
        if (savedToken && savedRole) {
            dispatch(setAuthState());  // Only dispatch once to sync the state
        }
    }, [dispatch]);

    // If the user is not logged in or role does not match
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (role !== requiredRole) {
        return <Navigate to="/404" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
