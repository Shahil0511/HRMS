// import React from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../store/store";
// import moment from "moment"; // Import moment for date formatting
// import { ClipLoader } from "react-spinners"; // Loading spinner for better UX

// export const AttendanceList: React.FC = () => {
//     // Get the attendance data and loading state from Redux store
//     const { data, loading, error } = useSelector((state: RootState) => state.attendance);

//     console.log("Loading state: ", loading); // Debugging loading state
//     console.log("Error state: ", error); // Debugging error state
//     console.log("Attendance Data: ", data); // Debugging attendance data

//     // Handle loading and empty data states
//     if (loading) {
//         return (
//             <div className="flex justify-center mt-4">
//                 <ClipLoader color={"#36d7b7"} size={50} />
//                 <p className="mt-2">Loading today's attendance...</p>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="mt-4 text-red-500">
//                 <p>Error fetching attendance data: {error}</p>
//             </div>
//         );
//     }

//     if (data.length === 0) {
//         return (
//             <div className="mt-4 text-center">
//                 <p>No attendance records found for today.</p>
//             </div>
//         );
//     }

//     return (
//         <div className="mt-4">
//             <h3 className="text-lg font-semibold mb-4">Attendance Records</h3>
//             <ul className="list-none p-0">
//                 {data.map((entry) => {
//                     console.log("Attendance entry: ", entry); // Debugging each attendance entry
//                     return (
//                         <li
//                             key={entry._id}
//                             className="border-b py-2 flex justify-between items-center"
//                             aria-live="polite"
//                         >
//                             <div>
//                                 <span className="font-semibold">{moment(entry.checkIn).format("YYYY-MM-DD HH:mm:ss")}</span>
//                                 <span className="ml-2 text-sm text-gray-500">
//                                     {entry.checkOut ? moment(entry.checkOut).format("YYYY-MM-DD HH:mm:ss") : "Ongoing"}
//                                 </span>
//                             </div>
//                             <div className="text-sm">
//                                 <span
//                                     className={`px-2 py-1 text-white rounded-full ${entry.checkOut ? "bg-green-500" : "bg-yellow-500"
//                                         }`}
//                                 >
//                                     {entry.checkOut ? "Checked Out" : "Checked In"}
//                                 </span>
//                             </div>
//                         </li>
//                     );
//                 })}
//             </ul>
//         </div>
//     );
// };
