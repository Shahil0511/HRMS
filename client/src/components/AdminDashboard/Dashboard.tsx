import { useEffect, useState } from "react";
import { FaUsers, FaBuilding, FaUserCheck, FaUserTimes, FaClipboardList, FaCalendarDay, FaExclamationCircle, FaEllipsisH } from "react-icons/fa";
import { getTotalDepartment } from "../../services/departmentServices";
import { getTodayTotalEmployeePresent, getTotalEmployee } from "../../services/employeeServices";
import { motion } from "framer-motion";
import { fetchWorkReportAdmin } from "../../services/workreportService";

const Dashboard = () => {
    const [data, setData] = useState({
        totalDepartments: 0,
        totalEmployees: 0,
        totalPresentToday: 0,
        totalAbsentToday: 0,
        leavesApplied: 0,
        todaysWorksheet: 0,
        complaints: 0,
        others: 0
    });

    const [, setLoading] = useState(true);

    useEffect(() => {
        getTotalDepartment()
            .then((data) => {
                setData((prevData) => ({
                    ...prevData,
                    totalDepartments: data.totalDepartment || 0,
                }));
            })
            .catch(err => {
                console.error("Error fetching data:", err);
                setLoading(false);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        getTotalEmployee()
            .then((data) => {
                setData((prevData) => ({
                    ...prevData,
                    totalEmployees: data.totalEmployees || 0,
                }));
            })
            .catch(err => {
                console.error("Error fetching data:", err);
                setLoading(false);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (data.totalEmployees > 0) {
            getTodayTotalEmployeePresent()
                .then((data) => {
                    setData((prevData) => ({
                        ...prevData,
                        totalPresentToday: data.totalPresentToday || 0,
                        totalAbsentToday: prevData.totalEmployees - data.totalPresentToday || 0,
                    }));
                })
                .catch((err) => {
                    console.error("Error fetching data:", err);
                    setLoading(false);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [data.totalEmployees]);

    useEffect(() => {
        setLoading(true);

        fetchWorkReportAdmin()
            .then((reports) => {
                const today = new Date().toISOString().split("T")[0];
                const todaysReports = reports.filter((report) => {
                    return report.date === today;
                });

                console.log("Filtered Today's Reports:", todaysReports.length);

                setData((prevData) => ({
                    ...prevData,
                    todaysWorksheet: todaysReports.length,
                }));
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const stats = [
        { label: "Total Departments", value: data.totalDepartments, icon: <FaBuilding /> },
        { label: "Total Employees", value: data.totalEmployees, icon: <FaUsers /> },
        { label: "Employees Present", value: data.totalPresentToday, icon: <FaUserCheck /> },
        { label: "Employees Absent", value: data.totalAbsentToday, icon: <FaUserTimes /> },
        { label: "Leaves Applied", value: data.leavesApplied, icon: <FaClipboardList /> },
        { label: "Today's Work Sheet", value: data.todaysWorksheet, icon: <FaCalendarDay /> },
        { label: "Complaints", value: data.complaints, icon: <FaExclamationCircle /> },
        { label: "Others", value: data.others, icon: <FaEllipsisH /> }
    ];

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex justify-center items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-full px-4 md:px-8">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        className="bg-gradient-to-l from-indigo-900 to-gray-900  p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-white text-center transform transition-transform duration-300 hover:scale-105"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                        <div className="text-5xl text-white mb-3">{stat.icon}</div>
                        <div className="text-3xl font-bold">{stat.value}</div>
                        <div className="text-lg font-medium">{stat.label}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
