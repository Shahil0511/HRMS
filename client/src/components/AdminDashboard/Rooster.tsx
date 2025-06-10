import React, { useState, useCallback, useEffect } from 'react';
import { format, startOfWeek, addDays, getWeek, getYear, isSameWeek } from 'date-fns';
import { FiCalendar, FiSave, FiEdit } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllEmployees } from '../../services/employeeServices';
import {
    createWeeklyRoster,
    updateWeeklyRoster,
    fetchWeeklyRosters,
    IWeeklyRoster,
    IDayAssignment,
    ITimeSlotAssignment,
    validateRosterData,
    // updateTimeSlotAssignments
} from '../../services/rosterService';
import EmployeeList from './roosterUtils/EmployeeList';
import WeeklySchedule from './roosterUtils/WeeklySchedule';

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
        'Assignment', 'PCR', 'Digital', 'Editing', 'Anchor',
        'Output', 'Cameraman', 'Graphics', 'IT', 'Executive Assistant'
    ];

    const shiftFormats = [
        { label: '08-17', start: '08:00', end: '17:00' },
        { label: '09-18', start: '09:00', end: '18:00' },
        { label: '10-19', start: '10:00', end: '19:00' },
        { label: '11-20', start: '11:00', end: '20:00' },
        { label: '12-21', start: '12:00', end: '21:00' },
        { label: '13-22', start: '13:00', end: '22:00' },
    ];

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

    const getRandomAvatar = () => {
        const avatars = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🎓', '👩‍🎓', '👨‍🔧', '👩‍🔧'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    };

    const getRandomDesignation = () => {
        return departments[Math.floor(Math.random() * departments.length)];
    };

    // Drag and Drop handlers
    const handleDragStart = useCallback((e: React.DragEvent, item: DragItem) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDrop = useCallback(
        (day: string, timeSlot: string, date: string) => {
            if (!draggedItem) return;

            if (draggedItem.type === 'employee' && draggedItem.employee) {
                // Check for existing assignment on the SAME DAY
                const existingAssignment = assignments.find(
                    a =>
                        a.employeeId === draggedItem.employee?.id &&
                        a.day === day
                );

                if (existingAssignment) {
                    toast.warning(
                        `${draggedItem.employee.name} is already assigned to ${day} (${timeSlot})`
                    );
                    return;
                }

                // Remove the check for conflicting assignments on different days
                // (commented out the previous conflicting assignment check)

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
        const assignment = assignments.find(a => a.id === assignmentId);
        if (assignment) {
            const employee = employees.find(e => e.id === assignment.employeeId);
            const employeeName = employee ? employee.name : 'Employee';

            setAssignments(prev => prev.filter(a => a.id !== assignmentId));
            setHasUnsavedChanges(true);
            toast.info(`${employeeName} removed from ${assignment.day} (${assignment.timeSlot})`);
        }
    }, [assignments, employees]);

    // const updateSingleTimeSlot = async (day: string, timeSlot: string) => {
    //     if (!currentWeekRoster?._id) {
    //         toast.error('No roster found to update');
    //         return;
    //     }

    //     const dayAssignments = assignments.filter(
    //         a => a.day === day && a.timeSlot === timeSlot
    //     );

    //     const assignedEmployees = dayAssignments.map(assignment => ({
    //         employee: assignment.employeeId,
    //         department: assignment.designation
    //     }));

    //     try {
    //         const result = await updateTimeSlotAssignments(
    //             currentWeekRoster._id,
    //             day,
    //             timeSlot,
    //             assignedEmployees
    //         );

    //         if (result) {
    //             toast.success(`${day} (${timeSlot}) updated successfully`);
    //             setCurrentWeekRoster(result);
    //         } else {
    //             toast.error('Failed to update time slot');
    //         }
    //     } catch (error) {
    //         console.error('Error updating time slot:', error);
    //         toast.error('Failed to update time slot');
    //     }
    // };

    // Load roster data
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

    // Navigation and actions
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

            // Build daily assignments from current assignments
            const dailyAssignments: IDayAssignment[] = weekDays.map(day => {
                const dayTimeSlots: ITimeSlotAssignment[] = shiftFormats.map(shift => {
                    const dayAssignments = assignments.filter(
                        a => a.day === day.name && a.timeSlot === shift.label
                    );

                    return {
                        timeSlot: shift.label,
                        shiftStart: shift.start,
                        shiftEnd: shift.end,
                        assignedEmployees: dayAssignments.map(assignment => {
                            // Find the employee object for this assignment
                            const employeeObject = employees.find(emp => emp.id === assignment.employeeId);

                            return {
                                employee: assignment.employeeId,
                                department: assignment.designation,
                                employeeObject: employeeObject || null // Add the required employeeObject property
                            };
                        })
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

            // Validate data before sending
            const validation = validateRosterData(weeklyRosterData);
            if (!validation.isValid) {
                console.error('Validation errors:', validation.errors);
                toast.error(`Validation failed: ${validation.errors.join(', ')}`);
                return;
            }

            // Explicitly type `result` as `IWeeklyRoster | null`
            let result: IWeeklyRoster | null;

            // Determine if we're updating or creating
            const isEditMode = currentWeekRoster !== null &&
                isSameWeek(new Date(currentWeekRoster.weekStartDate), currentWeek, { weekStartsOn: 1 });

            if (isEditMode && currentWeekRoster?._id) {
                result = await updateWeeklyRoster(currentWeekRoster._id, weeklyRosterData);
            } else {
                result = await createWeeklyRoster(weeklyRosterData);
            }

            if (result) {
                toast.success(
                    `Weekly roster ${isEditMode ? 'updated' : 'created'} successfully for week ${getWeek(weekStart)}, ${getYear(weekStart)}!`
                );
                setCurrentWeekRoster(result);

                // Update assignments with new data to ensure consistency
                const updatedAssignments: Assignment[] = [];
                result.dailyAssignments.forEach((dayAssignment: IDayAssignment) => {
                    dayAssignment.timeSlots.forEach((timeSlot: ITimeSlotAssignment) => {
                        timeSlot.assignedEmployees.forEach((emp, index) => {
                            updatedAssignments.push({
                                id: `${result!._id}-${dayAssignment.date}-${timeSlot.timeSlot}-${index}-${emp.employee}`,
                                employeeId: emp.employee,
                                day: dayAssignment.dayName,
                                date: dayAssignment.date,
                                timeSlot: timeSlot.timeSlot,
                                designation: emp.department || result!.department,
                                task: `${timeSlot.timeSlot} Shift`
                            });
                        });
                    });
                });

                setAssignments(updatedAssignments);
                setHasUnsavedChanges(false);
            } else {
                toast.error(`Failed to ${isEditMode ? 'update' : 'create'} weekly roster.`);
            }
        } catch (error) {
            console.error('Error in saveOrUpdateRoster:', error);
            toast.error('An unexpected error occurred while saving the roster');
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

    // Effects
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

    // Helper functions
    const filteredEmployees = selectedDepartment === 'All'
        ? employees
        : employees.filter(emp => emp.designation === selectedDepartment);

    const hasRosterData = currentWeekRoster !== null &&
        isSameWeek(new Date(currentWeekRoster.weekStartDate), currentWeek, { weekStartsOn: 1 });

    const isEditMode = hasRosterData;

    const getRosterStatus = () => {
        if (isLoadingRoster) return 'Loading...';
        if (hasRosterData) return 'Saved';
        return 'New';
    };

    const getRosterStatusColor = () => {
        if (isLoadingRoster) return 'text-blue-400';
        if (hasRosterData) return 'text-green-400';
        return 'text-gray-400';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="mt-4 text-blue-200">Loading employees...</p>
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
                                <h1 className="text-3xl font-bold text-white">Weekly Roster Management</h1>
                                <p className="text-gray-300">
                                    Week {getWeek(currentWeek)}, {getYear(currentWeek)}: {format(weekDays[0].date, 'MMM dd')} -{' '}
                                    {format(weekDays[6].date, 'MMM dd, yyyy')}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                    <span className={`text-sm font-medium ${getRosterStatusColor()}`}>
                                        Status: {getRosterStatus()}
                                    </span>
                                    {hasUnsavedChanges && (
                                        <span className="text-sm text-amber-400 font-medium">
                                            • Unsaved Changes
                                        </span>
                                    )}
                                    {isLoadingRoster && (
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                                            <span className="text-sm text-blue-400">Loading roster...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => navigateWeek('prev')}
                                disabled={isLoadingRoster}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
                            >
                                ← Previous Week
                            </button>
                            <button
                                onClick={() => navigateWeek('next')}
                                disabled={isLoadingRoster}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
                            >
                                Next Week →
                            </button>
                            <button
                                onClick={clearRoster}
                                disabled={isLoadingRoster || assignments.length === 0}
                                className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                            >
                                Clear Roster
                            </button>
                            <button
                                onClick={saveOrUpdateRoster}
                                disabled={isSaving || isLoadingRoster || assignments.length === 0}
                                className={`px-4 py-2 ${isSaving || assignments.length === 0
                                    ? 'bg-blue-500/50'
                                    : isEditMode
                                        ? 'bg-green-600 hover:bg-green-500'
                                        : 'bg-blue-600 hover:bg-blue-500'
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

                    {/* Department Filter */}
                    <div className="flex items-center space-x-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-300">Filter by Department:</span>
                        {['All', ...departments].map(dept => (
                            <button
                                key={dept}
                                onClick={() => setSelectedDepartment(dept)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedDepartment === dept
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                    }`}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="mt-4 flex items-center space-x-4 text-sm text-gray-300">
                        <span>Total Assignments: <strong className="text-white">{assignments.length}</strong></span>
                        <span>Available Staff: <strong className="text-white">{filteredEmployees.length}</strong></span>
                        <span>Assigned Staff: <strong className="text-white">{new Set(assignments.map(a => a.employeeId)).size}</strong></span>
                        {hasRosterData && currentWeekRoster && (
                            <span>Roster ID: <strong className="font-mono text-xs text-blue-300">{currentWeekRoster._id}</strong></span>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <EmployeeList
                            employees={filteredEmployees}
                            assignments={assignments}
                            onDragStart={handleDragStart}
                        />
                    </div>

                    <div className="lg:col-span-3">
                        <WeeklySchedule
                            weekDays={weekDays}
                            timeSlots={shiftFormats.map(s => s.label)}
                            assignments={assignments}
                            employees={employees}
                            onDrop={handleDrop}
                            onRemoveAssignment={removeAssignment}
                        />
                    </div>
                </div>
            </div>
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                toastClassName="bg-gray-800 text-white"
                progressClassName="bg-blue-500"
            />
        </div>
    );
};

export default Roster;