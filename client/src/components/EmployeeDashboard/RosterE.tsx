import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, getWeek, getYear } from 'date-fns';
import {
    FiClock,
    FiVideo,
    FiMic,
    FiMonitor,
    FiCamera,
    FiUsers,
    FiEdit3,
    FiCalendar
} from 'react-icons/fi';
import { getMyWeeklyRoster } from '../../services/rosterService';
import { getEmployeeById } from '../../services/employeeServices';

interface Assignment {
    id: string;
    employeeId: string;
    employeeName: string;
    day: string;
    date: string;
    timeSlot: string;
    shiftStart: string;
    shiftEnd: string;
    department: string;
    avatar?: string;
}

const RosterView: React.FC = () => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Generate week days
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), i);
        return {
            date,
            name: format(date, 'EEEE'),
            shortName: format(date, 'EEE'),
            dayNumber: format(date, 'dd'),
            dateString: format(date, 'yyyy-MM-dd')
        };
    });

    const timeSlots = [
        { label: '08-17', start: '08:00', end: '17:00' },
        { label: '09-18', start: '09:00', end: '18:00' },
        { label: '10-19', start: '10:00', end: '19:00' },
        { label: '11-20', start: '11:00', end: '20:00' },
        { label: '12-21', start: '12:00', end: '21:00' },
        { label: '13-22', start: '13:00', end: '22:00' },
    ].map(s => s.label);

    // Function to get random avatar
    const getRandomAvatar = () => {
        const avatars = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🎓', '👩‍🎓', '👨‍🔧', '👩‍🔧'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    };

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

    // Load roster data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
                const rosters = await getMyWeeklyRoster(format(weekStart, 'yyyy-MM-dd'));

                const newAssignments: Assignment[] = [];

                for (const roster of rosters || []) {
                    for (const dayAssignment of roster.dailyAssignments || []) {
                        for (const timeSlot of dayAssignment.timeSlots || []) {
                            for (const emp of timeSlot.assignedEmployees || []) {
                                let employeeName = 'Staff Member';

                                if (emp.employeeObject) {
                                    const employee = emp.employeeObject;
                                    employeeName =
                                        employee.name ||
                                        `${employee.firstName || ''} ${employee.lastName || ''}`.trim() ||
                                        employee.email?.split('@')[0] ||
                                        'Staff Member';
                                } else {
                                    // 🔁 Try fetching full employee details by ID
                                    if (emp.employee) {
                                        try {
                                            const fullEmp = await getEmployeeById(emp.employee);
                                            if (fullEmp) {
                                                employeeName =
                                                    fullEmp.name ||
                                                    `${fullEmp.firstName || ''} ${fullEmp.lastName || ''}`.trim() ||
                                                    fullEmp.email?.split('@')[0] ||
                                                    'Staff Member';
                                            }
                                        } catch (err) {
                                            console.warn('Failed to load employee info for:', emp.employee);
                                        }
                                    }
                                }

                                // Format name properly
                                if (employeeName) {
                                    employeeName = employeeName
                                        .split(' ')
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                        .join(' ');
                                }

                                newAssignments.push({
                                    id: `${roster._id}-${dayAssignment.date}-${timeSlot.timeSlot}-${emp.employee}`,
                                    employeeId: emp.employee,
                                    employeeName,
                                    day: dayAssignment.dayName,
                                    date: dayAssignment.date,
                                    timeSlot: timeSlot.timeSlot,
                                    shiftStart: timeSlot.shiftStart,
                                    shiftEnd: timeSlot.shiftEnd,
                                    department: emp.department || roster.department,
                                    avatar: getRandomAvatar()
                                });
                            }
                        }
                    }
                }

                setAssignments(newAssignments);
            } catch (error) {
                console.error('Error loading roster:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [currentWeek]);

    const navigateWeek = (direction: 'prev' | 'next') => {
        setCurrentWeek(addDays(currentWeek, direction === 'next' ? 7 : -7));
    };

    const getAssignmentsForSlot = (day: string, timeSlot: string) => {
        return assignments.filter(a => a.day === day && a.timeSlot === timeSlot);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="mt-4 text-blue-200">Loading roster data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 text-white p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gray-800/80 rounded-lg shadow-sm border border-gray-700 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <FiCalendar className="w-8 h-8 text-blue-400" />
                            <div>
                                <h1 className="text-3xl font-bold text-white">My Weekly Roster</h1>
                                <p className="text-gray-300">
                                    Week {getWeek(currentWeek)}, {getYear(currentWeek)}: {format(weekDays[0].date, 'MMM dd')} -{' '}
                                    {format(weekDays[6].date, 'MMM dd, yyyy')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => navigateWeek('prev')}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                            >
                                ← Previous Week
                            </button>
                            <button
                                onClick={() => navigateWeek('next')}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                            >
                                Next Week →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Schedule Grid */}
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
                                            className="border-r border-gray-700 last:border-r-0 p-2 min-h-20 bg-gray-800 transition-colors relative"
                                        >
                                            <div className="space-y-1 h-full">
                                                {dayAssignments.length > 0 ? (
                                                    <div className="grid grid-cols-1 gap-1 h-full overflow-y-auto">
                                                        {dayAssignments.map(assignment => (
                                                            <div
                                                                key={assignment.id}
                                                                className={`p-1 rounded border text-xs ${getDesignationColor(
                                                                    assignment.department
                                                                )} relative group cursor-pointer`}
                                                                title={`${assignment.employeeName} - ${assignment.department} (${assignment.shiftStart}-${assignment.shiftEnd})`}
                                                            >
                                                                <div className="flex items-center space-x-1 min-w-0 mb-1">
                                                                    <span className="text-sm">{assignment.avatar}</span>
                                                                    <span className="truncate font-medium">{assignment.employeeName}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-1 mt-1">
                                                                    {getDesignationIcon(assignment.department)}
                                                                    <span className="truncate text-xs">{assignment.department}</span>
                                                                </div>
                                                                <div className="text-xs mt-1 opacity-80">
                                                                    {assignment.shiftStart}-{assignment.shiftEnd}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <div className="text-gray-600 text-xs">
                                                            No assignment
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
            </div>
        </div>
    );
};

export default RosterView;