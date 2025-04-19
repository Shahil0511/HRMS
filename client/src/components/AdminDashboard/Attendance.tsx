import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadAdminAttendance } from "../../store/slices/attendanceSlice";
import { RootState, AppDispatch } from "../../store/store";
import ContentLoader from "react-content-loader";
import { useNavigate } from "react-router-dom";
import ExcelJS from 'exceljs';

const AdminAttendance = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { adminRecords } = useSelector((state: RootState) => state.attendance);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const itemsPerPage = 6;

    const fetchAttendance = useCallback(() => {
        setLoading(true);
        dispatch(loadAdminAttendance())
            .finally(() => {
                setLoading(false);
            });
    }, [dispatch]);



    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const handlePageChange = (page: number) => setCurrentPage(page);
    const handleNextPage = () => {
        if (currentPage < Math.ceil(adminRecords.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const paginatedRecords = adminRecords.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleClick = (id: string) => {
        navigate(`/admin/attendance/${id}`);
    };

    const exportToExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Attendance System';
            workbook.created = new Date();

            const worksheet = workbook.addWorksheet('Attendance Records');

            // Define columns with appropriate widths (removed department)
            worksheet.columns = [
                { header: 'ID', key: 'id', width: 12 },
                { header: 'Employee Name', key: 'name', width: 25 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Check-In Time', key: 'checkIn', width: 20 },
                { header: 'Check-Out Time', key: 'checkOut', width: 20 },
                { header: 'Total Time Worked', key: 'totalTimeWorked', width: 20 },
                { header: 'Status', key: 'status', width: 15 }
            ];

            // Style header row
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4F46E5' } // indigo-600
            };
            headerRow.alignment = { horizontal: 'center' };

            // Add data rows
            adminRecords.forEach((record) => {
                // Process checkIn - handle as string or get first item if array
                let checkInValue: string = 'N/A';
                if (record.checkIn) {
                    // Access first element if it's an array, or use directly if it's actually a string
                    const checkInStr = Array.isArray(record.checkIn) ? record.checkIn[0] : record.checkIn as unknown as string;
                    checkInValue = checkInStr || 'N/A';
                }

                // Process checkOut - handle as string or get first item if array
                let checkOutValue: string = 'N/A';
                let fullCheckOutValue: string = 'N/A'; // Keep full datetime for calculation

                if (record.checkOut) {
                    // Access first element if it's an array, or use directly if it's actually a string
                    const checkOutStr = Array.isArray(record.checkOut) ? record.checkOut[0] : record.checkOut as unknown as string;
                    fullCheckOutValue = checkOutStr || 'N/A';

                    // Remove date part for display only
                    if (checkOutStr && typeof checkOutStr === 'string') {
                        const dateMatch = /^\d{4}-\d{2}-\d{2}\s(.+)$/.exec(checkOutStr);
                        checkOutValue = dateMatch ? dateMatch[1] : checkOutStr;
                    } else {
                        checkOutValue = checkOutStr || 'N/A';
                    }
                }

                // Calculate total time worked
                let calculatedTotalTime = 'N/A';

                if (checkInValue !== 'N/A' && fullCheckOutValue !== 'N/A') {
                    try {
                        // Prepare dates for calculation
                        const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

                        // Parse checkout time (which might include date)
                        let checkOutDate: Date;
                        if (fullCheckOutValue.includes('-')) {
                            // Full datetime already present
                            checkOutDate = new Date(fullCheckOutValue);
                        } else {
                            // Only time present, assume same day
                            checkOutDate = new Date(`${today}T${fullCheckOutValue}`);
                        }

                        // Parse checkin time (add today's date if needed)
                        const checkInDate = new Date(`${today}T${checkInValue}`);

                        // Calculate difference in milliseconds
                        const diffMs = checkOutDate.getTime() - checkInDate.getTime();

                        if (diffMs > 0) {
                            // Convert to hours and minutes
                            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

                            calculatedTotalTime = `${diffHours}h ${diffMinutes}m`;
                        } else {
                            calculatedTotalTime = 'Invalid';
                        }
                    } catch (error) {
                        console.error('Error calculating time difference:', error);
                        calculatedTotalTime = 'Error';
                    }
                }

                const row = worksheet.addRow({
                    id: record.id || 'N/A',
                    name: record.employeeName || 'N/A',
                    email: record.email || 'N/A',
                    checkIn: checkInValue,
                    checkOut: checkOutValue,
                    totalTimeWorked: calculatedTotalTime,
                    status: record.status || 'N/A'
                });

                // Format time worked column
                if (calculatedTotalTime !== 'N/A' && calculatedTotalTime !== 'Invalid' && calculatedTotalTime !== 'Error') {
                    const timeCell = row.getCell('totalTimeWorked');

                    // Extract hours for conditional formatting
                    const hoursMatch = calculatedTotalTime.match(/(\d+)h/);
                    if (hoursMatch) {
                        const hours = parseInt(hoursMatch[1]);
                        if (hours < 4) {
                            timeCell.font = { color: { argb: 'FFEF4444' } }; // red
                        } else if (hours < 8) {
                            timeCell.font = { color: { argb: 'FFF59E0B' } }; // yellow
                        } else {
                            timeCell.font = { color: { argb: 'FF10B981' } }; // green
                        }
                    }
                }

                // Style for consistent cell appearance
                row.eachCell((cell) => {
                    cell.alignment = { vertical: 'middle' };
                });
            });

            // Add auto filter
            worksheet.autoFilter = {
                from: { row: 1, column: 1 },
                to: { row: worksheet.rowCount, column: worksheet.columns.length }
            };

            // Freeze header row
            worksheet.views = [{
                state: 'frozen',
                ySplit: 1
            }];

            // Generate Excel file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_records_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-indigo-900 via-blue-900 to-gray-900 text-white p-4 md:p-6">
            <div className="w-full max-w-full px-2 md:px-4 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-4 mb-2">
                    <h2 className="text-xl md:text-2xl font-semibold">Today's Present Employees</h2>
                    <button
                        onClick={exportToExcel}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 md:px-4 md:py-2 rounded text-xs md:text-sm font-medium transition-colors flex items-center gap-1"
                        disabled={adminRecords.length === 0}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export to Excel
                    </button>
                </div>
            </div>

            {adminRecords.length === 0 || paginatedRecords.length === 0 ? (
                <div className="text-center text-gray-300 py-4">No employees checked in today.</div>
            ) : (
                <>
                    <div className="flex-1 px-2 md:px-4 lg:px-8 pb-4 md:pb-6">
                        <div className="bg-gradient-to-b from-gray-900 via-blue-900 to-indigo-900 rounded-lg md:rounded-2xl shadow-xl overflow-hidden">
                            <div className="overflow-x-auto w-full">
                                <table className="w-full border-collapse text-white">
                                    <thead className="bg-gray-800">
                                        <tr>
                                            <th className="border border-gray-700 px-2 py-2 text-xs md:text-sm font-medium hidden sm:table-cell">#Id</th>
                                            <th className="border border-gray-700 px-2 py-2 text-xs md:text-sm font-medium">Name</th>
                                            <th className="border border-gray-700 px-2 py-2 text-xs md:text-sm font-medium hidden md:table-cell">Email</th>
                                            <th className="border border-gray-700 px-2 py-2 text-xs md:text-sm font-medium">Check-in</th>
                                            <th className="border border-gray-700 px-2 py-2 text-xs md:text-sm font-medium">Check-out</th>
                                            <th className="border border-gray-700 px-2 py-2 text-xs md:text-sm font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading
                                            ? Array.from({ length: itemsPerPage }).map((_, index) => (
                                                <tr key={index} className="bg-gray-900 bg-opacity-50">
                                                    <td className="border border-gray-700 px-2 py-2 hidden sm:table-cell"><SkeletonLoader /></td>
                                                    <td className="border border-gray-700 px-2 py-2"><SkeletonLoader /></td>
                                                    <td className="border border-gray-700 px-2 py-2 hidden md:table-cell"><SkeletonLoader /></td>
                                                    <td className="border border-gray-700 px-2 py-2"><SkeletonLoader /></td>
                                                    <td className="border border-gray-700 px-2 py-2"><SkeletonLoader /></td>
                                                    <td className="border border-gray-700 px-2 py-2"><SkeletonLoader /></td>
                                                </tr>
                                            ))
                                            : paginatedRecords.map((record, index) => (
                                                <tr key={record.id || `attendance-${index}`} className="bg-gray-900 bg-opacity-50 hover:bg-gray-800 transition-colors">
                                                    <td className="border border-gray-700 px-2 py-2 text-xs md:text-sm hidden sm:table-cell">
                                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                                    </td>
                                                    <td className="border border-gray-700 px-2 py-2 text-xs md:text-sm">{record.employeeName || "N/A"}</td>
                                                    <td className="border border-gray-700 px-2 py-2 text-xs md:text-sm hidden md:table-cell truncate max-w-[120px] lg:max-w-none">
                                                        {record.email || "N/A"}
                                                    </td>
                                                    <td className="border border-gray-700 px-2 py-2 text-xs md:text-sm">
                                                        {record.checkIn || "N/A"}
                                                    </td>
                                                    <td className="border border-gray-700 px-2 py-2 text-xs md:text-sm">
                                                        {record.checkOut || "N/A"}
                                                    </td>
                                                    <td className="border border-gray-700 px-2 py-2 text-xs md:text-sm">
                                                        <div className="flex justify-center">
                                                            <button
                                                                onClick={() => handleClick(record.id)}
                                                                className="bg-green-500 px-2 py-1 rounded hover:bg-green-600 text-xs md:text-sm flex items-center gap-1"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                                View
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* PAGINATION BUTTONS */}
                    <div className="flex justify-center mt-4 gap-1 md:gap-2 pb-4 md:pb-6 flex-wrap">
                        <button
                            onClick={handlePrevPage}
                            className={`px-2 md:px-3 py-1 rounded text-xs md:text-base flex items-center gap-1 ${currentPage === 1 ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                                }`}
                            disabled={currentPage === 1}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Prev
                        </button>

                        {[...Array(Math.ceil(adminRecords.length / itemsPerPage))].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={`px-2 md:px-3 py-1 rounded text-xs md:text-base ${currentPage === i + 1 ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={handleNextPage}
                            className={`px-2 md:px-3 py-1 rounded text-xs md:text-base flex items-center gap-1 ${currentPage === Math.ceil(adminRecords.length / itemsPerPage)
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600"
                                }`}
                            disabled={currentPage === Math.ceil(adminRecords.length / itemsPerPage)}
                        >
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const SkeletonLoader = () => (
    <ContentLoader
        speed={2}
        width="100%"
        height={20}
        viewBox="0 0 100 20"
        backgroundColor="#374151"
        foregroundColor="#4b5563"
    >
        <rect x="0" y="0" rx="3" ry="3" width="100" height="20" />
    </ContentLoader>
);

export default AdminAttendance;