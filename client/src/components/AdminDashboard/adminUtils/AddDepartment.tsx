import React, { useState } from "react";

type InputFieldProps = {
    label: string;
    id: string;
    name: string;
    type: string;
    value: string | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    required?: boolean;
    options?: string[]; // For select fields
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

const AddDepartment: React.FC = () => {
    const [formData, setFormData] = useState({
        departmentName: "",
        description: "",
        headOfDepartment: "",
        status: "Active",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(formData);
    };

    return (
        <div className="max-h-screen">
            <form
                onSubmit={handleSubmit}
                className="bg-gradient-to-l from-indigo-900 to-blue-900 p-10 shadow-lg text-white flex flex-col gap-8"
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
                <InputField
                    label="Status"
                    id="status"
                    name="status"
                    type="select"
                    value={formData.status}
                    onChange={handleChange}
                    options={["Active", "Inactive"]}
                />
                <button
                    type="submit"
                    className="mt-6 w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
                >
                    Add Department
                </button>
            </form>
        </div>
    );
};

export default AddDepartment;
