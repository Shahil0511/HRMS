const Footer = () => {
    return (
        <footer className="bg-white text-black py-3 border-t border-indigo-200 shadow-lg">
            <div className="container mx-auto px-4 text-center">
                <p className="text-sm md:text-base">
                    © {new Date().getFullYear()} <span className="font-semibold"></span>. All rights reserved.
                </p>
                <p className="text-xs md:text-sm  text-gray-900">
                    Designed for modern businesses to streamline HR operations.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
