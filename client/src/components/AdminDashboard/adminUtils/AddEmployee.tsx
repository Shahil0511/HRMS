import React, { useEffect, useState } from "react";
import { getAllDepartments } from "../../../services/departmentServices";
import { addEmployee } from "../../../services/employeeServices";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Improved InputField component
type InputFieldProps = {
    label: string;
    id: string;
    name: string;
    type: string;
    value: string | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    required?: boolean;
    options?: { name: string; id: string }[];
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
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-white mb-1">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {type === "select" ? (
                <select
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full px-3 py-2 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required={required}
                >
                    <option value="">Select {label}</option>
                    {options.length === 0 ? (
                        <option disabled>Loading...</option>
                    ) : (
                        options.map((option, index) => (
                            <option key={index} value={option.id}>
                                {option.name}
                            </option>
                        ))
                    )}
                </select>
            ) : (
                <input
                    type={type}
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full px-3 py-2 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required={required}
                />
            )}
        </div>
    );
};

const AddEmployee: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        gender: "",
        dob: "",
        phoneNumber: "",
        email: "",
        address: "",
        department: "",
        designation: "",
    });

    const [departments, setDepartments] = useState<{ name: string; id: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const navigate = useNavigate();

    // Fetch departments
    useEffect(() => {
        const fetchDepartments = async () => {
            setLoading(true);
            try {
                const response = await getAllDepartments();
                if (response?.departments && Array.isArray(response.departments)) {
                    const deptData = response.departments.map((dept: { departmentName: string; _id: string }) => ({
                        name: dept.departmentName,
                        id: dept._id,
                    }));
                    setDepartments(deptData);
                } else {
                    setError("Departments data is not in the expected format.");
                }
            } catch (err) {
                setError("Failed to load departments");
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "department") {
            const selectedDept = departments.find((dept) => dept.id === value);
            setFormData({ ...formData, [name]: selectedDept ? selectedDept.id : "" });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await addEmployee(formData);
            toast.success("Employee added successfully!");
            console.log("Employee added successfully:", response);
            setFormData({
                firstName: "",
                lastName: "",
                gender: "",
                dob: "",
                phoneNumber: "",
                email: "",
                address: "",
                department: "",
                designation: "",
            });
            navigate("/admin/employee");
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setError(errorMessage);
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex flex-col items-center gap-6">
            <div className="w-full max-w-4xl">
                <div className="bg-gradient-to-r from-gray-900 to-indigo-900 rounded-lg shadow-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-700">
                        <h2 className="text-xl font-bold text-white">Add New Employee</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-4">
                        {error && (
                            <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-300 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                            <InputField
                                label="First Name"
                                id="firstName"
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="Last Name"
                                id="lastName"
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="Gender"
                                id="gender"
                                name="gender"
                                type="select"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                                options={[{ name: "Male", id: "Male" }, { name: "Female", id: "Female" }, { name: "Other", id: "Other" }]}
                            />
                            <InputField
                                label="Date of Birth"
                                id="dob"
                                name="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="Phone Number"
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="Email"
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <div className="md:col-span-2">
                                <InputField
                                    label="Address"
                                    id="address"
                                    name="address"
                                    type="text"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <InputField
                                label="Department"
                                id="department"
                                name="department"
                                type="select"
                                value={formData.department}
                                onChange={handleChange}
                                required
                                options={loading ? [] : departments}
                            />
                            <InputField
                                label="Designation"
                                id="designation"
                                name="designation"
                                type="text"
                                value={formData.designation}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => navigate("/admin/employee")}
                                className="px-4 py-2 mr-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                                    }`}
                            >
                                {isSubmitting ? "Adding..." : "Add Employee"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddEmployee;