
import { motion } from "framer-motion";



const EmployeeProfile = () => {


    return (
        <motion.div
            className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col md:flex-row w-full max-w-7xl bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 rounded-lg shadow-lg">
                {/* Main Content */}
                <div className="flex-1 p-4">
                    {/* Profile Header */}
                    <motion.div
                        className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 rounded-lg shadow-md p-4 mb-4"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center">
                            <img
                                src={"/"}
                                alt="Profile"
                                className="w-16 h-16 rounded-full mr-4"
                            />
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    FirstName LAstName
                                </h2>
                                <p className="text-white">Designation</p>
                                <p className="text-white">Sunny Jha</p>
                            </div>
                        </div>
                        {/* Add navigation links like "Attendance", "Work Sheet", etc. */}
                        <div className="mt-4">
                            <a href="#" className="text-white hover:underline mr-4">
                                Attendance
                            </a>
                            <a href="#" className="text-white hover:underline mr-4">
                                Work Sheet
                            </a>
                            <a href="#" className="text-white hover:underline mr-4">
                                Leaves
                            </a>
                        </div>
                    </motion.div>

                    {/* Time Off Section */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {["Monthly Leave", "Work Sheet", "Attendance"].map((item, index) => (
                            <motion.div
                                key={index}
                                className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 rounded-lg shadow-md p-4"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 * index }}
                            >
                                <h3 className="text-lg text-white font-semibold">{item}</h3>
                                <p className="text-white">Available</p>
                                <p className="text-2xl font-bold text-white">28.0 days</p>
                                <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mt-3">
                                    Apply For Leave
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Leave Requests Table */}
                    <motion.div
                        className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 rounded-lg shadow-md p-4"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-white">Requests</h3>
                            <select className="border rounded px-2 py-1 text-white">
                                <option>All</option>
                                {/* Add other filter options */}
                            </select>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="text-left">
                                    <th className="py-2 text-white">Leave type</th>
                                    <th className="py-2 text-white">From Date</th>
                                    <th className="py-2 text-white">To Date</th>
                                    <th className="py-2 text-white">Status</th>
                                </tr>
                            </thead>
                            <tbody>

                                <tr className="border-t">
                                    <td className="py-2 text-white">Medical</td>
                                    <td className="py-2 text-white">12/02/25</td>
                                    <td className="py-2 text-white">24/02/25</td>
                                    <td className="py-2 text-white">Rejected</td>
                                </tr>

                            </tbody>
                        </table>
                    </motion.div>
                </div>

                {/* Right Sidebar (Employee Details) */}
                <motion.div
                    className="w-full md:w-80 bg-gradient-to-r from-indigo-900 to-gray-900 p-4 rounded-2xl shadow-2xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="bg-gradient-to-l from-indigo-900 to-gray-900 rounded-lg shadow-md p-4 mb-4">
                        <h3 className="text-lg font-semibold mb-2 text-white">Basic Information</h3>
                        <p className="text-white">Name</p>
                        <p className="text-white">Department</p>
                        <p className="text-white">Department ID</p>
                        <p className="text-white">Designation</p>
                        <p className="text-white">Reporting to</p>
                    </div>
                    <div className="bg-gradient-to-l from-indigo-900 to-gray-900 rounded-lg shadow-md p-4 mb-4">
                        <h3 className="text-lg font-semibold mb-2 text-white">Details Information</h3>
                        <p className="text-white">Hired on:</p>
                        <p className="text-white">Employment type: Part-Time</p>
                        <p className="text-white">Location: London</p>
                    </div>
                    <div className="bg-gradient-to-l from-indigo-900 to-gray-900 rounded-lg shadow-md p-4">
                        <h3 className="text-lg font-semibold mb-2 text-white">Contact Information</h3>
                        <p className="text-white">Phone</p>
                        <p className="text-white">Email</p>
                        <p className="text-white">Address</p>
                        <p className="text-white">Emergency Contact</p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default EmployeeProfile;
