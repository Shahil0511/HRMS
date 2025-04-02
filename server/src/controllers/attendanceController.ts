import { Request, Response } from "express";
import Attendance from "../models/AttendanceSchema";
import { RequestWithUser } from "../middlewares/verifyToken";
import { User } from "../models/UserSchema";
import moment from "moment-timezone";

// Constants
const TIMEZONE = "Asia/Kolkata";
const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
const TIME_FORMAT = "HH:mm:ss";
const DATE_FORMAT = "YYYY-MM-DD";

// Utility functions
const getCurrentISTTime = () => moment().tz(TIMEZONE).toDate();
const getCurrentISTDay = () => moment().tz(TIMEZONE).startOf("day").toDate();
const getCurrentISTEndDay = () => moment().tz(TIMEZONE).endOf("day").toDate();
const formatDateTime = (date: Date | null) =>
  date ? moment(date).tz(TIMEZONE).format(DATE_TIME_FORMAT) : null;
const formatTime = (date: Date | null) =>
  date ? moment(date).tz(TIMEZONE).format(TIME_FORMAT) : "N/A";

// Error handler
const handleError = (res: Response, error: any, message = "Server Error") => {
  console.error(`Error in attendance controller: ${message}`, error);
  res.status(500).json({
    message,
    error: error instanceof Error ? error.message : String(error),
  });
};

export const checkIn = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { id: employeeId } = req.user!;
    const nowIST = getCurrentISTTime();

    const attendance = new Attendance({
      employeeId,
      date: nowIST,
      checkIn: nowIST,
      status: "Present",
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    handleError(res, error, "Error during check-in");
  }
};

export const checkOut = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { id: employeeId } = req.user!;
    const nowIST = getCurrentISTTime();

    const attendance = await Attendance.findOne({
      employeeId,
      checkOut: null,
    }).sort({ date: -1 });

    if (!attendance) {
      res.status(400).json({ message: "No active check-in found for today." });
      return;
    }

    attendance.checkOut = nowIST;
    await attendance.save();

    res.status(200).json(attendance);
  } catch (error) {
    handleError(res, error, "Error during check-out");
  }
};

export const getEmployeeAttendanceList = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { id: employeeId } = req.user!;

    const attendanceRecords = await Attendance.find({ employeeId })
      .sort({ date: -1 })
      .lean();

    const formattedRecords = attendanceRecords.map((record) => ({
      ...record,
      checkIn: formatDateTime(record.checkIn),
      checkOut: record.checkOut ? formatDateTime(record.checkOut) : null,
    }));

    res.status(200).json(formattedRecords);
  } catch (error) {
    handleError(res, error, "Error fetching employee attendance list");
  }
};

export const getAllAttendanceRecords = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, employeeId, date } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const filter: any = {};
    if (employeeId) filter.employeeId = employeeId;

    if (date) {
      const startOfDayIST = moment(date as string, DATE_FORMAT)
        .tz(TIMEZONE)
        .startOf("day")
        .toDate();
      const endOfDayIST = moment(date as string, DATE_FORMAT)
        .tz(TIMEZONE)
        .endOf("day")
        .toDate();
      filter.date = { $gte: startOfDayIST, $lt: endOfDayIST };
    }

    // Run count and find in parallel for better performance
    const [totalRecords, attendanceRecords] = await Promise.all([
      Attendance.countDocuments(filter),
      Attendance.find(filter)
        .populate("employeeId", "firstName lastName department designation")
        .sort({ date: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
    ]);

    const formattedRecords = attendanceRecords.map((record) => ({
      ...record,
      checkIn: formatDateTime(record.checkIn),
      checkOut: record.checkOut ? formatDateTime(record.checkOut) : null,
    }));

    res.status(200).json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limitNum),
      currentPage: pageNum,
      attendanceRecords: formattedRecords,
    });
  } catch (error) {
    handleError(res, error, "Error fetching all attendance records");
  }
};

export const getTodayPresentEmployees = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const todayIST = getCurrentISTDay();
    const tomorrowIST = getCurrentISTEndDay();

    // Optimize to fetch only required fields
    const attendanceRecords = await Attendance.find(
      { checkIn: { $gte: todayIST, $lt: tomorrowIST }, status: "Present" },
      { employeeId: 1, checkIn: 1, checkOut: 1 }
    ).lean();

    if (!attendanceRecords.length) {
      res.status(200).json([]);
      return;
    }

    const userIds = attendanceRecords.map((record) =>
      record.employeeId.toString()
    );
    const users = await User.find(
      { _id: { $in: userIds } },
      { _id: 1, name: 1, email: 1 }
    ).lean();

    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    const formattedEmployees = attendanceRecords.map((record) => {
      const user = userMap.get(record.employeeId.toString());
      return {
        id: record._id,
        userId: record.employeeId.toString(),
        employeeName: user?.name || "Unknown",
        email: user?.email || "No Email",
        checkIn: formatTime(record.checkIn),
        checkOut: record.checkOut ? formatDateTime(record.checkOut) : null,
      };
    });

    res.status(200).json(formattedEmployees);
  } catch (error) {
    handleError(res, error, "Error fetching today's present employees");
  }
};

export const getTodayPresentTotal = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const todayIST = getCurrentISTDay();
    const tomorrowIST = getCurrentISTEndDay();

    const result = await Attendance.aggregate([
      {
        $match: {
          checkIn: { $gte: todayIST, $lt: tomorrowIST },
          status: "Present",
        },
      },
      {
        $group: {
          _id: "$employeeId",
        },
      },
      {
        $count: "totalPresentToday",
      },
    ]);

    const totalPresentToday =
      result.length > 0 ? result[0].totalPresentToday : 0;
    res.status(200).json({ totalPresentToday });
  } catch (error) {
    handleError(res, error, "Error fetching present employees count");
  }
};

export const getEmployeeAttendanceThisMonth = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { id: employeeId } = req.user!;

    const startOfMonthIST = moment().tz(TIMEZONE).startOf("month").toDate();
    const endOfMonthIST = moment().tz(TIMEZONE).endOf("month").toDate();

    const attendanceRecords = await Attendance.find({
      employeeId,
      date: { $gte: startOfMonthIST, $lte: endOfMonthIST },
    })
      .sort({ date: -1 })
      .lean();

    const formattedRecords = attendanceRecords.map((record) => ({
      ...record,
      checkIn: formatDateTime(record.checkIn),
      checkOut: record.checkOut ? formatDateTime(record.checkOut) : null,
    }));

    res.status(200).json(formattedRecords);
  } catch (error) {
    handleError(
      res,
      error,
      "Error fetching employee attendance for this month"
    );
  }
};

export const getEmployeeAttendancebyID = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Attendance record ID is required" });
      return;
    }

    // Find attendance record by _id
    const attendanceRecord = await Attendance.findById(id);

    if (!attendanceRecord) {
      res.status(404).json({ message: "Attendance record not found" });
      return;
    }

    const empId = attendanceRecord.employeeId;

    // Fetch all attendance records of the employee
    const allAttendanceRecords = await Attendance.find({ employeeId: empId });

    res.status(200).json(allAttendanceRecords);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: "Server Error" });
    }
  }
};
