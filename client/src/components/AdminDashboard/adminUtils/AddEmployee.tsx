import React, { useEffect, useState } from "react";
import { getAllDepartments } from "../../../services/departmentServices";
import { addEmployee } from "../../../services/employeeServices";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Importing useNavigate for navigation

// Improved InputField component
type InputFieldProps = {
    label: string;
    id: string;
    name: string;
    type: string;
    value: string | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    required?: boolean;
    options?: { name: string; id: string }[];  // For select type, expect an array of objects with name and id
};

const InputField: React.FC<InputFieldProps> = ({
    label,
    id,
    name,
    type,
    value,
    onChange,
    required = false,
    options = [],  // For select type, an array of objects { name, id }
}) => {
    return (
        <div>
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
                    className="block w-full text-sm py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        department: "",  // department will store ObjectId here
        designation: "",
    });

    const [departments, setDepartments] = useState<{ name: string; id: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate(); // Using useNavigate for navigation

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
            setFormData({ ...formData, [name]: selectedDept ? selectedDept.id : "" }); // Store ObjectId
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Reset any previous errors

        try {
            const response = await addEmployee(formData);
            toast.success("Employee added successfully!"); // Success toast notification
            console.log("Employee added successfully:", response);
            setFormData({ // Clear the form data
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
            navigate("/admin/employee"); // Redirect to /admin/employee
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setError(errorMessage);
            toast.error(`Error: ${errorMessage}`);  // Error toast notification
        }
    };

    return (
        <div>
            <form
                onSubmit={handleSubmit}
                className="bg-gradient-to-r from-gray-900 to-indigo-900 px-8 py-5 shadow-lg text-white"
            >
                {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <InputField
                        label="Address"
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />
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
                <button
                    type="submit"
                    className="mt-6 w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
                >
                    Add Employee
                </button>
            </form>
        </div>
    );
};

export default AddEmployee;
