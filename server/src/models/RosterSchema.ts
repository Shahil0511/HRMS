import mongoose, { Schema, Document } from "mongoose";

interface IAssignedEmployee {
  employee: mongoose.Types.ObjectId;
  department: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IDailyTimeSlot {
  timeSlot: string; // e.g. "08-17"
  shiftStart: string; // HH:mm
  shiftEnd: string; // HH:mm
  assignedEmployees: IAssignedEmployee[];
}

interface IDailyAssignment {
  date: Date;
  dayName: string;
  timeSlots: IDailyTimeSlot[];
}

export interface IWeeklyRoster extends Document {
  department: string;
  weekStartDate: Date;
  weekEndDate: Date;
  weekNumber: number;
  year: number;
  dailyAssignments: IDailyAssignment[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssignedEmployeeSchema = new Schema<IAssignedEmployee>(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    department: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const DailyTimeSlotSchema = new Schema<IDailyTimeSlot>(
  {
    timeSlot: { type: String, required: true },
    shiftStart: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    shiftEnd: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    assignedEmployees: { type: [AssignedEmployeeSchema], default: [] },
  },
  { _id: false }
);

const DailyAssignmentSchema = new Schema<IDailyAssignment>(
  {
    date: { type: Date, required: true },
    dayName: { type: String, required: true },
    timeSlots: { type: [DailyTimeSlotSchema], default: [] },
  },
  { _id: false }
);

const WeeklyRosterSchema = new Schema<IWeeklyRoster>({
  department: { type: String, required: true, index: true },
  weekStartDate: { type: Date, required: true, index: true },
  weekEndDate: { type: Date, required: true, index: true },
  weekNumber: { type: Number, required: true },
  year: { type: Number, required: true },
  dailyAssignments: { type: [DailyAssignmentSchema], default: [] },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Roster = mongoose.model<IWeeklyRoster>(
  "WeeklyRoster",
  WeeklyRosterSchema
);
