

const EmployeeDashboard = () => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-blue-600 text-white p-4">
                <h1 className="text-lg font-bold">Employee Dashboard</h1>
            </header>

            {/* Main Content */}
            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="w-64 bg-gray-100 p-4 hidden md:block">
                    <nav>
                        <ul className="space-y-4">
                            <li>
                                <a href="#" className="text-gray-700 hover:text-blue-600">
                                    Dashboard
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-700 hover:text-blue-600">
                                    Attendance
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-700 hover:text-blue-600">
                                    Leave Requests
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-700 hover:text-blue-600">
                                    Profile
                                </a>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Main Section */}
                <main className="flex-1 p-6 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="p-4 bg-white rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-2">Total Employees</h2>
                            <p className="text-gray-600">50</p>
                        </div>

                        {/* Card 2 */}
                        <div className="p-4 bg-white rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-2">Pending Leaves</h2>
                            <p className="text-gray-600">12</p>
                        </div>

                        {/* Card 3 */}
                        <div className="p-4 bg-white rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-2">Projects</h2>
                            <p className="text-gray-600">8</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
