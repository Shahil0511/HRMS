import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    getEmployeeDetails,
    submitLeaveForm,
    updateLeave,
    fetchLeavesById,
    fetchLeaveHistoryByEmployeeId
} from '../../../services/leaveServices';

interface FormData {
    employeeName: string;
    employeeId: string;
    department: string;
    designation: string;
    date: string;
    typeOfLeave: string;
    startDate: string;
    endDate: string;
    totalLeaveDuration: string;
    reason: string;
}

function LeaveForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine mode based on route path
    const isViewMode = location.pathname.includes('/view/');
    const isEditMode = location.pathname.includes('/edit/');
    const isAddMode = !isViewMode && !isEditMode;

    const [formData, setFormData] = useState<FormData>({
        employeeName: '',
        employeeId: '',
        department: '',
        designation: '',
        date: new Date().toISOString().split('T')[0],
        typeOfLeave: 'sick',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        totalLeaveDuration: '1',
        reason: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Calculate leave days between two dates
    const calculateLeaveDays = useCallback((start: string, end: string): number => {
        if (!start || !end) return 0;

        const startDate = new Date(start);
        const endDate = new Date(end);

        // Handle case where end date is before start date
        if (endDate < startDate) return 0;

        const timeDifference = endDate.getTime() - startDate.getTime();
        const daysDifference = timeDifference / (1000 * 3600 * 24) + 1; // Include both start and end days
        return daysDifference;
    }, []);

    // Update totalLeaveDuration whenever startDate or endDate changes
    useEffect(() => {
        const days = calculateLeaveDays(formData.startDate, formData.endDate);
        setFormData(prev => ({
            ...prev,
            totalLeaveDuration: days.toString(),
        }));
    }, [formData.startDate, formData.endDate, calculateLeaveDays]);

    // Fetch leave by ID for edit and view modes
    const fetchLeaveDetails = async (leaveId: string) => {
        try {
            // First try to get it from the employee's leave history
            const allLeaves = await fetchLeaveHistoryByEmployeeId();
            const leave = allLeaves.find(leave => leave._id === leaveId);

            if (leave) {
                setFormData({
                    employeeName: leave.employeeName,
                    employeeId: leave.employeeId,
                    department: leave.department,
                    designation: leave.designation,
                    date: new Date(leave.createdAt).toISOString().split('T')[0],
                    typeOfLeave: leave.leaveType,
                    startDate: new Date(leave.startDate).toISOString().split('T')[0],
                    endDate: new Date(leave.endDate).toISOString().split('T')[0],
                    totalLeaveDuration: leave.totalLeaveDuration.toString(),
                    reason: leave.reason,
                });
                return;
            }

            // If not found in history, try direct fetch
            const leaveDetails = await fetchLeavesById(leaveId);
            if (leaveDetails) {
                // Format dates for form inputs
                const formattedDate = new Date(leaveDetails.date).toISOString().split('T')[0];

                setFormData({
                    employeeName: leaveDetails.employeeName,
                    employeeId: leaveDetails.employeeId,
                    department: leaveDetails.department,
                    designation: leaveDetails.designation,
                    date: formattedDate,
                    typeOfLeave: leaveDetails.leaveType,
                    startDate: formattedDate, // Adjust if your API returns startDate
                    endDate: formattedDate,   // Adjust if your API returns endDate
                    totalLeaveDuration: '1',  // Adjust if your API returns duration
                    reason: leaveDetails.reason,
                });
            } else {
                toast.error("Leave details not found");
                navigate('/employee/leaves/');
            }
        } catch (error) {
            console.error('Error fetching leave details:', error);
            toast.error("Failed to load leave details");
            navigate('/employee/leaves/');
        }
    };

    // Fetch employee details and Leave data if needed
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // For all modes, get basic employee info from localStorage
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user?.employeeName && user?.employeeId) {
                    setFormData(prev => ({
                        ...prev,
                        employeeName: user.employeeName,
                        employeeId: user.employeeId,
                    }));
                }

                if (isAddMode) {
                    // For add mode, fetch department and designation
                    await fetchEmployeeDetails();
                }

                // For view and edit modes, fetch the Leave details
                if ((isViewMode || isEditMode) && id) {
                    await fetchLeaveDetails(id);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error("Failed to load data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, isViewMode, isEditMode, isAddMode, navigate]);

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
        setIsSubmitting(true);

        try {
            const submissionData = {
                employeeName: formData.employeeName,
                employeeId: formData.employeeId,
                department: formData.department,
                designation: formData.designation,
                date: formData.date,
                leaveType: formData.typeOfLeave,
                startDate: formData.startDate,
                endDate: formData.endDate,
                totalLeaveDuration: parseInt(formData.totalLeaveDuration),
                reason: formData.reason,
            };

            if (isEditMode && id) {
                await updateLeave(id, submissionData);
                toast.success("Leave updated successfully!");
            } else {
                await submitLeaveForm(submissionData);
                toast.success("Leave submitted successfully!");
            }
            navigate('/employee/leaves/');
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error("Failed to submit form");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Display loading state
    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex items-center justify-center">
                <div className="text-white text-center">
                    <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-xl font-semibold">Loading Leave Details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6">
            <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-gray-900 rounded-lg shadow-xl p-6 max-w-6xl mx-auto">
                <div className="flex items-center mb-6">
                    <div className="bg-blue-600 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        {isViewMode ? "View Leave Request" : isEditMode ? "Edit Leave Request" : "Create Leave Request"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Employee Information Card */}
                    <div className="bg-indigo-950/50 rounded-lg p-4 shadow-inner">
                        <h3 className="text-lg font-semibold text-blue-300 mb-4 border-b border-blue-800 pb-2">Employee Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-white text-sm font-semibold mb-2">Employee Name</label>
                                <input
                                    type="text"
                                    name="employeeName"
                                    value={formData.employeeName}
                                    readOnly
                                    className="shadow appearance-none border border-blue-800 rounded-md w-full py-3 px-3 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-white text-sm font-semibold mb-2">Employee ID</label>
                                <input
                                    type="text"
                                    name="employeeId"
                                    value={formData.employeeId}
                                    readOnly
                                    className="shadow appearance-none border border-blue-800 rounded-md w-full py-3 px-3 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-white text-sm font-semibold mb-2">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    readOnly
                                    className="shadow appearance-none border border-blue-800 rounded-md w-full py-3 px-3 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-white text-sm font-semibold mb-2">Designation</label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={formData.designation}
                                    readOnly
                                    className="shadow appearance-none border border-blue-800 rounded-md w-full py-3 px-3 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Leave Information Card */}
                    <div className="bg-indigo-950/50 rounded-lg p-4 shadow-inner">
                        <h3 className="text-lg font-semibold text-blue-300 mb-4 border-b border-blue-800 pb-2">Leave Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-white text-sm font-semibold mb-2">Application Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    readOnly={isViewMode}
                                    className="shadow appearance-none border border-blue-800 rounded-md w-full py-3 px-3 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-white text-sm font-semibold mb-2">Type of Leave</label>
                                <select
                                    name="typeOfLeave"
                                    value={formData.typeOfLeave}
                                    onChange={handleChange}
                                    disabled={isViewMode}
                                    className="shadow appearance-none border border-blue-800 rounded-md w-full py-3 px-3 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="sick">Sick Leave</option>
                                    <option value="casual">Casual Leave</option>
                                    <option value="earned">Earned Leave</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-white text-sm font-semibold mb-2">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleDateChange}
                                    min={formData.date}
                                    disabled={isViewMode}
                                    className="shadow appearance-none border border-blue-800 rounded-md w-full py-3 px-3 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-white text-sm font-semibold mb-2">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleDateChange}
                                    min={formData.startDate}
                                    disabled={isViewMode}
                                    className="shadow appearance-none border border-blue-800 rounded-md w-full py-3 px-3 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-white text-sm font-semibold mb-2">Total Days</label>
                                <input
                                    type="text"
                                    name="totalLeaveDuration"
                                    value={formData.totalLeaveDuration}
                                    readOnly
                                    className="shadow appearance-none border border-blue-800 rounded-md w-full py-3 px-3 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reason Section */}
                    <div>
                        <label className="block text-white text-sm font-semibold mb-2">
                            <span className="flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-1 text-yellow-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 18h.01M12 14a4 4 0 10-4-4 4 4 0 004 4z"
                                    />
                                </svg>
                                Reason
                            </span>
                        </label>
                        <textarea
                            name="reason"
                            className={`shadow appearance-none border border-blue-800 rounded-md w-full py-3 px-3 bg-slate-900 text-white ${!isViewMode ? 'focus:outline-none focus:ring-2 focus:ring-blue-500' : ''} resize-none`}
                            rows={4}
                            placeholder="Enter your reason here"
                            value={formData.reason}
                            onChange={handleChange}
                            readOnly={isViewMode}
                            required={!isViewMode}
                        />
                        {!isViewMode && <p className="text-xs text-blue-400 mt-1">Please provide a detailed explanation for your leave request.</p>}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4">
                        <button
                            type="button"
                            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                            onClick={() => navigate('/employee/leaves/')}
                        >
                            {isViewMode ? 'Back' : 'Cancel'}
                        </button>

                        {!isViewMode && (
                            <button
                                type="submit"
                                className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {isEditMode ? 'Updating...' : 'Submitting...'}
                                    </>
                                ) : (
                                    <>{isEditMode ? 'Update Leave' : 'Submit Request'}</>
                                )}
                            </button>
                        )}

                        {isViewMode && id && (
                            <button
                                type="button"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={() => navigate(`/employee/leaves/edit/${id}`)}
                            >
                                Edit Leave
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LeaveForm;