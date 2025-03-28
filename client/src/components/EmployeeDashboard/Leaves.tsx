import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiClock, FiCheck, FiX, FiPlus, FiFilter, FiSearch } from 'react-icons/fi';

type LeaveStatus = 'pending' | 'approved' | 'rejected';
type LeaveType = 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid';

interface Leave {
    id: string;
    employeeId: string;
    employeeName: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    status: LeaveStatus;
    reason: string;
    submittedDate: string;
}

const EmployeeLeaves = () => {
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [filteredLeaves, setFilteredLeaves] = useState<Leave[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'all'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newLeave, setNewLeave] = useState<Omit<Leave, 'id' | 'submittedDate' | 'status'>>({
        employeeId: '',
        employeeName: '',
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        days: 0,
        reason: '',
    });

    useEffect(() => {
        // Mock data - in a real app, this would come from an API
        const mockLeaves: Leave[] = [
            {
                id: '1',
                employeeId: 'EMP001',
                employeeName: 'John Doe',
                leaveType: 'annual',
                startDate: '2023-06-15',
                endDate: '2023-06-20',
                days: 5,
                status: 'approved',
                reason: 'Family vacation',
                submittedDate: '2023-05-10',
            },
            {
                id: '2',
                employeeId: 'EMP002',
                employeeName: 'Jane Smith',
                leaveType: 'sick',
                startDate: '2023-06-10',
                endDate: '2023-06-12',
                days: 2,
                status: 'approved',
                reason: 'Flu',
                submittedDate: '2023-06-08',
            },
            {
                id: '3',
                employeeId: 'EMP003',
                employeeName: 'Robert Johnson',
                leaveType: 'unpaid',
                startDate: '2023-07-01',
                endDate: '2023-07-05',
                days: 4,
                status: 'pending',
                reason: 'Personal reasons',
                submittedDate: '2023-06-20',
            },
            {
                id: '4',
                employeeId: 'EMP004',
                employeeName: 'Emily Davis',
                leaveType: 'maternity',
                startDate: '2023-08-01',
                endDate: '2023-11-01',
                days: 90,
                status: 'approved',
                reason: 'Maternity leave',
                submittedDate: '2023-07-15',
            },
            {
                id: '5',
                employeeId: 'EMP005',
                employeeName: 'Michael Brown',
                leaveType: 'annual',
                startDate: '2023-06-25',
                endDate: '2023-06-30',
                days: 5,
                status: 'rejected',
                reason: 'Project deadline',
                submittedDate: '2023-06-10',
            },
            {
                id: '6',
                employeeId: 'EMP006',
                employeeName: 'Michael Brown',
                leaveType: 'sick',
                startDate: '2023-06-25',
                endDate: '2023-06-30',
                days: 5,
                status: 'rejected',
                reason: 'Project deadline',
                submittedDate: '2023-06-10',
            }, {
                id: '7',
                employeeId: 'EMP007',
                employeeName: 'Michael Brown',
                leaveType: 'annual',
                startDate: '2023-06-25',
                endDate: '2023-06-30',
                days: 5,
                status: 'rejected',
                reason: 'Project deadline',
                submittedDate: '2023-06-10',
            }, {
                id: '8',
                employeeId: 'EMP008',
                employeeName: 'Michael Brown',
                leaveType: 'maternity',
                startDate: '2023-06-25',
                endDate: '2023-06-30',
                days: 5,
                status: 'rejected',
                reason: 'Project deadline',
                submittedDate: '2023-06-10',
            },
        ];

        setLeaves(mockLeaves);
        setFilteredLeaves(mockLeaves);
    }, []);

    useEffect(() => {
        let results = leaves;

        // Apply status filter
        if (statusFilter !== 'all') {
            results = results.filter(leave => leave.status === statusFilter);
        }

        // Apply search term
        if (searchTerm) {
            results = results.filter(leave =>
                leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                leave.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredLeaves(results);
    }, [searchTerm, statusFilter, leaves]);

    const handleAddLeave = () => {
        // In a real app, this would send data to an API
        const newLeaveWithId: Leave = {
            ...newLeave,
            id: `temp-${Date.now()}`,
            status: 'pending',
            submittedDate: new Date().toISOString().split('T')[0],
            days: calculateDays(newLeave.startDate, newLeave.endDate),
        };

        setLeaves([...leaves, newLeaveWithId]);
        setIsAddModalOpen(false);
        setNewLeave({
            employeeId: '',
            employeeName: '',
            leaveType: 'annual',
            startDate: '',
            endDate: '',
            days: 0,
            reason: '',
        });
    };

    const calculateDays = (start: string, end: string): number => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = endDate.getTime() - startDate.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    };

    const handleStatusChange = (id: string, status: LeaveStatus) => {
        setLeaves(leaves.map(leave =>
            leave.id === id ? { ...leave, status } : leave
        ));
    };

    const getStatusColor = (status: LeaveStatus) => {
        switch (status) {
            case 'approved': return 'bg-green-500/20 text-green-500';
            case 'rejected': return 'bg-red-500/20 text-red-500';
            case 'pending': return 'bg-yellow-500/20 text-yellow-500';
            default: return 'bg-gray-500/20 text-gray-500';
        }
    };

    const getLeaveTypeColor = (type: LeaveType) => {
        switch (type) {
            case 'annual': return 'bg-blue-500/20 text-blue-500';
            case 'sick': return 'bg-purple-500/20 text-purple-500';
            case 'maternity': return 'bg-pink-500/20 text-pink-500';
            case 'paternity': return 'bg-teal-500/20 text-teal-500';
            case 'unpaid': return 'bg-gray-500/20 text-gray-500';
            default: return 'bg-gray-500/20 text-gray-500';
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex justify-center items-start">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-6xl bg-white/5 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden border border-white/10"
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-white">Employee Leaves Management</h1>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <FiPlus /> Add Leave
                        </motion.button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <FiFilter className="text-gray-400" />
                            <select
                                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as LeaveStatus | 'all')}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Leave Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Dates</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Days</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredLeaves.length > 0 ? (
                                    filteredLeaves.map((leave) => (
                                        <motion.tr
                                            key={leave.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="hover:bg-white/5"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                        <FiUser className="text-indigo-400" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-white">{leave.employeeName}</div>
                                                        <div className="text-sm text-white/60">{leave.employeeId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getLeaveTypeColor(leave.leaveType)}`}>
                                                    {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-white flex items-center gap-1">
                                                    <FiCalendar className="text-indigo-400" />
                                                    {leave.startDate} to {leave.endDate}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                <div className="flex items-center gap-1">
                                                    <FiClock className="text-indigo-400" />
                                                    {leave.days} day{leave.days !== 1 ? 's' : ''}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white/80 max-w-xs truncate">
                                                {leave.reason}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(leave.status)}`}>
                                                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {leave.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleStatusChange(leave.id, 'approved')}
                                                            className="text-green-500 hover:text-green-400"
                                                        >
                                                            <FiCheck />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleStatusChange(leave.id, 'rejected')}
                                                            className="text-red-500 hover:text-red-400"
                                                        >
                                                            <FiX />
                                                        </motion.button>
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-white/60">
                                            No leaves found matching your criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Leave Modal */}
                {isAddModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-white/10"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-white">Add New Leave</h2>
                                    <button
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="text-white/60 hover:text-white"
                                    >
                                        <FiX size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-1">Employee ID</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={newLeave.employeeId}
                                            onChange={(e) => setNewLeave({ ...newLeave, employeeId: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-1">Employee Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={newLeave.employeeName}
                                            onChange={(e) => setNewLeave({ ...newLeave, employeeName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-1">Leave Type</label>
                                        <select
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={newLeave.leaveType}
                                            onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value as LeaveType })}
                                        >
                                            <option value="annual">Annual</option>
                                            <option value="sick">Sick</option>
                                            <option value="maternity">Maternity</option>
                                            <option value="paternity">Paternity</option>
                                            <option value="unpaid">Unpaid</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white/80 mb-1">Start Date</label>
                                            <input
                                                type="date"
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={newLeave.startDate}
                                                onChange={(e) => {
                                                    setNewLeave({
                                                        ...newLeave,
                                                        startDate: e.target.value,
                                                        days: calculateDays(e.target.value, newLeave.endDate)
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/80 mb-1">End Date</label>
                                            <input
                                                type="date"
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={newLeave.endDate}
                                                onChange={(e) => {
                                                    setNewLeave({
                                                        ...newLeave,
                                                        endDate: e.target.value,
                                                        days: calculateDays(newLeave.startDate, e.target.value)
                                                    });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-1">Days</label>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={newLeave.days}
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-1">Reason</label>
                                        <textarea
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            rows={3}
                                            value={newLeave.reason}
                                            onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2 rounded-lg border border-gray-600 text-white hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleAddLeave}
                                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                                        disabled={!newLeave.employeeId || !newLeave.employeeName || !newLeave.startDate || !newLeave.endDate}
                                    >
                                        Submit Leave
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default EmployeeLeaves;