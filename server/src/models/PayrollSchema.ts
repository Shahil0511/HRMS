import mongoose, { Document, Schema } from "mongoose";

export interface IPayroll extends Document {
  employee: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  baseSalary: number;
  deductions: number;
  netSalary: number;
  paymentDate: Date;
  paymentStatus: "Pending" | "Completed";
  createdAt: Date;
  updatedAt: Date;
}

const PayrollSchema: Schema = new Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true, // Index for faster lookup
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    baseSalary: { type: Number, required: true, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    paymentDate: { type: Date, required: true },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/**
 * Virtual field for netSalary (not stored in DB)
 */
PayrollSchema.virtual("netSalary").get(function (this: IPayroll) {
  return this.baseSalary - (this.deductions ?? 0);
});

export const Payroll = mongoose.model<IPayroll>("Payroll", PayrollSchema);
