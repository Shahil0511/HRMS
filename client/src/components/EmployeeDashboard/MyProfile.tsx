import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getEmployeeProfile } from "../../services/employeeServices";

interface Profile {
    firstName: string;
    lastName: string;
    gender: string;
    dob: string;
    phoneNumber: string;
    email: string;
    address: string;
    department: {
        departmentName: string;
        headOfDepartment: string;
    };
    designation: string;
    createdAt: string;
    updatedAt: string;
}

const MyProfile: React.FC = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileData = await getEmployeeProfile();
                setProfile(profileData.data);
            } catch (err) {
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
    };

    if (loading) return <div className="text-center text-white">Loading...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;
    if (!profile) return <div className="text-center text-gray-300">Profile not found.</div>;

    return (
        <motion.div
            className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col md:flex-row w-full max-w-7xl bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 rounded-lg shadow-lg">
                {/* Left Content */}
                <div className="flex-1 p-4">
                    <motion.div
                        className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 rounded-lg shadow-md p-4 mb-4"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center">
                            <img
                                src={"/"}  // You can add a dynamic image source here
                                alt="Profile"
                                className="w-16 h-16 rounded-full mr-4"
                            />
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    {profile.firstName} {profile.lastName}
                                </h2>
                                <p className="text-white">{profile.designation}</p>
                                <p className="text-white">{profile.department.departmentName}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Profile Details Section */}
                    {/* <motion.div
                        className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 rounded-lg shadow-md p-4"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                        <p className="text-white"><strong>Email:</strong> {profile.email}</p>
                        <p className="text-white"><strong>Phone:</strong> {profile.phoneNumber}</p>
                        <p className="text-white"><strong>Address:</strong> {profile.address}</p>
                        <p className="text-white"><strong>Department:</strong> {profile.department.departmentName}</p>
                        <p className="text-white"><strong>Manager:</strong> {profile.department.headOfDepartment}</p>
                        <p className="text-white"><strong>Designation:</strong> {profile.designation}</p>
                        <p className="text-white"><strong>Gender:</strong> {profile.gender}</p>
                        <p className="text-white"><strong>Hired On:</strong> {formatDate(profile.createdAt)}</p>
                    </motion.div> */}

                    {/* Time Off Section */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 rounded-lg shadow-md p-4"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h3 className="text-lg text-white font-semibold">Monthly Leave</h3>
                            <p className="text-white">Available</p>
                            <p className="text-2xl font-bold text-white">0 days</p>
                            <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mt-3">
                                Apply For Leave
                            </button>
                        </motion.div>

                        <motion.div
                            className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 rounded-lg shadow-md p-4 "
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h3 className="text-lg text-white font-semibold">Work Report</h3>
                            <p className="text-white">Not Submitted</p>
                            <p className="text-2xl font-bold text-white">0 Submit</p>
                            <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mt-3">
                                Work Report
                            </button>
                        </motion.div>

                        <motion.div
                            className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 rounded-lg shadow-md p-4 "
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h3 className="text-lg text-white font-semibold">Attendance</h3>
                            <p className="text-white">Total Working days</p>
                            <p className="text-2xl font-bold text-white">0 days</p>
                            <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mt-3">
                                View Attendance
                            </button>
                        </motion.div>
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
                        <p className="text-white"><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
                        <p className="text-white"><strong>Department:</strong> {profile.department.departmentName}</p>
                        <p className="text-white"><strong>Manager:</strong> {profile.department.headOfDepartment}</p>

                        <p className="text-white"><strong>Designation:</strong> {profile.designation}</p>
                        <p className="text-white"><strong>Gender:</strong> {profile.gender}</p>
                    </div>
                    <div className="bg-gradient-to-l from-indigo-900 to-gray-900 rounded-lg shadow-md p-4 mb-4">
                        <h3 className="text-lg font-semibold mb-2 text-white">Details Information</h3>
                        <p className="text-white"><strong>Hired On:</strong> {formatDate(profile.createdAt)}</p>
                        <p className="text-white">Employment type: Full Time</p>
                        <p className="text-white">Location: Noida</p>
                    </div>
                    <div className="bg-gradient-to-l from-indigo-900 to-gray-900 rounded-lg shadow-md p-4">
                        <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
                            Update Profile
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default MyProfile;
