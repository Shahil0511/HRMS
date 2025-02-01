import axios from "axios";

const API_URL = "http://localhost:8000/api/attendance"; // Replace with your actual API URL

export const fetchTodayAttendance = async (employeeId: string) => {
    const response = await axios.get(`${API_URL}/${employeeId}/today`);
    return response.data; // Expect { status: string, checkInTime: string, checkOutTime: string, message: string }
};

export const markAttendance = async (
    employeeId: string,
    checkIn: string,
    checkOut: string
) => {
    const response = await axios.post(`${API_URL}`, { employeeId, checkIn, checkOut });
    return response.data; // Expect { status: string, checkIn: string, checkOut: string, message: string }
};
