import Footer from "../components/footer/Footer";
import Navbar from "../components/navbar/Navbar";

export default function Hero() {
    return (
        <div className="flex flex-col min-h-screen overflow-hidden">
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow flex flex-col justify-between">
                <section className="bg-gradient-to-r from-gray-900 to-indigo-900 text-white flex-1">
                    <div className="container mx-auto px-4 py-16 text-center">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-6">
                            Streamline Your HR Management
                        </h1>
                        <p className="text-lg text-gray-200 mb-6">
                            Simplify employee records, payroll, and appraisals in one platform.
                        </p>
                        <p className="text-lg text-gray-200 mb-6">
                            Empower your team with tools for seamless collaboration.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button className="bg-indigo-700 px-6 py-2 rounded hover:bg-indigo-800">
                                Login
                            </button>
                            <button className="bg-indigo-700 px-6 py-2 rounded hover:bg-indigo-800">
                                Signup
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
