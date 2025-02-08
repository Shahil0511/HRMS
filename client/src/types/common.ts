import { ReactNode } from "react";

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

export interface Attendance {
  email: string;
  employeeName: ReactNode;
  department: ReactNode;
  status: string;
  id: string;
  date: string;
  checkIn: string[];
  checkOut: string[];
  totalTimeWorked: string;
  isPresent: boolean;
}
