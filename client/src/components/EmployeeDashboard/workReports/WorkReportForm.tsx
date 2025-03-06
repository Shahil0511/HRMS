import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getEmployeeDetails } from '../../../services/workreportService'; // Import service function

interface FormData {
    employeeName: string;
    employeeId: string;
    department: string;
    designation: string;
    date: string;
    completedTasks: string;
    ongoingTasks: string;

}

function EmployeeForm() {
    const [formData, setFormData] = useState<FormData>({
        employeeName: '',
        employeeId: '',
        department: '',
        designation: '',
        date: new Date().toISOString().split('T')[0],
        completedTasks: '',
        ongoingTasks: '',

    });

    // Fetch user details and employee data
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (user?.employeeName && user?.employeeId) {
            setFormData(prev => ({
                ...prev,
                employeeName: user.employeeName,
                employeeId: user.employeeId,
            }));

            // Fetch department & designation using service function
            fetchEmployeeDetails();
        }
    }, []);

    const fetchEmployeeDetails = async () => {
        try {
            const data = await getEmployeeDetails();
            setFormData(prev => ({
                ...prev,
                department: data?.departmentName || "N/A",
                designation: data?.designation || "N/A",
            }));
        } catch (error) {
            console.error('Error fetching employee details:', error);
            setFormData(prev => ({
                ...prev,
                department: "N/A",
                designation: "N/A",
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await axios.post('/api/reports', formData);
            alert('Form submitted successfully!');
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to submit form');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 px-6 py-2">
            <h2 className="text-2xl font-bold mb-4 text-white">Report Form</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-4 gap-4">
                {/* Employee Info */}
                <div>
                    <label className="block text-white text-sm font-bold mb-2">Employee Name:</label>
                    <input type="text" name="employeeName" value={formData.employeeName} readOnly className="shadow appearance-none border rounded w-full py-3 px-3 bg-slate-900 text-white" />
                </div>
                <div>
                    <label className="block text-white text-sm font-bold mb-2">Department:</label>
                    <input type="text" name="department" value={formData.department} readOnly className="shadow appearance-none border rounded w-full py-3 px-3 bg-slate-900 text-white" />
                </div>
                <div>
                    <label className="block text-white text-sm font-bold mb-2">Designation:</label>
                    <input type="text" name="designation" value={formData.designation} readOnly className="shadow appearance-none border rounded w-full py-3 px-3 bg-slate-900 text-white" />
                </div>
                <div>
                    <label className="block text-white text-sm font-bold mb-2">Date</label>
                    <input type="text" name="date" value={formData.date} readOnly className="shadow appearance-none border rounded w-full py-3 px-3 bg-slate-900 text-white" />
                </div>

                {/* Task Input Boxes */}
                <div className="md:col-span-4">
                    <label className="block text-sm font-bold mb-2 text-white">Completed Tasks:</label>
                    <textarea name="completedTasks" className="shadow appearance-none border rounded w-full py-2 px-3 bg-slate-900 text-white" rows={4} placeholder="Enter completed tasks" value={formData.completedTasks} onChange={handleChange} />
                </div>

                <div className="md:col-span-4">
                    <label className="block text-white text-sm font-bold mb-2">Ongoing Tasks:</label>
                    <textarea name="ongoingTasks" className="shadow appearance-none border rounded w-full py-2 px-3 bg-slate-900 text-white" rows={4} placeholder="Enter ongoing tasks" value={formData.ongoingTasks} onChange={handleChange} />
                </div>

                <div className="md:col-span-3">
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit to Manager</button>
                </div>
            </form>
        </div>
    );
}

export default EmployeeForm;
