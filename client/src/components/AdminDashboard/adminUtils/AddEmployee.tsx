import React, { useEffect, useState } from "react";
import { getAllDepartments } from "../../../services/departmentServices";

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
        <div>
            <label
                htmlFor={id}
                className="block text-sm text-white font-bold mb-2"
            >
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
        image: null as File | null,
    });

    // Departments state
    const [departments, setDepartments] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchDepartments = async () => {
            setLoading(true);
            try {
                const response = await getAllDepartments();


                if (response && response.departments && Array.isArray(response.departments)) {
                    setDepartments(response.departments.map((dept: { departmentName: any; }) => dept.departmentName)); // Extract department names
                } else {
                    setError("Departments data is not an array.");
                }
            } catch (err) {
                setError("Failed to load departments");
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []); // Empty array ensures the effect runs only once

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, image: e.target.files[0] });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(formData);
    };

    return (
        <div>
            <form
                onSubmit={handleSubmit}
                className="bg-gradient-to-r from-gray-900 to-indigo-900 px-8 py-5 shadow-lg text-white"
            >
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
                        options={["Male", "Female", "Other"]}
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
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Address"
                            id="address"
                            name="address"
                            type="text"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                        <div>
                            <label
                                htmlFor="image"
                                className="block text-sm font-medium mb-2"
                            >
                                Upload Image
                            </label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <InputField
                        label="Department"
                        id="department"
                        name="department"
                        type="select"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        options={loading ? ["Loading..."] : departments}
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
