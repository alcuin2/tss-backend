import { Controller, Get, Post, Put, Delete, Body, Param, Req, Res, HttpStatus, Headers } from '@nestjs/common';
import { CreateEmployeeDto } from "./dto/create-employee.dto"
import { LoginEmployeeDto } from "./dto/login.dto";
import { EmployeesService } from "./employees.service";
import { decodeJWT, signJWT, checkAdminToken } from "./utils/jwt.utils";
import { checkVPN } from "./utils/vpn.utils";
import { sendUpdateMail } from "./utils/email.utils";

import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as net from "net";


@Controller('employees')
export class EmployeesController {

    constructor(private readonly employeeService: EmployeesService) { }

    @Post("/login")
    async login(@Body() loginEmployeeDto: LoginEmployeeDto, @Res({ passthrough: true }) res: Response, @Req() req: Request) {
        let email = loginEmployeeDto.email;
        let password = loginEmployeeDto.password;

        const result = await this.employeeService.findByEmail(email);
        if (result === null) {
            res.status(HttpStatus.NOT_FOUND)
            return {
                "error": "We cannot find this email in our records"
            }
        }
        const isAllowed = checkVPN(req, result.ipWhitelist);
        if (isAllowed === false) {
            res.status(HttpStatus.BAD_REQUEST);
            return { "error": "Your source IP address is not whitelisted, request blocked" }
        }
        if (result.isActive === false) {
            res.status(HttpStatus.NOT_FOUND)
            return {
                "error": "This account is not active"
            }
        }
        // authenticate password and return JWT, expires after 24 hours
        const hashed = await bcrypt.compare(password, result.password)
        if (hashed === true) {
            const token = signJWT(result);
            res.status(HttpStatus.OK)
            return {
                "data": result,
                "token": token
            }
        } else {
            res.status(HttpStatus.BAD_REQUEST);
            return {
                "error": "invalid credentials"
            }
        }

    }

    @Get()
    async findAll(@Res({ passthrough: true }) res: Response, @Req() req: Request, @Headers("token") token) {
        let decodedToken = decodeJWT(token, res);
        const admin = await this.employeeService.findByEmail(decodedToken.email);
        if (admin == null) {
            res.status(HttpStatus.NOT_FOUND);
            return { "error": "admin account not found" }
        }
        const isAllowed = checkVPN(req, admin.ipWhitelist);
        if (isAllowed === false) {
            res.status(HttpStatus.BAD_REQUEST)
            return {
                "error": "Your source IP address is not whitelisted, request blocked"
            }
        }
        if (admin.isAdmin === false) {
            res.status(HttpStatus.BAD_REQUEST)
            return {
                "error": "admins only"
            }
        }

        const result = await this.employeeService.findAll();
        res.status(HttpStatus.OK)
        return result;

    }

    @Get(":id")
    async findOne(@Param("id") id, @Res({ passthrough: true }) res: Response, @Req() req: Request, @Headers("token") token) {
        let decodedToken = decodeJWT(token, res);
        const admin = await this.employeeService.findByEmail(decodedToken.email);
        if (admin == null) {
            res.status(HttpStatus.NOT_FOUND);
            return { "error": "admin account not found" }
        }
        const isAllowed = checkVPN(req, admin.ipWhitelist);
        if (isAllowed === false) {
            res.status(HttpStatus.BAD_REQUEST)
            return {
                "error": "Your source IP address is not whitelisted, request blocked"
            }
        }
        if (admin.isAdmin === false) {
            res.status(HttpStatus.BAD_REQUEST)
            return {
                "error": "admins only"
            }
        }
        const result = await this.employeeService.findOne(id);
        if (result === null) {
            res.status(HttpStatus.NOT_FOUND);
            return { "error": "id not found" }
        }
        else {
            res.status(HttpStatus.OK)
            return result;
        }
    }

    @Post()
    async create(@Body() createEmployeeDto: CreateEmployeeDto, @Res({ passthrough: true }) res: Response, @Req() req: Request) {
        if (createEmployeeDto.ipWhitelist === undefined) {
            res.status(HttpStatus.BAD_REQUEST)
            return { "error": "ipWhitelist array must be included" }
        }
        if (createEmployeeDto.ipWhitelist.length === 0) {
            res.status(HttpStatus.BAD_REQUEST)
            return { "error": "must include at least one ip address in ipWhiteList" }

        }
        let testIP: boolean;
        let lastIP: string;
        for (let i = 0; i < createEmployeeDto.ipWhitelist.length; i++) {
            let ip = createEmployeeDto.ipWhitelist[i]
            lastIP = ip;
            if (net.isIP(ip) === 4 || net.isIP(ip) === 6) {
                testIP = true
            }
            else {
                testIP = false
                break
            }
        }

        if (testIP === false) {
            res.status(HttpStatus.BAD_REQUEST)
            return { "error": `"${lastIP}" is not a valid ip address` }
        }
        try {
            const result = await this.employeeService.create(createEmployeeDto);
            res.status(HttpStatus.CREATED)
            return result

        } catch {
            res.status(HttpStatus.BAD_REQUEST);
            return { "error": "Error occurred, email already exists." }
        }
    }

    @Delete(":id")
    async delete(@Param("id") id, @Res({ passthrough: true }) res: Response, @Req() req: Request, @Headers("token") token) {
        let decodedToken = decodeJWT(token, res);
        const admin = await this.employeeService.findByEmail(decodedToken.email);
        if (admin == null) {
            res.status(HttpStatus.NOT_FOUND);
            return { "error": "admin account not found" }
        }
        const isAllowed = checkVPN(req, admin.ipWhitelist);
        if (isAllowed === false) {
            res.status(HttpStatus.BAD_REQUEST)
            return {
                "error": "Your source IP address is not whitelisted, request blocked"
            }
        }
        if (admin.isAdmin === false) {
            res.status(HttpStatus.BAD_REQUEST)
            return {
                "error": "admins only"
            }
        }
        const result = await this.employeeService.delete(id);
        res.status(HttpStatus.OK)
        return result;
    }

    @Put(":id")
    async update(@Param("id") id, @Body() updateEmployeeDto: CreateEmployeeDto, @Res({ passthrough: true }) res: Response, @Req() req: Request, @Headers("token") token) {
        let decodedToken = decodeJWT(token, res);
        const caller = await this.employeeService.findByEmail(decodedToken.email)
        if (caller == null) {
            res.status(HttpStatus.NOT_FOUND);
            return { "error": "caller account not found" }
        }
        const isAllowed = checkVPN(req, caller.ipWhitelist);
        if (isAllowed === false) {
            res.status(HttpStatus.BAD_REQUEST)
            return { "error": "Your source IP address is not whitelisted, request blocked" }
        }
        if (caller.isActive == false) {
            res.status(HttpStatus.NOT_FOUND)
            return { "error": "This account is not active" }
        }
        if (caller.isAdmin === true || caller._id == id) {
            const result = await this.employeeService.update(id, updateEmployeeDto)
            if (result == null) {
                res.status(HttpStatus.NOT_FOUND)
                return { "error": "id not found" }
            } else {
                res.status(HttpStatus.OK)
                sendUpdateMail(result.email); // email alerts
                return result
            }
        } else {
            res.status(HttpStatus.FORBIDDEN)
            return { "error": "you must be the owner or admin to update" }
        }
    }

}
