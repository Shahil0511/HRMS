import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    const handleAuthClick = () => {
        if (isLoggedIn) {
            // Handle logout
            setIsLoggedIn(false);
            navigate("/login");
        } else {
            // Handle login
            navigate("/login");
        }
    };

    return (
        <nav className="bg-white text-white shadow-lg z-10 relative">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <img src="/logo.svg" alt="" className="w-11" />
                <button
                    onClick={handleAuthClick}
                    className="bg-blue-900 px-4 py-2 rounded hover:bg-blue-950 transition duration-200"
                >
                    {isLoggedIn ? "Logout" : "Login"}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;