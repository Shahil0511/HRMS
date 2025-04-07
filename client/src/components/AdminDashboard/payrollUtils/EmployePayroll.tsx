import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchEmployeeName } from "../../../services/adminEmployePayroll";

const EmployePayroll = () => {
    const { id } = useParams<{ id: string }>();
    const [name, setName] = useState<string | null>(null);

    useEffect(() => {
        const getEmployeeName = async () => {
            if (id) {
                const response = await fetchEmployeeName(id);
                setName(response);
            }
        };

        getEmployeeName();
    }, [id]);

    return (
        <div className="min-h-screen bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex flex-col items-center gap-6">
            <motion.div
                className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-6xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h2 className="text-white text-4xl font-bold">Employee Payroll</h2>

                    <div className="text-white mt-4 md:mt-0 text-right">
                        <p className="text-xl font-medium">{name || "Loading..."}</p>
                        <p className="text-sm opacity-80">Employee ID: {id}</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EmployePayroll;
