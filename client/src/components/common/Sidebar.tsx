import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    FaTachometerAlt,
    FaUsers,
    FaCalendarAlt,
    FaClipboardList,
    FaDollarSign,
    FaCog,
    FaAngleDoubleRight,
    FaAngleDoubleLeft,
    FaLayerGroup
} from "react-icons/fa";

// Define the possible roles as a type
type Role = "admin" | "employee";

interface SidebarProps {
    role: Role;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Define the links based on the user role
    const links = role === "admin" ? [
        { to: "/admin/dashboard", icon: <FaTachometerAlt size={22} />, text: "Dashboard" },
        { to: "/admin/department", icon: <FaLayerGroup size={22} />, text: "Department" },
        { to: "/admin/employee", icon: <FaUsers size={22} />, text: "Employees" },
        { to: "/admin/leaves", icon: <FaCalendarAlt size={22} />, text: "Leaves" },
        { to: "/admin/attendance", icon: <FaClipboardList size={22} />, text: "Attendance" },
        { to: "/admin/payroll", icon: <FaDollarSign size={22} />, text: "Payroll" },
        { to: "/admin/settings", icon: <FaCog size={22} />, text: "Settings" }
    ] : [
        { to: "/employee/dashboard", icon: <FaTachometerAlt size={22} />, text: "Dashboard" },
        { to: "/employee/department", icon: <FaLayerGroup size={22} />, text: "Department" },
        { to: "/employee/leaves", icon: <FaCalendarAlt size={22} />, text: "Leaves" },
        { to: "/employee/attendance", icon: <FaClipboardList size={22} />, text: "Attendance" },
        { to: "/employee/settings", icon: <FaCog size={22} />, text: "Settings" }
    ];

    return (
        <div
            className={`h-screen bg-indigo-900 text-gray-200 flex flex-col ${isCollapsed ? "w-16" : "w-72"} 
                        transition-all duration-600 ease-in-out shadow-lg sm:relative`}
        >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
                <h3
                    className={`text-2xl font-bold text-white transition-all duration-900 ${isCollapsed ? "hidden" : "block"}`}
                >
                    {role === "admin" ? "Admin Dashboard" : "Employee Dashboard"}
                </h3>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-gray-400 hover:text-white focus:outline-none"
                    aria-label="Toggle Sidebar"
                >
                    {isCollapsed ? (
                        <FaAngleDoubleRight size={24} />
                    ) : (
                        <FaAngleDoubleLeft size={24} />
                    )}
                </button>
            </div>

            {/* Sidebar Links */}
            <div className="flex-1 mt-5">
                {links.map(({ to, icon, text }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 hover:bg-blue-700 transition-all ease-in-out rounded-md 
                             ${isActive ? "bg-blue-800 text-white" : "text-gray-100"}`
                        }
                    >
                        {icon}
                        <span className={`${isCollapsed ? "hidden" : "block"} font-medium text-sm`}>
                            {text}
                        </span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
