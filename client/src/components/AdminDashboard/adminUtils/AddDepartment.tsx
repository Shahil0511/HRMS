import React, { useState } from "react";
import { addDepartment } from "../../../services/departmentServices";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// InputField Component for reusability
type InputFieldProps = {
    label: string;
    id: string;
    name: string;
    type: string;
    value: string | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    required?: boolean;
    options?: string[];
};

const InputField: React.FC<InputFieldProps> = ({
    label,
    id,
    name,
    type,
    value,
    onChange,
    required = false,
    options = [],
}) => {
    return (
        <div className="w-full mb-6">
            <label htmlFor={id} className="block text-sm font-medium text-white mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {type === "select" ? (
                <select
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required={required}
                >
                    <option value="">Select {label}</option>
                    {options.map((option, index) => (
                        <option key={index} value={option} className="bg-gray-800">
                            {option}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required={required}
                />
            )}
        </div>
    );
};

const AddDepartment: React.FC = () => {
    const [formData, setFormData] = useState({
        departmentName: "",
        description: "",
        headOfDepartment: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Authentication token is missing. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            const response = await addDepartment(formData, token);

            if (response.success) {
                toast.success("Department added successfully!");
                setFormData({
                    departmentName: "",
                    description: "",
                    headOfDepartment: "",
                });
                navigate("/admin/department");
            } else {
                setError(response.message);
                toast.error(response.message);
            }
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                    <div className="p-6 md:p-10">
                        <div className="mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Add New Department</h2>
                            <p className="text-gray-300">Fill in the details below to create a new department</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="Department Name"
                                    id="departmentName"
                                    name="departmentName"
                                    type="text"
                                    value={formData.departmentName}
                                    onChange={handleChange}
                                    required
                                />
                                <InputField
                                    label="Head of Department"
                                    id="headOfDepartment"
                                    name="headOfDepartment"
                                    type="text"
                                    value={formData.headOfDepartment}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <InputField
                                label="Description"
                                id="description"
                                name="description"
                                type="text"
                                value={formData.description}
                                onChange={handleChange}
                            />

                            {error && (
                                <div className="p-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg text-red-200">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 ${loading
                                        ? "bg-blue-700 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                                        }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        "Add Department"
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/admin/department")}
                                    disabled={loading}
                                    className="px-6 py-3 rounded-lg font-medium text-white bg-gray-600 hover:bg-gray-700 transition-all duration-300 hover:shadow-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDepartment;