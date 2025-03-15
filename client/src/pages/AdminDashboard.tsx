import { useState } from "react";
import DashboardNavbar from "../components/common/DashboardNavbar";
import Sidebar from "../components/common/Sidebar";
import { Outlet } from "react-router-dom";

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen">
            {/* Sidebar (Hidden on small screens, shown when toggled) */}
            <Sidebar role="admin" isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Navbar with Sidebar Toggle */}
                <DashboardNavbar />

                {/* Page Content */}
                <div className="flex-1  overflow-auto">
                    <Outlet />
                </div>
            </div>

            {/* Overlay for Mobile Sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default AdminDashboard;
