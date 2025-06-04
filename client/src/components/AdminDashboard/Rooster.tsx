import React, { useState, useCallback, useEffect } from 'react';
import { format, startOfWeek, addDays, getWeek, getYear, isSameWeek } from 'date-fns';
import {
    FiUsers,
    FiCalendar,
    FiClock,
    FiEdit3,
    FiVideo,
    FiMic,
    FiMonitor,
    FiCamera,
    FiPlus,
    FiTrash2,
    FiSave,
    FiEdit
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllEmployees } from '../../services/employeeServices';
import {
    createWeeklyRoster,
    updateWeeklyRoster,
    fetchWeeklyRosters,
    IWeeklyRoster,
    IDayAssignment,
    ITimeSlotAssignment
} from '../../services/rosterService';

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

const Roster: React.FC = () => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingRoster, setIsLoadingRoster] = useState(false);
    const [currentWeekRoster, setCurrentWeekRoster] = useState<IWeeklyRoster | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const departments = [
        'Assignment',
        'PCR',
        'Digital',
        'Editing',
        'Anchor',
        'Output',
        'Cameraman',
        'Graphics',
        'IT',
        'Executive Assistant'
    ];

    const shiftFormats = [
        { label: '08-17', start: '08:00', end: '17:00' },
        { label: '09-18', start: '09:00', end: '18:00' },
        { label: '10-19', start: '10:00', end: '19:00' },
        { label: '11-20', start: '11:00', end: '20:00' },
        { label: '12-21', start: '12:00', end: '21:00' },
        { label: '11-22', start: '11:00', end: '22:00' },
    ];

    const timeSlots = shiftFormats.map(shift => shift.label);

    const getRandomAvatar = () => {
        const avatars = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🎓', '👩‍🎓', '👨‍🔧', '👩‍🔧'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    };

    const getRandomDesignation = () => {
        return departments[Math.floor(Math.random() * departments.length)];
    };

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
            Assignment: 'bg-blue-100 border-blue-300 text-blue-800',
            PCR: 'bg-green-100 border-green-300 text-green-800',
            Digital: 'bg-purple-100 border-purple-300 text-purple-800',
            Editing: 'bg-red-100 border-red-300 text-red-800',
            Anchor: 'bg-yellow-100 border-yellow-300 text-yellow-800',
            Output: 'bg-indigo-100 border-indigo-300 text-indigo-800',
            Cameraman: 'bg-pink-100 border-pink-300 text-pink-800'
        };
        return colors[designation] || 'bg-gray-100 border-gray-300 text-gray-800';
    };

    const handleDragStart = useCallback((e: React.DragEvent, item: DragItem) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, day: string, timeSlot: string, date: string) => {
            e.preventDefault();

            if (!draggedItem) return;

            if (draggedItem.type === 'employee' && draggedItem.employee) {
                const existingAssignment = assignments.find(
                    a =>
                        a.employeeId === draggedItem.employee?.id &&
                        a.day === day &&
                        a.timeSlot === timeSlot
                );

                if (existingAssignment) {
                    toast.warning(
                        `${draggedItem.employee.name} is already assigned to ${day} (${timeSlot})`
                    );
                    return;
                }

                const newAssignment: Assignment = {
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    employeeId: draggedItem.employee.id,
                    day,
                    date,
                    timeSlot,
                    designation: draggedItem.employee.designation,
                    task: `${draggedItem.employee.designation} Task`
                };

                setAssignments(prev => [...prev, newAssignment]);
                setHasUnsavedChanges(true);
                toast.success(
                    `${draggedItem.employee.name} assigned to ${day} (${timeSlot})`
                );
            }

            setDraggedItem(null);
        },
        [draggedItem, assignments]
    );

    const removeAssignment = useCallback((assignmentId: string) => {
        setAssignments(prev => prev.filter(a => a.id !== assignmentId));
        setHasUnsavedChanges(true);
        toast.info('Assignment removed');
    }, []);

    const getAssignmentsForSlot = useCallback(
        (day: string, timeSlot: string) => {
            return assignments.filter(a => a.day === day && a.timeSlot === timeSlot);
        },
        [assignments]
    );

    const getEmployeeById = useCallback(
        (id: string) => {
            return employees.find(e => e.id === id);
        },
        [employees]
    );

    const filteredEmployees =
        selectedDepartment === 'All'
            ? employees
            : employees.filter(emp => emp.designation === selectedDepartment);

    const hasRosterData = currentWeekRoster !== null &&
        isSameWeek(
            new Date(currentWeekRoster.weekStartDate),
            currentWeek,
            { weekStartsOn: 1 }
        );

    const isEditMode = hasRosterData;

    const loadWeeklyRoster = async (weekToLoad: Date) => {
        setIsLoadingRoster(true);
        try {
            const weekStart = startOfWeek(weekToLoad, { weekStartsOn: 1 });
            const weekEnd = addDays(weekStart, 6);

            setAssignments([]);
            setCurrentWeekRoster(null);
            setHasUnsavedChanges(false);

            const rosters = await fetchWeeklyRosters(
                format(weekStart, 'yyyy-MM-dd'),
                format(weekEnd, 'yyyy-MM-dd')
            );

            if (rosters && rosters.length > 0) {
                const rosterForWeek = rosters.find(r =>
                    isSameWeek(new Date(r.weekStartDate), weekToLoad, { weekStartsOn: 1 })
                );

                if (rosterForWeek) {
                    setCurrentWeekRoster(rosterForWeek);

                    const newAssignments: Assignment[] = [];

                    rosterForWeek.dailyAssignments.forEach((dayAssignment: IDayAssignment) => {
                        dayAssignment.timeSlots.forEach((timeSlot: ITimeSlotAssignment) => {
                            timeSlot.assignedEmployees.forEach((emp, index) => {
                                newAssignments.push({
                                    id: `${rosterForWeek._id}-${dayAssignment.date}-${timeSlot.timeSlot}-${index}-${emp.employee}`,
                                    employeeId: emp.employee,
                                    day: dayAssignment.dayName,
                                    date: dayAssignment.date,
                                    timeSlot: timeSlot.timeSlot,
                                    designation: emp.department || rosterForWeek.department,
                                    task: `${timeSlot.timeSlot} Shift`
                                });
                            });
                        });
                    });

                    setAssignments(newAssignments);
                }
            }
        } catch (error) {
            console.error('Error loading weekly roster:', error);
            toast.error('Failed to load weekly roster');
        } finally {
            setIsLoadingRoster(false);
        }
    };

    const navigateWeek = async (direction: 'prev' | 'next') => {
        if (hasUnsavedChanges) {
            const confirmLeave = window.confirm(
                'You have unsaved changes. Are you sure you want to navigate away? Your changes will be lost.'
            );
            if (!confirmLeave) return;
        }

        const newWeek = addDays(currentWeek, direction === 'next' ? 7 : -7);
        setCurrentWeek(newWeek);
        await loadWeeklyRoster(newWeek);
    };

    const saveOrUpdateRoster = async () => {
        if (assignments.length === 0) {
            toast.warning('No assignments to save');
            return;
        }

        setIsSaving(true);
        try {
            const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
            const weekEnd = addDays(weekStart, 6);

            const dailyAssignments: IDayAssignment[] = weekDays.map(day => {
                const dayTimeSlots: ITimeSlotAssignment[] = shiftFormats.map(shift => {
                    const dayAssignments = assignments.filter(
                        a => a.day === day.name && a.timeSlot === shift.label
                    );

                    return {
                        timeSlot: shift.label,
                        shiftStart: shift.start,
                        shiftEnd: shift.end,
                        assignedEmployees: dayAssignments.map(assignment => ({
                            employee: assignment.employeeId,
                            department: assignment.designation
                        }))
                    };
                });

                return {
                    date: day.dateString,
                    dayName: day.name,
                    timeSlots: dayTimeSlots
                };
            });

            const weeklyRosterData = {
                department: selectedDepartment === 'All' ? 'General' : selectedDepartment,
                weekStartDate: format(weekStart, 'yyyy-MM-dd'),
                weekEndDate: format(weekEnd, 'yyyy-MM-dd'),
                weekNumber: getWeek(weekStart),
                year: getYear(weekStart),
                dailyAssignments: dailyAssignments
            };

            let result;
            if (isEditMode && currentWeekRoster?._id) {
                result = await updateWeeklyRoster(currentWeekRoster._id, weeklyRosterData);
                if (result) {
                    toast.success(`Weekly roster updated for week ${getWeek(weekStart)}, ${getYear(weekStart)}!`);
                    setCurrentWeekRoster(result);
                }
            } else {
                result = await createWeeklyRoster(weeklyRosterData);
                if (result) {
                    toast.success(`Weekly roster saved for week ${getWeek(weekStart)}, ${getYear(weekStart)}!`);
                    setCurrentWeekRoster(result);
                }
            }

            if (result) {
                setHasUnsavedChanges(false);
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'saving'} weekly roster:`, error);
            toast.error(`Failed to ${isEditMode ? 'update' : 'save'} weekly roster`);
        } finally {
            setIsSaving(false);
        }
    };

    const clearRoster = () => {
        if (assignments.length === 0) {
            toast.info('No assignments to clear');
            return;
        }

        const confirmClear = window.confirm(
            'Are you sure you want to clear all assignments? This action cannot be undone.'
        );

        if (confirmClear) {
            setAssignments([]);
            setHasUnsavedChanges(true);
            toast.success('Roster cleared');
        }
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            setIsLoading(true);
            try {
                const employeesData = await getAllEmployees();
                if (employeesData && Array.isArray(employeesData.employees)) {
                    const simplifiedEmployees = employeesData.employees.map((emp: any) => ({
                        id: emp._id,
                        name: `${emp.firstName} ${emp.lastName}`,
                        firstName: emp.firstName,
                        lastName: emp.lastName,
                        email: emp.email,
                        gender: emp.gender,
                        dob: emp.dob,
                        designation: emp.designation || getRandomDesignation(),
                        avatar: getRandomAvatar()
                    }));
                    setEmployees(simplifiedEmployees);
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
                toast.error('Failed to load employees');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    useEffect(() => {
        if (employees.length > 0) {
            loadWeeklyRoster(currentWeek);
        }
    }, [currentWeek, employees.length]);

    const getRosterStatus = () => {
        if (isLoadingRoster) return 'Loading...';
        if (hasRosterData) return 'Saved';
        return 'New';
    };

    const getRosterStatusColor = () => {
        if (isLoadingRoster) return 'text-blue-600';
        if (hasRosterData) return 'text-green-600';
        return 'text-gray-600';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading employees...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <FiCalendar className="w-8 h-8 text-blue-600" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Weekly Roster Management</h1>
                                <p className="text-gray-600">
                                    Week {getWeek(currentWeek)}, {getYear(currentWeek)}: {format(weekDays[0].date, 'MMM dd')} -{' '}
                                    {format(weekDays[6].date, 'MMM dd, yyyy')}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                    <span className={`text-sm font-medium ${getRosterStatusColor()}`}>
                                        Status: {getRosterStatus()}
                                    </span>
                                    {hasUnsavedChanges && (
                                        <span className="text-sm text-orange-600 font-medium">
                                            • Unsaved Changes
                                        </span>
                                    )}
                                    {isLoadingRoster && (
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                            <span className="text-sm text-blue-600">Loading roster...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => navigateWeek('prev')}
                                disabled={isLoadingRoster}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                            >
                                ← Previous Week
                            </button>
                            <button
                                onClick={() => navigateWeek('next')}
                                disabled={isLoadingRoster}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                            >
                                Next Week →
                            </button>
                            <button
                                onClick={clearRoster}
                                disabled={isLoadingRoster || assignments.length === 0}
                                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                            >
                                Clear Roster
                            </button>
                            <button
                                onClick={saveOrUpdateRoster}
                                disabled={isSaving || isLoadingRoster || assignments.length === 0}
                                className={`px-4 py-2 ${isSaving || assignments.length === 0
                                        ? 'bg-blue-400'
                                        : isEditMode
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2`}
                            >
                                {isEditMode ? <FiEdit className="w-4 h-4" /> : <FiSave className="w-4 h-4" />}
                                <span>
                                    {isSaving
                                        ? (isEditMode ? 'Updating...' : 'Saving...')
                                        : (isEditMode ? 'Update Roster' : 'Save Roster')
                                    }
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-700">Filter by Department:</span>
                        {['All', ...departments].map(dept => (
                            <button
                                key={dept}
                                onClick={() => setSelectedDepartment(dept)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedDepartment === dept
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
                        <span>Total Assignments: <strong>{assignments.length}</strong></span>
                        <span>Available Staff: <strong>{filteredEmployees.length}</strong></span>
                        <span>Assigned Staff: <strong>{new Set(assignments.map(a => a.employeeId)).size}</strong></span>
                        {hasRosterData && currentWeekRoster && (
                            <span>Roster ID: <strong className="font-mono text-xs">{currentWeekRoster._id}</strong></span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <FiUsers className="w-5 h-5 text-gray-600" />
                                <h2 className="text-lg font-semibold">Available Staff</h2>
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                    {filteredEmployees.length}
                                </span>
                            </div>

                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {filteredEmployees.map(employee => {
                                    const employeeAssignments = assignments.filter(a => a.employeeId === employee.id);
                                    const isAssigned = employeeAssignments.length > 0;

                                    return (
                                        <div
                                            key={employee.id}
                                            draggable
                                            onDragStart={e => handleDragStart(e, { type: 'employee', employee })}
                                            className={`p-3 rounded-lg border-2 border-dashed cursor-move hover:shadow-md transition-all ${getDesignationColor(employee.designation)
                                                } ${isAssigned ? 'opacity-75' : ''}`}
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
                                                        <div className="text-xs text-gray-600 mt-1">
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
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="grid grid-cols-8 bg-gray-50 border-b">
                                <div className="p-3 text-center font-medium text-gray-700 border-r">
                                    <FiClock className="w-4 h-4 mx-auto mb-1" />
                                    Time
                                </div>
                                {weekDays.map(day => (
                                    <div key={day.name} className="p-3 text-center border-r last:border-r-0">
                                        <div className="font-semibold text-gray-900">{day.shortName}</div>
                                        <div className="text-sm text-gray-500">{day.dayNumber}</div>
                                        <div className="text-xs text-gray-400">{day.dateString}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="divide-y">
                                {timeSlots.map(timeSlot => (
                                    <div key={timeSlot} className="grid grid-cols-8 min-h-20">
                                        <div className="p-3 bg-gray-50 border-r flex items-center justify-center">
                                            <span className="text-sm font-medium text-gray-700">{timeSlot}</span>
                                        </div>

                                        {weekDays.map(day => {
                                            const dayAssignments = getAssignmentsForSlot(day.name, timeSlot);

                                            return (
                                                <div
                                                    key={`${day.name}-${timeSlot}`}
                                                    className="border-r last:border-r-0 p-2 min-h-20 bg-gray-25 hover:bg-gray-50 transition-colors relative"
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
                                                                                        removeAssignment(assignment.id);
                                                                                    }}
                                                                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
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
                                                                <div className="text-gray-300 text-xs">
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
                    </div>
                </div>
            </div>
            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
};

export default Roster;