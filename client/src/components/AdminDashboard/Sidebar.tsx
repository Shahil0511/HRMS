// Sidebar.jsx
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

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div
            className={`h-screen bg-indigo-900 text-gray-200 flex flex-col ${isCollapsed ? "w-16" : "w-72"
                } transition-all duration-600 ease-in-out shadow-lg sm:relative`}
        >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
                <h3
                    className={`text-2xl font-bold text-white transition-all duration-900 ${isCollapsed ? "hidden" : "block"}`}
                >
                    Dashboard
                </h3>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-gray-400 hover:text-white focus:outline-none"
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
                <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3 hover:bg-blue-700 transition-all ease-in-out rounded-md ${isActive ? "bg-blue-800 text-white" : "text-gray-100"}`
                    }
                >
                    <FaTachometerAlt size={22} />
                    <span className={`${isCollapsed ? "hidden" : "block"} font-medium text-sm`}>
                        Dashboard
                    </span>
                </NavLink>
                <NavLink
                    to="/admin/department"
                    className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3 hover:bg-blue-700 transition-all ease-in-out rounded-md ${isActive ? "bg-blue-800 text-white" : "text-gray-100"}`
                    }
                >
                    < FaLayerGroup size={22} />
                    <span className={`${isCollapsed ? "hidden" : "block"} font-medium text-sm`}>
                        Department
                    </span>
                </NavLink>
                <NavLink
                    to="/admin/employee"
                    className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3 hover:bg-blue-700 transition-all ease-in-out rounded-md ${isActive ? "bg-blue-800 text-white" : "text-gray-100"}`
                    }
                >
                    <FaUsers size={22} />
                    <span className={`${isCollapsed ? "hidden" : "block"} font-medium text-sm`}>
                        Employees
                    </span>
                </NavLink>
                <NavLink
                    to="/admin/leaves"
                    className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3 hover:bg-blue-700 transition-all ease-in-out rounded-md ${isActive ? "bg-blue-800 text-white" : "text-gray-100"}`
                    }
                >
                    <FaCalendarAlt size={22} />
                    <span className={`${isCollapsed ? "hidden" : "block"} font-medium text-sm`}>
                        Leaves
                    </span>
                </NavLink>
                <NavLink
                    to="/admin/attendance"
                    className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3 hover:bg-blue-700 transition-all ease-in-out rounded-md ${isActive ? "bg-blue-800 text-white" : "text-gray-100"}`
                    }
                >
                    <FaClipboardList size={22} />
                    <span className={`${isCollapsed ? "hidden" : "block"} font-medium text-sm`}>
                        Attendance
                    </span>
                </NavLink>
                <NavLink
                    to="/admin/payroll"
                    className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3 hover:bg-blue-700 transition-all ease-in-out rounded-md ${isActive ? "bg-blue-800 text-white" : "text-gray-100"}`
                    }
                >
                    <FaDollarSign size={22} />
                    <span className={`${isCollapsed ? "hidden" : "block"} font-medium text-sm`}>
                        Payroll
                    </span>
                </NavLink>
                <NavLink
                    to="/admin/settings"
                    className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3 hover:bg-blue-700 transition-all ease-in-out rounded-md ${isActive ? "bg-blue-800 text-white" : "text-gray-100"}`
                    }
                >
                    <FaCog size={22} />
                    <span className={`${isCollapsed ? "hidden" : "block"} font-medium text-sm`}>
                        Settings
                    </span>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;
