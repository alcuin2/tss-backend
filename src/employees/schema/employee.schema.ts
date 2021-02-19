import * as mongoose from "mongoose";

export const EmployeeSchema = new mongoose.Schema({
    firstName: String,
    surname: String,
    email: { type: String, unique: true },
    password: { type: String },
    bank: String,
    accountNumber: String,
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    __v: { type: Number, select: false }
})