export interface User {
  _id: string;
  employeeId: string;
  id: string;
  name: string;
  email: string;
}

export interface AuthPayload {
  token: string;
  user: User;
  role: string;
}

export interface IAttendance {
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: "Present" | "Absent";
  duration?: number;
}
