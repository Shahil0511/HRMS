import { useState } from "react";
import Sidebar from "../components/common/Sidebar";
import DashboardNavbar from "../components/common/DashboardNavbar";
import { Outlet } from "react-router-dom";

const ManagerDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen">

            <Sidebar role="manager" isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex-1 flex flex-col">
                <DashboardNavbar />
                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
            </div>
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default ManagerDashboard;
