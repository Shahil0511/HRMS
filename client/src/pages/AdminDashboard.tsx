// AdminDashboard.jsx
import DashboardNavbar from "../components/AdminDashboard/DashboardNavbar";
import Sidebar from "../components/AdminDashboard/Sidebar";

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
                <div className="flex-1 bg-gray-100 p-4 sm:p-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Welcome to Admin Dashboard</h1>
                    {/* Add additional page content here */}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
