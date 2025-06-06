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

export const updateWeeklyRoster = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { rosterId } = req.params;
    const updateData = req.body;
    const updatedBy = req.user?.id;

    if (!updatedBy) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - User not recognized",
      });
      return;
    }

    // Validate required fields if they exist in updateData
    if (updateData.dailyAssignments) {
      for (const day of updateData.dailyAssignments) {
        if (!day.date || !day.dayName) {
          res.status(400).json({
            success: false,
            message: "Each day assignment must have a date and dayName",
          });
          return;
        }
      }
    }

    const updatedRoster = await Roster.findByIdAndUpdate(
      rosterId,
      {
        ...updateData,
        updatedBy,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedRoster) {
      res.status(404).json({
        success: false,
        message: "Roster not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Weekly roster updated successfully",
      data: updatedRoster,
    });
  } catch (error) {
    console.error("Error updating weekly roster:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update weekly roster",
    });
  }
};

export const updateTimeSlotAssignments = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { rosterId } = req.params;
    const { dayName, timeSlot, assignedEmployees } = req.body;
    const updatedBy = req.user?.id;

    if (!updatedBy) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - User not recognized",
      });
      return;
    }

    if (!dayName || !timeSlot || !assignedEmployees) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: dayName, timeSlot or assignedEmployees",
      });
      return;
    }

    const roster = await Roster.findById(rosterId);
    if (!roster) {
      res.status(404).json({
        success: false,
        message: "Roster not found",
      });
      return;
    }

    // Find the day and time slot to update
    const dayIndex = roster.dailyAssignments.findIndex(
      (day) => day.dayName === dayName
    );
    if (dayIndex === -1) {
      res.status(404).json({
        success: false,
        message: "Day not found in roster",
      });
      return;
    }

    const timeSlotIndex = roster.dailyAssignments[dayIndex].timeSlots.findIndex(
      (slot) => slot.timeSlot === timeSlot
    );
    if (timeSlotIndex === -1) {
      res.status(404).json({
        success: false,
        message: "Time slot not found in the specified day",
      });
      return;
    }

    // Update the assigned employees
    roster.dailyAssignments[dayIndex].timeSlots[
      timeSlotIndex
    ].assignedEmployees = assignedEmployees;
    roster.updatedBy = updatedBy;
    roster.updatedAt = new Date();

    const updatedRoster = await roster.save();

    res.status(200).json({
      success: true,
      message: "Time slot assignments updated successfully",
      data: updatedRoster,
    });
  } catch (error) {
    console.error("Error updating time slot assignments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update time slot assignments",
    });
  }
};

export const deleteWeeklyRoster = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { rosterId } = req.params;
    const deletedBy = req.user?.id;

    if (!deletedBy) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - User not recognized",
      });
      return;
    }

    const deletedRoster = await Roster.findByIdAndDelete(rosterId);

    if (!deletedRoster) {
      res.status(404).json({
        success: false,
        message: "Roster not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Weekly roster deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting weekly roster:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete weekly roster",
    });
  }
};
/**
 * Gets weekly rosters that contain assignments for the current employee
 */
/**
 * Gets weekly rosters that contain assignments for the current employee
 */
export const getEmployeeWeeklyRosters = async (
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

    // Find all rosters within the date range and populate createdBy field
    const rosters = await Roster.find({
      weekStartDate: { $gte: new Date(startDate as string) },
      weekEndDate: { $lte: new Date(endDate as string) },
    }).populate("createdBy", "firstName lastName");

    // DEBUG: Log the rosters to confirm createdBy is populated

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
