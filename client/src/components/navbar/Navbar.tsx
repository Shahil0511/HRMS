import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    const handleAuthClick = () => {
        if (isLoggedIn) {
            // Handle logout
            setIsLoggedIn(false);
            navigate("/login"); // Redirect to login page on logout
        } else {
            // Handle login
            navigate("/login");
        }
    };

    return (
        <nav className="bg-gradient-to-l from-gray-900 to-indigo-900 text-white shadow-lg">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <img src="/HRMS-01.png" alt="" className="w-12 " />
                <button
                    onClick={handleAuthClick}
                    className="bg-indigo-900 px-4 py-2 rounded hover:bg-indigo-700 transition duration-200"
                >
                    {isLoggedIn ? "Logout" : "Login"}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;