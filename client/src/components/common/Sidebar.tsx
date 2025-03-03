import { NavLink } from "react-router-dom";
import {
    FaTachometerAlt,
    FaUsers,
    FaCalendarAlt,
    FaClipboardList,
    FaDollarSign,
    FaCog,
    FaLayerGroup,
    FaTimes,
    FaFileAlt,
    FaMoneyBillAlt,
    FaFileInvoice
} from "react-icons/fa";

type Role = "admin" | "employee" | "manager";

interface SidebarProps {
    role: Role;
    isOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, toggleSidebar }) => {
    const links = role === "admin"
        ? [
            { to: "/admin/dashboard", icon: <FaTachometerAlt size={22} />, text: "Dashboard" },
            { to: "/admin/department", icon: <FaLayerGroup size={22} />, text: "Department" },
            { to: "/admin/employee", icon: <FaUsers size={22} />, text: "Employees" },
            { to: "/admin/leaves", icon: <FaCalendarAlt size={22} />, text: "Leaves" },
            { to: "/admin/attendance", icon: <FaClipboardList size={22} />, text: "Attendance" },
            { to: "/admin/workreports", icon: <FaFileAlt size={22} />, text: "Work Report" },
            { to: "/admin/payroll", icon: <FaDollarSign size={22} />, text: "Payroll" },
            { to: "/admin/settings", icon: <FaCog size={22} />, text: "Settings" },
        ]
        : role === "manager"
            ? [
                { to: "/manager/dashboard", icon: <FaTachometerAlt size={22} />, text: "Dashboard" },
                { to: "/manager/department", icon: <FaLayerGroup size={22} />, text: "Department" },
                { to: "/manager/employee", icon: <FaUsers size={22} />, text: "Employees" },
                { to: "/manager/leaves", icon: <FaCalendarAlt size={22} />, text: "Leaves" },
                { to: "/manager/attendance", icon: <FaClipboardList size={22} />, text: "Attendance" },
                { to: "/manager/workreports", icon: <FaFileAlt size={22} />, text: "Work Report" },
                { to: "/manager/payroll", icon: <FaDollarSign size={22} />, text: "Payroll" },
                { to: "/manager/settings", icon: <FaCog size={22} />, text: "Settings" },
            ]
            : [
                { to: "/employee/dashboard", icon: <FaTachometerAlt size={22} />, text: "Dashboard" },
                { to: "/employee/department", icon: <FaLayerGroup size={22} />, text: "Department" },
                { to: "/employee/attendance", icon: <FaClipboardList size={22} />, text: "Attendance" },
                { to: "/employee/leaves", icon: <FaCalendarAlt size={22} />, text: "Leaves" },
                { to: "/employee/workreports", icon: <FaFileInvoice size={22} />, text: "Work Report" },
                { to: "/employee/payroll", icon: <FaMoneyBillAlt size={22} />, text: "PayRoll" },
                { to: "/employee/settings", icon: <FaCog size={22} />, text: "Settings" },
            ];

    // Function to handle link click and collapse sidebar on mobile
    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    };

    return (
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-gray-200 flex flex-col transform transition-transform duration-300 shadow-lg
                         ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:relative`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
                <h3 className="text-2xl font-bold text-white">
                    {role === "admin" ? "Admin Dashboard" : role === "manager" ? "Manager Dashboard" : "Employee Dashboard"}
                </h3>

                {/* Close Button for Mobile */}
                <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
                    <FaTimes size={22} />
                </button>
            </div>

            {/* Sidebar Links */}
            <div className="flex-1 mt-5">
                {links.map(({ to, icon, text }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={handleLinkClick} // Close sidebar on mobile
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 hover:bg-blue-700 transition-all ease-in-out rounded-md 
                             ${isActive ? "bg-blue-800 text-white" : "text-gray-100"}`
                        }
                    >
                        {icon}
                        <span className="font-medium text-sm">{text}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
