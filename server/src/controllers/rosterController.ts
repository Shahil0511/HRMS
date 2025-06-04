import { Response } from "express";
import { Roster } from "../models/RosterSchema";
import { RequestWithUser } from "../middlewares/verifyToken";

export const createWeeklyRoster = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const {
      department,
      weekStartDate,
      weekEndDate,
      weekNumber,
      year,
      dailyAssignments,
    } = req.body;

    // Validate required fields
    if (
      !department ||
      !weekStartDate ||
      !weekEndDate ||
      !weekNumber ||
      !year ||
      !dailyAssignments
    ) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: department, week dates, or assignments",
      });
      return;
    }

    const createdBy = req.user?.id;
    if (!createdBy) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - User not recognized",
      });
      return;
    }

    // Process each daily assignment
    const processedAssignments = dailyAssignments.map((day: any) => {
      return {
        date: new Date(day.date),
        dayName: day.dayName,
        timeSlots: day.timeSlots.map((slot: any) => ({
          timeSlot: slot.timeSlot,
          shiftStart: slot.shiftStart,
          shiftEnd: slot.shiftEnd,
          assignedEmployees: slot.assignedEmployees.map((emp: any) => ({
            employee: emp.employee,
            department: emp.department,
            createdBy,
            updatedBy: createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        })),
      };
    });

    const weeklyRoster = new Roster({
      department,
      weekStartDate: new Date(weekStartDate),
      weekEndDate: new Date(weekEndDate),
      weekNumber,
      year,
      dailyAssignments: processedAssignments,
      createdBy,
      updatedBy: createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedRoster = await weeklyRoster.save();

    res.status(201).json({
      success: true,
      message: "Weekly roster created successfully",
      data: savedRoster,
    });
  } catch (error) {
    console.error("Error creating weekly roster:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create weekly roster",
    });
  }
};

export const getWeeklyRosters = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: "Missing startDate or endDate parameters",
      });
      return;
    }

    const rosters = await Roster.find({
      weekStartDate: { $gte: new Date(startDate as string) },
      weekEndDate: { $lte: new Date(endDate as string) },
    }).populate("createdBy", "firstName lastName");

    res.status(200).json({
      success: true,
      data: rosters,
    });
  } catch (error) {
    console.error("Error fetching weekly rosters:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch weekly rosters",
    });
  }
};
