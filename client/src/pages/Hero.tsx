import Footer from "../components/footer/Footer";
import Navbar from "../components/navbar/Navbar";

export default function Hero() {
    return (
        <div className="flex flex-col min-h-screen overflow-hidden">
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow flex flex-col justify-between ">
                <section className="bg-[url('/background.svg')] bg-cover bg-center  text-blue-800 flex-1">
                    <div className="container mx-auto px-4 py-12 text-center">
                        <div className="py-16">
                            <h1 className="text-3xl sm:text-4xl font-bold mb-6">
                                Streamline Your HR Management
                            </h1>
                            <p className="text-lg text-gray-900 mb-6">
                                Simplify employee records, payroll, and appraisals in one platform.
                            </p>
                            <p className="text-lg text-gray-900 mb-6">
                                Empower your team with tools for seamless collaboration.
                            </p>
                            <div className="flex justify-center gap-6 mb-8">
                                <div className="w-15 h-15 flex items-center justify-center bg-blue-100 rounded-full animate-spin-slow" style={{ animation: "spin 6s linear infinite" }}>
                                    🏢 {/* Example Icon - Company */}
                                </div>
                                <div className="w-15 h-15 flex items-center justify-center bg-green-100 rounded-full animate-spin-slow [animation-delay:200ms]" style={{ animation: "spin 6s linear infinite" }}>
                                    💼 {/* Example Icon - Briefcase */}
                                </div>
                                <div className="w-15 h-15 flex items-center justify-center bg-yellow-100 rounded-full animate-spin-slow [animation-delay:400ms]" style={{ animation: "spin 6s linear infinite" }}>
                                    📑 {/* Example Icon - Document */}
                                </div>
                                <div className="w-15 h-15 flex items-center justify-center bg-red-100 rounded-full animate-spin-slow [animation-delay:600ms]" style={{ animation: "spin 6s linear infinite" }}>
                                    ⏳ {/* Example Icon - Time */}
                                </div>
                                <div className="w-15 h-15 flex items-center justify-center bg-purple-100 rounded-full animate-spin-slow [animation-delay:800ms]" style={{ animation: "spin 6s linear infinite" }}>
                                    🔒 {/* Example Icon - Security */}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            {/* Footer */}
            <Footer />
        </div>
    );
}
