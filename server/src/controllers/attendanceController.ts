import { Request, Response } from "express";
import Attendance from "../models/AttendanceSchema";
import { RequestWithUser } from "../middlewares/verifyToken";
import { User } from "../models/UserSchema"; // Assuming you are importing User model
import moment from "moment-timezone";

export const checkIn = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { id: employeeId } = req.user!;
    const nowIST = moment().tz("Asia/Kolkata").toDate(); // Convert to IST
    // const date = new Date().toISOString().split("T")[0];

    // Create a new attendance record for check-in
    const attendance = new Attendance({
      employeeId,
      // date: new Date(),
      date: nowIST,

      checkIn: nowIST,
      // checkIn: new Date(),
      status: "Present",
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const checkOut = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { id: employeeId } = req.user!;
    // const date = new Date().toISOString().split("T")[0];

    const nowIST = moment().tz("Asia/Kolkata").toDate(); // Convert to IST

    const dateIST = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

    // Find the last check-in for the employee that hasn't been checked out
    const attendance = await Attendance.findOne({
      employeeId,
      checkOut: null, // Find the last check-in that is still open
    }).sort({ date: -1 }); // Sort by latest check-in

    if (!attendance) {
      res.status(400).json({ message: "No active check-in found for today." });
      return;
    }

    // attendance.checkOut = new Date();
    attendance.checkOut = nowIST;
    await attendance.save();

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getEmployeeAttendanceList = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { id: employeeId } = req.user!;

    // const attendanceRecords = await Attendance.find({ employeeId }).sort({
    //   date: -1,
    // });

    const attendanceRecords = await Attendance.find({ employeeId })
      .sort({ date: -1 })
      .lean();
    // Convert stored UTC timestamps to IST
    const formattedRecords = attendanceRecords.map((record) => ({
      ...record,
      checkIn: record.checkIn
        ? moment(record.checkIn)
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DD HH:mm:ss")
        : null,
      checkOut: record.checkOut
        ? moment(record.checkOut)
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DD HH:mm:ss")
        : null,
    }));
    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllAttendanceRecords = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, employeeId, date } = req.query;

    const filter: any = {};
    if (employeeId) filter.employeeId = employeeId;
    // if (date) filter.date = new Date(date as string);
    if (date) {
      // Convert input date to an IST Date object for filtering
      const startOfDayIST = moment(date as string, "YYYY-MM-DD")
        .tz("Asia/Kolkata")
        .startOf("day")
        .toDate();
      const endOfDayIST = moment(date as string, "YYYY-MM-DD")
        .tz("Asia/Kolkata")
        .endOf("day")
        .toDate();
      filter.date = { $gte: startOfDayIST, $lt: endOfDayIST };
    }
    // Get total record count before applying pagination
    const totalRecords = await Attendance.countDocuments(filter);

    // Fetch filtered attendance records with pagination
    const attendanceRecords = await Attendance.find(filter)
      .populate("employeeId", "firstName lastName department designation") // Fetch employee details
      .sort({ date: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .lean();

    // Convert stored UTC timestamps to IST
    const formattedRecords = attendanceRecords.map((record) => ({
      ...record,
      checkIn: record.checkIn
        ? moment(record.checkIn)
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DD HH:mm:ss")
        : null,
      checkOut: record.checkOut
        ? moment(record.checkOut)
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DD HH:mm:ss")
        : null,
    }));

    res.status(200).json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / +limit),
      currentPage: +page,
      attendanceRecords,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getTodayPresentEmployees = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const todayIST = moment().tz("Asia/Kolkata").startOf("day").toDate();
    const tomorrowIST = moment().tz("Asia/Kolkata").endOf("day").toDate();

    // Fetch today's attendance records in IST
    const attendanceRecords = await Attendance.find(
      { checkIn: { $gte: todayIST, $lt: tomorrowIST }, status: "Present" },
      { employeeId: 1, checkIn: 1, checkOut: 1 }
    ).lean();

    if (!attendanceRecords.length) {
      res.status(200).json([]);
      return;
    }

    // Extract unique User IDs
    const userIds = attendanceRecords.map((record) =>
      record.employeeId.toString()
    );

    // Fetch user details
    const users = await User.find(
      { _id: { $in: userIds } },
      { _id: 1, name: 1, email: 1 }
    ).lean();

    // Create a lookup map for user details
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    // Format the response data
    const formattedEmployees = attendanceRecords.map((record) => {
      const user = userMap.get(record.employeeId.toString());

      return {
        id: record._id,
        userId: record.employeeId.toString(),
        employeeName: user ? user.name : "Unknown",
        email: user ? user.email : "No Email",
        checkIn: record.checkIn
          ? moment(record.checkIn).tz("Asia/Kolkata").format("HH:mm:ss")
          : "N/A",
        checkOut: record.checkOut
          ? moment(record.checkOut).tz("Asia/Kolkata").format("HH:mm:ss")
          : "N/A",
      };
    });

    res.status(200).json(formattedEmployees);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error", error: (error as Error).message });
  }
};

export const getTodayPresentTotal = async (req: Request, res: Response) => {
  try {
    const todayIST = moment().tz("Asia/Kolkata").startOf("day").toDate();
    const tomorrowIST = moment().tz("Asia/Kolkata").endOf("day").toDate();

    // Aggregate to find unique employees who checked in today
    const result = await Attendance.aggregate([
      {
        $match: {
          checkIn: { $gte: todayIST, $lt: tomorrowIST },
          status: "Present", // Ensure the status is "Present"
        },
      },
      {
        $group: {
          _id: "$employeeId", // Group by employeeId (to ensure each employee is counted only once)
        },
      },
      {
        $count: "totalPresentToday", // Count the number of unique employeeIds
      },
    ]);

    // If the result is empty, return totalPresentToday as 0
    const totalPresentToday =
      result.length > 0 ? result[0].totalPresentToday : 0;

    res.json({ totalPresentToday });
  } catch (error: any) {
    res.status(500).json({
      message: "Error in Fetching Present Employees",
      error: error.message,
    });
  }
};

export const getEmployeeAttendanceThisMonth = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { id: employeeId } = req.user!;

    // Get the start and end of the current month in IST
    const startOfMonthIST = moment()
      .tz("Asia/Kolkata")
      .startOf("month")
      .toDate();
    const endOfMonthIST = moment().tz("Asia/Kolkata").endOf("month").toDate();

    // Fetch the attendance records for the employee for this month
    const attendanceRecords = await Attendance.find({
      employeeId,
      date: { $gte: startOfMonthIST, $lte: endOfMonthIST },
    })
      .sort({ date: -1 }) // Sort by the latest date first
      .lean();

    // Format check-in and check-out times to IST
    const formattedRecords = attendanceRecords.map((record) => ({
      ...record,
      checkIn: record.checkIn
        ? moment(record.checkIn)
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DD HH:mm:ss")
        : null,
      checkOut: record.checkOut
        ? moment(record.checkOut)
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DD HH:mm:ss")
        : null,
    }));

    res.status(200).json(formattedRecords);
  } catch (error) {
    console.error("Error fetching employee attendance for this month:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
