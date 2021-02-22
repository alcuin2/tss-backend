import { Injectable } from '@nestjs/common';
import { Employee } from "./interfaces/employee.interface";
import { Model, Document } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {

    constructor(@InjectModel("Employee") private readonly employeeModel: Model<Employee & Document>) { }

    async findAll(): Promise<Employee[]> {
        return await this.employeeModel.find();
    }

    async findOne(id: string): Promise<Employee> {
        return await this.employeeModel.findOne({ _id: id })
    }

    async create(employee: Employee): Promise<Employee> {
        const salt = await bcrypt.genSalt();
        employee.password = await bcrypt.hash(employee.password, salt); // hash password
        const newEmployee = new this.employeeModel(employee);
        return await newEmployee.save();
    }

    async delete(id: string): Promise<Employee> {
        return await this.employeeModel.findByIdAndRemove(id);
    }

    async update(id: string, employee: Employee): Promise<Employee> {
        if (employee.password !== undefined) { // check if password is part of the update
            const salt = await bcrypt.genSalt();
            employee.password = await bcrypt.hash(employee.password, salt);
        }
        return await this.employeeModel.findByIdAndUpdate(id, employee);
    }

    async findByEmail(email: string): Promise<Employee> {
        return await this.employeeModel.findOne({ email: email });
    }
}
