const Footer = () => {
    return (
        <footer className="bg-gradient-to-l from-gray-900 to-indigo-900 text-white py-3">
            <div className="container mx-auto px-4 text-center">
                <p className="text-sm md:text-base">
                    © {new Date().getFullYear()} <span className="font-semibold"></span>. All rights reserved.
                </p>
                <p className="text-xs md:text-sm  text-gray-400">
                    Designed for modern businesses to streamline HR operations.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
