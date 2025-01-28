// AdminDashboard.jsx
import DashboardNavbar from "../components/AdminDashboard/DashboardNavbar";
import Sidebar from "../components/AdminDashboard/Sidebar";
import { Outlet } from "react-router-dom";

const AdminDashboard = () => {
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Navbar */}
                <DashboardNavbar />

                {/* Page Content */}
                <div className="flex-1 ">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
