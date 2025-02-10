// AdminDashboard.jsx
import DashboardNavbar from "../components/common/DashboardNavbar";
import Sidebar from "../components/common/Sidebar";
import { Outlet } from "react-router-dom";

const AdminDashboard = () => {
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar role="admin" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Navbar */}
                <DashboardNavbar
                  
                />

                {/* Page Content */}
                <div className="flex-1 ">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
