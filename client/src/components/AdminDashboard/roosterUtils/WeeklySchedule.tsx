import React from 'react';
import {
    FiClock,
    FiPlus,
    FiTrash2,
    FiEdit3,
    FiVideo,
    FiMic,
    FiMonitor,
    FiCamera,
    FiUsers
} from 'react-icons/fi';

interface WeekDay {
    date: Date;
    name: string;
    shortName: string;
    dayNumber: string;
    dateString: string;
}

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

interface WeeklyScheduleProps {
    weekDays: WeekDay[];
    timeSlots: string[];
    assignments: Assignment[];
    employees: Employee[];
    onDrop: (day: string, timeSlot: string, date: string) => void;
    onRemoveAssignment: (assignmentId: string) => void;
}

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
    weekDays,
    timeSlots,
    assignments,
    employees,
    onDrop,
    onRemoveAssignment
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
            Assignment: 'bg-blue-900 border-blue-700 text-blue-100',
            PCR: 'bg-green-900 border-green-700 text-green-100',
            Digital: 'bg-purple-900 border-purple-700 text-purple-100',
            Editing: 'bg-red-900 border-red-700 text-red-100',
            Anchor: 'bg-yellow-900 border-yellow-700 text-yellow-100',
            Output: 'bg-indigo-900 border-indigo-700 text-indigo-100',
            Cameraman: 'bg-pink-900 border-pink-700 text-pink-100'
        };
        return colors[designation] || 'bg-gray-800 border-gray-600 text-gray-100';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, day: string, timeSlot: string, date: string) => {
        e.preventDefault();
        onDrop(day, timeSlot, date);
    };

    const getAssignmentsForSlot = (day: string, timeSlot: string) => {
        return assignments.filter(a => a.day === day && a.timeSlot === timeSlot);
    };

    const getEmployeeById = (id: string) => {
        return employees.find(e => e.id === id);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-800 to-gray-900 text-white rounded-lg shadow-lg border border-gray-700 overflow-hidden">
            <div className="grid grid-cols-8 bg-gray-800 border-b border-gray-700">
                <div className="p-3 text-center font-medium text-gray-300 border-r border-gray-700">
                    <FiClock className="w-4 h-4 mx-auto mb-1" />
                    Time
                </div>
                {weekDays.map(day => (
                    <div key={day.name} className="p-3 text-center border-r border-gray-700 last:border-r-0">
                        <div className="font-semibold text-white">{day.shortName}</div>
                        <div className="text-sm text-gray-300">{day.dayNumber}</div>
                        <div className="text-xs text-gray-500">{day.dateString}</div>
                    </div>
                ))}
            </div>

            <div className="divide-y divide-gray-700">
                {timeSlots.map(timeSlot => (
                    <div key={timeSlot} className="grid grid-cols-8 min-h-20">
                        <div className="p-3 bg-gray-800 border-r border-gray-700 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-300">{timeSlot}</span>
                        </div>

                        {weekDays.map(day => {
                            const dayAssignments = getAssignmentsForSlot(day.name, timeSlot);

                            return (
                                <div
                                    key={`${day.name}-${timeSlot}`}
                                    className="border-r border-gray-700 last:border-r-0 p-2 min-h-20 bg-gray-800 hover:bg-gray-750 transition-colors relative"
                                    onDragOver={handleDragOver}
                                    onDrop={e => handleDrop(e, day.name, timeSlot, day.dateString)}
                                >
                                    <div className="space-y-1 h-full">
                                        {dayAssignments.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-1 h-full overflow-y-auto">
                                                {dayAssignments.map(assignment => {
                                                    const employee = getEmployeeById(assignment.employeeId);
                                                    if (!employee) return null;

                                                    return (
                                                        <div
                                                            key={assignment.id}
                                                            className={`p-1 rounded border text-xs ${getDesignationColor(
                                                                assignment.designation
                                                            )} relative group cursor-pointer`}
                                                            title={`${employee.name} - ${assignment.designation}`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-1 min-w-0">
                                                                    <span>{employee.avatar}</span>
                                                                    <span className="truncate">{employee.firstName}</span>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onRemoveAssignment(assignment.id);
                                                                    }}
                                                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                                                                    title="Remove assignment"
                                                                >
                                                                    <FiTrash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center space-x-1 mt-1">
                                                                {getDesignationIcon(assignment.designation)}
                                                                <span className="truncate text-xs">{assignment.designation}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-gray-600 text-xs">
                                                    <FiPlus className="w-3 h-3 mx-auto" />
                                                    Drop here
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeeklySchedule;