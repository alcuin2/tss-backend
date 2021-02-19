import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { EmployeeSchema } from "./schema/employee.schema";


@Module({
    imports: [MongooseModule.forFeature([{ name: "Employee", schema: EmployeeSchema }])],
    controllers: [EmployeesController],
    providers: [EmployeesService],
})
export class EmployeesModule { }
