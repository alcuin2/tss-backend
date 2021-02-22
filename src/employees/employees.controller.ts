import { Controller, Get, Post, Put, Delete, Body, Param, Req, Res, HttpStatus, Headers } from '@nestjs/common';
import { CreateEmployeeDto } from "./dto/create-employee.dto"
import { LoginEmployeeDto } from "./dto/login.dto";
import { EmployeesService } from "./employees.service";
import { decodeJWT, signJWT, checkAdminToken } from "./utils/jwt.utils";
import { checkVPN } from "./utils/vpn.utils";
import { sendUpdateMail } from "./utils/email.utils";

import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';


@Controller('employees')
export class EmployeesController {

    constructor(private readonly employeeService: EmployeesService) { }

    @Post("/login")
    login(@Body() loginEmployeeDto: LoginEmployeeDto, @Res() res: Response, @Req() req: Request) {
        let email = loginEmployeeDto.email;
        let password = loginEmployeeDto.password;

        this.employeeService.findByEmail(email).then(result => {
            const isAllowed = checkVPN(req, result.ipWhitelist);
            if (isAllowed === false) {
                res.status(HttpStatus.BAD_REQUEST).send({
                    "error": "Your source IP address is not whitelisted, request blocked"
                })
                return;
            }
            if (result.isActive === false) {
                res.status(HttpStatus.NOT_FOUND).send({
                    "error": "This account is not active"
                })
                return
            }
            // authenticate password and return JWT, expires after 24 hours
            bcrypt.compare(password, result.password).then(employee => {
                const token = signJWT(result);
                res.status(HttpStatus.OK).send({
                    "data": result,
                    "token": token
                })
            }).catch(err => {
                res.status(HttpStatus.BAD_REQUEST).send({
                    "error": "invalid credentials"
                })
                return;
            })
        }).catch(err => {
            res.status(HttpStatus.NOT_FOUND).send({
                "error": "record not found"
            })
        })

    }

    @Get()
    findAll(@Res() res: Response, @Req() req: Request, @Headers("token") token) {
        let decodedToken = decodeJWT(token, res);
        this.employeeService.findByEmail(decodedToken.email).then((admin) => {
            const isAllowed = checkVPN(req, admin.ipWhitelist);
            if (isAllowed === false) {
                res.status(HttpStatus.BAD_REQUEST).send({
                    "error": "Your source IP address is not whitelisted, request blocked"
                })
                return
            }
            if (admin.isAdmin === false) {
                res.status(HttpStatus.BAD_REQUEST).send({
                    "error": "admins only"
                })
                return
            }
            this.employeeService.findAll().then(result => {
                res.status(HttpStatus.OK).send(result);
            }).catch(err => {
                res.status(HttpStatus.NOT_FOUND).send({
                    "error": "id not found"
                })
            })
        })
    }

    @Get(":id")
    findOne(@Param("id") id, @Res() res: Response, @Req() req: Request, @Headers("token") token) {
        let decodedToken = decodeJWT(token, res);
        this.employeeService.findByEmail(decodedToken.email).then((admin) => {
            const isAllowed = checkVPN(req, admin.ipWhitelist);
            if (isAllowed === false) {
                res.status(HttpStatus.BAD_REQUEST).send({
                    "error": "Your source IP address is not whitelisted, request blocked"
                })
                return
            }
            if (admin.isAdmin === false) {
                res.status(HttpStatus.BAD_REQUEST).send({
                    "error": "admins only"
                })
                return
            }
            if (admin.isActive === false) {
                res.status(HttpStatus.NOT_FOUND).send({
                    "error": "This account is not active"
                })
                return
            }
            this.employeeService.findOne(id).then(result => {
                res.status(HttpStatus.OK).send(result);
            }).catch(err => {
                res.status(HttpStatus.NOT_FOUND).send({
                    "error": "id not found"
                })
            })
        })

    }

    @Post()
    create(@Body() createEmployeeDto: CreateEmployeeDto, @Res() res: Response, @Req() req: Request) {
        if (createEmployeeDto.ipWhitelist === undefined) {
            res.status(HttpStatus.BAD_REQUEST).send(
                { "error": "ipWhitelist array must be included" }
            )
            return
        }
        if (createEmployeeDto.ipWhitelist.length === 0) {
            res.status(HttpStatus.BAD_REQUEST).send(
                { "error": "must include at least one ip address in ipWhiteList" }
            )
            return
        }
        createEmployeeDto.ipWhitelist.forEach((ip) => {
            if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) {
                // do nothing
            }
            else {
                res.status(HttpStatus.BAD_REQUEST).send(
                    { "error": `"${ip}" is not a valid ip address ` }
                )
                return

            }
        })
        this.employeeService.create(createEmployeeDto).then(result => {
            res.status(HttpStatus.CREATED).send(result);
        }).catch(err => {
            res.status(HttpStatus.BAD_REQUEST).send(
                { "error": "Error occurred, email already exists." }
            )
        })

    }

    @Delete(":id")
    delete(@Param("id") id, @Res() res: Response, @Req() req: Request, @Headers("token") token) {
        let decodedToken = decodeJWT(token, res);
        this.employeeService.findByEmail(decodedToken.email).then((admin) => {
            const isAllowed = checkVPN(req, admin.ipWhitelist);
            if (isAllowed === false) {
                res.status(HttpStatus.BAD_REQUEST).send({
                    "error": "Your source IP address is not whitelisted, request blocked"
                })
                return
            }
            if (admin.isAdmin === false) {
                res.status(HttpStatus.BAD_REQUEST).send({
                    "error": "admins only"
                })
                return
            }
            if (admin.isActive === false) {
                res.status(HttpStatus.NOT_FOUND).send({
                    "error": "This account is not active"
                })
                return
            }
            this.employeeService.delete(id).then(result => {
                res.status(HttpStatus.OK).send(result);
            }).catch(err => {
                res.status(HttpStatus.NOT_FOUND).send({
                    "error": "id not found"
                })
            })
        })

    }

    @Put(":id")
    update(@Param("id") id, @Body() updateEmployeeDto: CreateEmployeeDto, @Res() res: Response, @Req() req: Request, @Headers("token") token) {
        let decodedToken = decodeJWT(token, res);
        this.employeeService.findByEmail(decodedToken.email).then((caller) => {
            console.log(caller);
            const isAllowed = checkVPN(req, caller.ipWhitelist);
            if (isAllowed === false) {
                res.status(HttpStatus.BAD_REQUEST).send({
                    "error": "Your source IP address is not whitelisted, request blocked"
                })
                return
            }
            if (caller.isActive == false) {
                res.status(HttpStatus.NOT_FOUND).send({
                    "error": "This account is not active"
                })
                return
            }
            if (caller.isAdmin === true || caller._id == id) {
                this.employeeService.update(id, updateEmployeeDto).then(result => {
                    res.status(HttpStatus.OK).send(result);
                    sendUpdateMail(result.email);
                }).catch(err => {
                    res.status(HttpStatus.NOT_FOUND).send({
                        "error": "id not found"
                    })
                })
            } else {
                res.status(HttpStatus.FORBIDDEN).send({
                    "error": "you must be the owner or admin to update"
                })
            }

        })
    }
}
