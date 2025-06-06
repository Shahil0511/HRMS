import React from 'react';
import {
    FiUsers,
    FiEdit3,
    FiVideo,
    FiMic,
    FiMonitor,
    FiCamera
} from 'react-icons/fi';

interface Employee {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    dob: string;
    designation: string;
    skills?: string[];
    avatar?: string;
}

interface Assignment {
    id: string;
    employeeId: string;
    day: string;
    date: string;
    timeSlot: string;
    designation: string;
    task: string;
}

interface DragItem {
    type: 'employee' | 'assignment';
    employee?: Employee;
    assignment?: Assignment;
}

interface EmployeeListProps {
    employees: Employee[];
    assignments: Assignment[];
    onDragStart: (e: React.DragEvent, item: DragItem) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
    employees,
    assignments,
    onDragStart
}) => {
    const getDesignationIcon = (designation: string) => {
        const icons: Record<string, React.ReactNode> = {
            Assignment: <FiEdit3 className="w-4 h-4" />,
            PCR: <FiMonitor className="w-4 h-4" />,
            Digital: <FiMonitor className="w-4 h-4" />,
            Editing: <FiVideo className="w-4 h-4" />,
            Anchor: <FiMic className="w-4 h-4" />,
            Output: <FiMonitor className="w-4 h-4" />,
            Cameraman: <FiCamera className="w-4 h-4" />
        };
        return icons[designation] || <FiUsers className="w-4 h-4" />;
    };

    const getDesignationColor = (designation: string) => {
        const colors: Record<string, string> = {
            Assignment: 'bg-blue-400/20 border-blue-400/50 text-blue-200',
            PCR: 'bg-emerald-400/20 border-emerald-400/50 text-emerald-200',
            Digital: 'bg-purple-400/20 border-purple-400/50 text-purple-200',
            Editing: 'bg-rose-400/20 border-rose-400/50 text-rose-200',
            Anchor: 'bg-amber-400/20 border-amber-400/50 text-amber-200',
            Output: 'bg-indigo-400/20 border-indigo-400/50 text-indigo-200',
            Cameraman: 'bg-pink-400/20 border-pink-400/50 text-pink-200'
        };
        return colors[designation] || 'bg-gray-400/20 border-gray-400/50 text-gray-200';
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 text-white p-4 md:p-6">
            <div className="flex items-center space-x-2 mb-4">
                <FiUsers className="w-5 h-5 text-blue-300" />
                <h2 className="text-lg font-semibold text-blue-100">Available Staff</h2>
                <span className="bg-blue-500/30 text-blue-100 px-2 py-1 rounded text-xs">
                    {employees.length}
                </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
                {employees.map(employee => {
                    const employeeAssignments = assignments.filter(a => a.employeeId === employee.id);
                    const isAssigned = employeeAssignments.length > 0;

                    return (
                        <div
                            key={employee.id}
                            draggable
                            onDragStart={e => onDragStart(e, { type: 'employee', employee })}
                            className={`p-3 rounded-lg border-2 border-dashed cursor-move hover:shadow-lg transition-all ${getDesignationColor(employee.designation)} ${isAssigned ? 'opacity-75' : 'hover:opacity-90'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{employee.avatar}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{employee.name}</p>
                                    <div className="flex items-center space-x-1 mt-1">
                                        {getDesignationIcon(employee.designation)}
                                        <span className="text-xs">{employee.designation}</span>
                                    </div>
                                    {isAssigned && (
                                        <div className="text-xs text-blue-300/70 mt-1">
                                            {employeeAssignments.length} assignment{employeeAssignments.length > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EmployeeList;