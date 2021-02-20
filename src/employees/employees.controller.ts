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
        // Check VPN
        const isAllowed = checkVPN(req, res);
        if (isAllowed === true) {
            let email = loginEmployeeDto.email;
            let password = loginEmployeeDto.password;

            this.employeeService.findByEmail(email).then(result => {
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
                })
            }).catch(err => {
                res.status(HttpStatus.NOT_FOUND).send({
                    "error": "record not found"
                })
            })

        }

    }

    @Get()
    findAll(@Res() res: Response, @Req() req: Request, @Headers("token") token) {
        const isAllowed = checkVPN(req, res);
        if (isAllowed === true) {
            const isAdmin = checkAdminToken(token, res);
            if (isAdmin === true) {
                return this.employeeService.findAll().then(result => {
                    return res.status(HttpStatus.OK).send(result);
                })
            }
        }

    }

    @Get(":id")
    findOne(@Param("id") id, @Res() res: Response, @Req() req: Request, @Headers("token") token) {
        const isAllowed = checkVPN(req, res);
        if (isAllowed === true) {
            const isAdmin = checkAdminToken(token, res);
            if (isAdmin === true) {
                this.employeeService.findOne(id).then(result => {
                    res.status(HttpStatus.OK).send(result);
                }).catch(err => {
                    res.status(HttpStatus.NOT_FOUND).send({
                        "error": "id not found"
                    })
                })
            }
        }
    }

    @Post()
    create(@Body() createEmployeeDto: CreateEmployeeDto, @Res() res: Response, @Req() req: Request) {
        const isAllowed = checkVPN(req, res);
        if (isAllowed === true) {
            this.employeeService.create(createEmployeeDto).then(result => {
                res.status(HttpStatus.CREATED).send(result);
            }).catch(err => {
                res.status(HttpStatus.BAD_REQUEST).send(
                    { "error": "some error occurred" }
                )
            })
        }
    }

    @Delete(":id")
    delete(@Param("id") id, @Res() res: Response, @Req() req: Request, @Headers("token") token) {
        const isAllowed = checkVPN(req, res);
        if (isAllowed === true) {
            const isAdmin = checkAdminToken(token, res);
            if (isAdmin === true) {
                this.employeeService.delete(id).then(result => {
                    res.status(HttpStatus.OK).send(result);
                }).catch(err => {
                    res.status(HttpStatus.NOT_FOUND).send({
                        "error": "id not found"
                    })
                })
            }
        }

    }

    @Put(":id")
    update(@Param("id") id, @Body() updateEmployeeDto: CreateEmployeeDto, @Res() res: Response, @Req() req: Request, @Headers("token") token) {
        const isAllowed = checkVPN(req, res);
        if (isAllowed === true) {
            const data = decodeJWT(token, res);
            if (!data) {
                return // stop further execution
            }
            if (data.isAdmin === true) {
                this.employeeService.update(id, updateEmployeeDto).then(result => {
                    res.status(HttpStatus.CREATED).send(result);
                    sendUpdateMail(result.email)
                }).catch(err => {
                    res.status(HttpStatus.NOT_FOUND).send({
                        "error": "id not found"
                    })
                })
            } else {
                this.employeeService.findOne(id).then(result => {
                    if (result.email != data.email) {
                        res.status(HttpStatus.FORBIDDEN).send({
                            "error": "you must be the owner or admin to update"
                        })
                        return
                    }
                    if (result.isActive === false) {
                        res.status(HttpStatus.NOT_FOUND).send({
                            "error": "This account is not active"
                        })
                        return
                    }
                    this.employeeService.update(id, updateEmployeeDto).then(result => {
                        res.status(HttpStatus.CREATED).send(result);
                        sendUpdateMail(result.email)

                    })

                }).catch(err => {
                    res.status(HttpStatus.NOT_FOUND).send({
                        "error": "id not found"
                    })
                })
            }
        }
    }
}
