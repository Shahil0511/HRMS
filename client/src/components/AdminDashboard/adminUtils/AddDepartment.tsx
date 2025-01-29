import React, { useState } from "react";
import { addDepartment } from "../../../services/departmentServices";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // For redirecting after success

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
        <div className="flex-1">
            <label htmlFor={id} className="block text-sm text-white font-bold mb-2">
                {label}
            </label>
            {type === "select" ? (
                <select
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-blue-950"
                    required={required}
                >
                    <option value="">Select {label}</option>
                    {options.map((option, index) => (
                        <option key={index} value={option}>
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
                    className="block w-full text-sm py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
    const navigate = useNavigate(); // Use navigate to redirect on success

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
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
                navigate("/admin/department"); // Redirect to the department list page after success
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
        <div className="max-h-screen">
            <form
                onSubmit={handleSubmit}
                className="bg-gradient-to-r from-gray-900 to-indigo-900 px-6 py-6 md:px-24 md:py-16 shadow-lg text-white flex flex-col gap-8"
            >
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
                <InputField
                    label="Description"
                    id="description"
                    name="description"
                    type="text"
                    value={formData.description}
                    onChange={handleChange}
                />
                {error && <p className="text-red-500">{error}</p>}
                <button
                    type="submit"
                    className="mt-20 w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add Department"}
                </button>
            </form>
        </div>
    );
};

export default AddDepartment;
