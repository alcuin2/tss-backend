import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { Employee } from "./interfaces/employee.interface";
import { EmployeesService } from "./employees.service";
import { EmployeesModule } from "./employees.module";
import { decodeJWT, signJWT, checkAdminToken } from "./utils/jwt.utils";
import { checkVPN } from "./utils/vpn.utils";
import { MongooseModule } from '@nestjs/mongoose';
import { CreateEmployeeDto } from "./dto/create-employee.dto"
import { LoginEmployeeDto } from "./dto/login.dto";

import config from "../config/keys";
import * as httpMocks from 'node-mocks-http';
import * as bcrypt from 'bcrypt';


describe('EmployeesController', () => {
  let controller: EmployeesController;
  let service: EmployeesService;
  let checkVPNMock: jest.Mock;
  let decodeJWTMock: jest.Mock;
  let signJWTMock: jest.Mock;
  let bcryptCompareMock: jest.Mock;

  beforeEach(async () => {

    jest.setTimeout(100000);

    const module: TestingModule = await Test.createTestingModule({
      imports: [EmployeesModule, MongooseModule.forRoot(config.mongoURI)],
    }).compile();

    controller = module.get(EmployeesController);
    service = module.get(EmployeesService);

  });

  describe('findAll', () => {
    it('should return an array of employees', async () => {

      checkVPNMock = jest.fn().mockReturnValue(true);
      (checkVPN as jest.Mock) = checkVPNMock;
      decodeJWTMock = jest.fn().mockReturnValue({ email: "email@email.com" });
      (decodeJWT as jest.Mock) = decodeJWTMock;

      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      const result = [{
        "isAdmin": true,
        "isActive": true,
        "_id": "602f986788d56ac35a166363",
        "email": "mail2oke6@gmail.com",
        "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
        "firstName": "Oke",
        "surname": "Agi-Tuedor",
        "bank": "UBA",
        "ipWhitelist": [],
        "accountNumber": "2155215445"
      }]

      jest.spyOn(service, 'findAll').mockImplementation(() => new Promise<Employee[]>((resolve, reject) => {
        resolve([
          {
            "isAdmin": true,
            "isActive": true,
            "_id": "602f986788d56ac35a166363",
            "email": "mail2oke6@gmail.com",
            "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "ipWhitelist": [],
            "bank": "UBA",
            "accountNumber": "2155215445"
          }])
      }));
      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "isAdmin": true,
            "isActive": true,
            "_id": "602f986788d56ac35a166363",
            "email": "mail2oke6@gmail.com",
            "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "ipWhitelist": [],
            "bank": "UBA",
            "accountNumber": "2155215445"
          })
      }));

      expect(await controller.findAll(req.res, req, "")).toEqual(result);
    });
    it("should not fetch all, admin account not found", async () => {
      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(null)
      }));
      const result = { "error": "admin account not found" };
      decodeJWTMock = jest.fn().mockReturnValue({ email: "email@email.com" });
      (decodeJWT as jest.Mock) = decodeJWTMock;

      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      expect(await controller.findAll(req.res, req, "")).toEqual(result);
    })

    it("should not fetch all, ip whitelisting", async () => {

      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()
      checkVPNMock = jest.fn().mockReturnValue(false);
      (checkVPN as jest.Mock) = checkVPNMock;
      decodeJWTMock = jest.fn().mockReturnValue({ email: "email@email.com" });
      (decodeJWT as jest.Mock) = decodeJWTMock;

      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "isAdmin": true,
            "isActive": true,
            "_id": "602f986788d56ac35a166363",
            "email": "mail2oke6@gmail.com",
            "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "ipWhitelist": [],
            "bank": "UBA",
            "accountNumber": "2155215445"
          })
      }));


      const result = { "error": "Your source IP address is not whitelisted, request blocked" }
      expect(await controller.findAll(req.res, req, "")).toEqual(result);
    })

    it("should not return all, caller not admin", async () => {

      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()
      checkVPNMock = jest.fn().mockReturnValue(true);
      (checkVPN as jest.Mock) = checkVPNMock;
      decodeJWTMock = jest.fn().mockReturnValue({ email: "email@email.com" });
      (decodeJWT as jest.Mock) = decodeJWTMock;

      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "isAdmin": false,
            "isActive": true,
            "_id": "602f986788d56ac35a166363",
            "email": "mail2oke6@gmail.com",
            "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "ipWhitelist": [],
            "bank": "UBA",
            "accountNumber": "2155215445"
          })
      }));

      const result = {
        "error": "admins only"
      }
      expect(await controller.findAll(req.res, req, "")).toEqual(result);
    })
  });

  describe("findOne", () => {
    it('should return a single employee', async () => {

      checkVPNMock = jest.fn().mockReturnValue(true);
      (checkVPN as jest.Mock) = checkVPNMock;
      decodeJWTMock = jest.fn().mockReturnValue({ email: "email@email.com" });
      (decodeJWT as jest.Mock) = decodeJWTMock;

      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      const result = {
        "isAdmin": true,
        "isActive": true,
        "_id": "602f986788d56ac35a166363",
        "email": "mail2oke6@gmail.com",
        "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
        "firstName": "Oke",
        "surname": "Agi-Tuedor",
        "bank": "UBA",
        "ipWhitelist": [],
        "accountNumber": "2155215445"
      }

      jest.spyOn(service, 'findOne').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "isAdmin": true,
            "isActive": true,
            "_id": "602f986788d56ac35a166363",
            "email": "mail2oke6@gmail.com",
            "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "ipWhitelist": [],
            "bank": "UBA",
            "accountNumber": "2155215445"
          })
      }));

      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "isAdmin": true,
            "isActive": true,
            "_id": "602f986788d56ac35a166363",
            "email": "mail2oke6@gmail.com",
            "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "ipWhitelist": [],
            "bank": "UBA",
            "accountNumber": "2155215445"
          })
      }));

      expect(await controller.findOne("test_id", req.res, req, "")).toEqual(result);

    })
    it("should not return employee, admin account not valid", async () => {
      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(null)
      }));
      const result = { "error": "admin account not found" };
      decodeJWTMock = jest.fn().mockReturnValue({ email: "email@email.com" });
      (decodeJWT as jest.Mock) = decodeJWTMock;

      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      expect(await controller.findOne("test_id", req.res, req, "")).toEqual(result);

    })

    it("should not return employee, admin ip not whitelisted", async () => {
      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "isAdmin": true,
            "isActive": true,
            "_id": "602f986788d56ac35a166363",
            "email": "mail2oke6@gmail.com",
            "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "ipWhitelist": [],
            "bank": "UBA",
            "accountNumber": "2155215445"
          })
      }));
      decodeJWTMock = jest.fn().mockReturnValue({ email: "email@email.com" });
      (decodeJWT as jest.Mock) = decodeJWTMock;
      checkVPNMock = jest.fn().mockReturnValue(false);
      (checkVPN as jest.Mock) = checkVPNMock;

      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      const result = {
        "error": "Your source IP address is not whitelisted, request blocked"
      }

      expect(await controller.findOne("test_id", req.res, req, "")).toEqual(result);

    })

    it("should not return employee, caller not admin", async () => {
      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "isAdmin": false,
            "isActive": true,
            "_id": "602f986788d56ac35a166363",
            "email": "mail2oke6@gmail.com",
            "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "ipWhitelist": [],
            "bank": "UBA",
            "accountNumber": "2155215445"
          })
      }));

      decodeJWTMock = jest.fn().mockReturnValue({ email: "email@email.com" });
      (decodeJWT as jest.Mock) = decodeJWTMock;
      checkVPNMock = jest.fn().mockReturnValue(true);
      (checkVPN as jest.Mock) = checkVPNMock;

      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      const result = {
        "error": "admins only"
      }

      expect(await controller.findOne("test_id", req.res, req, "")).toEqual(result);

    })

    it("should not find employee, id not found", async () => {
      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "isAdmin": true,
            "isActive": true,
            "_id": "602f986788d56ac35a166363",
            "email": "mail2oke6@gmail.com",
            "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "ipWhitelist": [],
            "bank": "UBA",
            "accountNumber": "2155215445"
          })
      }));
      decodeJWTMock = jest.fn().mockReturnValue({ email: "email@email.com" });
      (decodeJWT as jest.Mock) = decodeJWTMock;
      checkVPNMock = jest.fn().mockReturnValue(true);
      (checkVPN as jest.Mock) = checkVPNMock;

      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      jest.spyOn(service, 'findOne').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(null)
      }));

      const result = { "error": "id not found" }

      expect(await controller.findOne("test_id", req.res, req, "")).toEqual(result);

    })
  })

  describe("Create Employer", () => {
    it("should create an employer", async () => {

      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      const createEmployeeDto = new CreateEmployeeDto();
      createEmployeeDto.ipWhitelist = [
        "37.120.145.154"
      ];
      createEmployeeDto.email = "admin@example.com";
      createEmployeeDto.firstName = "Test";
      createEmployeeDto.surname = "Test";
      createEmployeeDto.isAdmin = true;
      createEmployeeDto.isActive = true;
      createEmployeeDto.password = "qwerty123456";
      createEmployeeDto.bank = "ABC bank";
      createEmployeeDto.accountNumber = "12345678890";

      const result = {
        "ipWhitelist": [
          "37.120.145.154"
        ],
        "isAdmin": true,
        "isActive": true,
        "_id": "6033d98465690c00049640b5",
        "email": "admin@example.com",
        "password": "$2b$10$hZnwaPVFYnfcLUCv15WZgeJFN75twWeetKYzKKGuCC32itAtQUaYK",
        "firstName": "Oke",
        "surname": "Agi-Tuedor",
        "bank": "First Bank",
        "accountNumber": "1234567890"
      }

      jest.spyOn(service, 'create').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "ipWhitelist": [
              "37.120.145.154"
            ],
            "isAdmin": true,
            "isActive": true,
            "_id": "6033d98465690c00049640b5",
            "email": "admin@example.com",
            "password": "$2b$10$hZnwaPVFYnfcLUCv15WZgeJFN75twWeetKYzKKGuCC32itAtQUaYK",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "bank": "First Bank",
            "accountNumber": "1234567890"
          }
        )
      }));

      expect(await controller.create(createEmployeeDto, req.res, req)).toEqual(result);

    })

    it("should not create employee, no ipwhitelist array", async () => {
      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      const createEmployeeDto = new CreateEmployeeDto();
      createEmployeeDto.email = "admin@example.com";
      createEmployeeDto.firstName = "Test";
      createEmployeeDto.surname = "Test";
      createEmployeeDto.isAdmin = true;
      createEmployeeDto.isActive = true;
      createEmployeeDto.password = "qwerty123456";
      createEmployeeDto.bank = "ABC bank";
      createEmployeeDto.accountNumber = "12345678890";
      const result = { "error": "ipWhitelist array must be included" }

      expect(await controller.create(createEmployeeDto, req.res, req)).toEqual(result);
    })
    it("should not create employee, ip invalid in array", async () => {
      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      const createEmployeeDto = new CreateEmployeeDto();
      createEmployeeDto.ipWhitelist = [
        "invalid ip address"
      ];
      createEmployeeDto.email = "admin@example.com";
      createEmployeeDto.firstName = "Test";
      createEmployeeDto.surname = "Test";
      createEmployeeDto.isAdmin = true;
      createEmployeeDto.isActive = true;
      createEmployeeDto.password = "qwerty123456";
      createEmployeeDto.bank = "ABC bank";
      createEmployeeDto.accountNumber = "12345678890";

      const result = { "error": "\"invalid ip address\" is not a valid ip address" }

      expect(await controller.create(createEmployeeDto, req.res, req)).toEqual(result);

    })
  })
  describe("delete an employee", () => {
    it("delete an employee", async () => {
      checkVPNMock = jest.fn().mockReturnValue(true);
      (checkVPN as jest.Mock) = checkVPNMock;
      decodeJWTMock = jest.fn().mockReturnValue({ email: "email@email.com" });
      (decodeJWT as jest.Mock) = decodeJWTMock;

      const req = httpMocks.createRequest();
      req.res = httpMocks.createResponse();

      const result = {
        "isAdmin": true,
        "isActive": true,
        "_id": "602f986788d56ac35a166363",
        "email": "mail2oke6@gmail.com",
        "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
        "firstName": "Oke",
        "surname": "Agi-Tuedor",
        "ipWhitelist": [],
        "bank": "UBA",
        "accountNumber": "2155215445"
      }

      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "isAdmin": true,
            "isActive": true,
            "_id": "602f986788d56ac35a166363",
            "email": "mail2oke6@gmail.com",
            "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "ipWhitelist": [],
            "bank": "UBA",
            "accountNumber": "2155215445"
          })
      }));

      jest.spyOn(service, 'delete').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "isAdmin": true,
            "isActive": true,
            "_id": "602f986788d56ac35a166363",
            "email": "mail2oke6@gmail.com",
            "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "ipWhitelist": [],
            "bank": "UBA",
            "accountNumber": "2155215445"
          })
      }));

      expect(await controller.delete("test_id", req.res, req, "")).toEqual(result);

    })

    it("should not delete, admin account not found", async () => {
      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(null)
      }));
      const result = { "error": "admin account not found" };
      decodeJWTMock = jest.fn().mockReturnValue({ email: "email@email.com" });
      (decodeJWT as jest.Mock) = decodeJWTMock;

      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      expect(await controller.delete("test_id", req.res, req, "")).toEqual(result);

    })

    it("should not delete, admin ip address not whitelisted", async () => {
      decodeJWTMock = jest.fn().mockReturnValue({ email: "email@email.com" });
      (decodeJWT as jest.Mock) = decodeJWTMock;

      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      checkVPNMock = jest.fn().mockReturnValue(false);
      (checkVPN as jest.Mock) = checkVPNMock;

      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "isAdmin": true,
            "isActive": true,
            "_id": "602f986788d56ac35a166363",
            "email": "mail2oke6@gmail.com",
            "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "ipWhitelist": [],
            "bank": "UBA",
            "accountNumber": "2155215445"
          })
      }));

      const result = {
        "error": "Your source IP address is not whitelisted, request blocked"
      }

      expect(await controller.delete("test_id", req.res, req, "")).toEqual(result);

    })
    it("should not delete, admins only", async () => {
      decodeJWTMock = jest.fn().mockReturnValue({ email: "email@email.com" });
      (decodeJWT as jest.Mock) = decodeJWTMock;

      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      checkVPNMock = jest.fn().mockReturnValue(true);
      (checkVPN as jest.Mock) = checkVPNMock;

      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "isAdmin": false,
            "isActive": true,
            "_id": "602f986788d56ac35a166363",
            "email": "mail2oke6@gmail.com",
            "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "ipWhitelist": [],
            "bank": "UBA",
            "accountNumber": "2155215445"
          })
      }));

      const result = {
        "error": "admins only"
      }
      expect(await controller.delete("test_id", req.res, req, "")).toEqual(result);
    })
  })

  describe("Update Employer", () => {
    it("should create an employer", async () => {

      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      checkVPNMock = jest.fn().mockReturnValue(true);
      (checkVPN as jest.Mock) = checkVPNMock;

      const updateEmployeeDto = new CreateEmployeeDto();
      updateEmployeeDto.ipWhitelist = [
        "37.120.145.154"
      ];
      updateEmployeeDto.email = "admin@example.com";
      updateEmployeeDto.firstName = "Test";
      updateEmployeeDto.surname = "Test";
      updateEmployeeDto.isAdmin = true;
      updateEmployeeDto.isActive = true;
      updateEmployeeDto.password = "qwerty123456";
      updateEmployeeDto.bank = "ABC bank";
      updateEmployeeDto.accountNumber = "12345678890";

      const result = {
        "ipWhitelist": [
          "37.120.145.154"
        ],
        "isAdmin": true,
        "isActive": true,
        "_id": "6033d98465690c00049640b5",
        "email": "admin@example.com",
        "password": "$2b$10$hZnwaPVFYnfcLUCv15WZgeJFN75twWeetKYzKKGuCC32itAtQUaYK",
        "firstName": "Oke",
        "surname": "Agi-Tuedor",
        "bank": "First Bank",
        "accountNumber": "1234567890"
      }

      jest.spyOn(service, 'update').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "ipWhitelist": [
              "37.120.145.154"
            ],
            "isAdmin": true,
            "isActive": true,
            "_id": "6033d98465690c00049640b5",
            "email": "admin@example.com",
            "password": "$2b$10$hZnwaPVFYnfcLUCv15WZgeJFN75twWeetKYzKKGuCC32itAtQUaYK",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "bank": "First Bank",
            "accountNumber": "1234567890"
          }
        )
      }));

      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "isAdmin": true,
            "isActive": true,
            "_id": "602f986788d56ac35a166363",
            "email": "mail2oke6@gmail.com",
            "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "ipWhitelist": [],
            "bank": "UBA",
            "accountNumber": "2155215445"
          })
      }));

      expect(await controller.update("test_id", updateEmployeeDto, req.res, req, "")).toEqual(result);

    })
  })

  describe("Login employee", () => {
    it("logs in an employee", async () => {

      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      checkVPNMock = jest.fn().mockReturnValue(true);
      (checkVPN as jest.Mock) = checkVPNMock;

      signJWTMock = jest.fn().mockReturnValue("token");
      (signJWT as jest.Mock) = signJWTMock;

      bcryptCompareMock = jest.fn().mockReturnValue(true);
      (bcrypt.compare as jest.Mock) = bcryptCompareMock;

      const loginEmployeeDto = new LoginEmployeeDto();
      loginEmployeeDto.email = "test@test.com";
      loginEmployeeDto.password = "qwerty123456";

      const result = {
        "data": {
          "ipWhitelist": [
            "37.120.145.154"
          ],
          "isAdmin": true,
          "isActive": true,
          "_id": "6033d98465690c00049640b5",
          "email": "admin@example.com",
          "password": "$2b$10$hZnwaPVFYnfcLUCv15WZgeJFN75twWeetKYzKKGuCC32itAtQUaYK",
          "firstName": "Oke",
          "surname": "Agi-Tuedor",
          "bank": "First Bank",
          "accountNumber": "1234567890"
        },
        "token": "token"
      }

      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "ipWhitelist": [
              "37.120.145.154"
            ],
            "isAdmin": true,
            "isActive": true,
            "_id": "6033d98465690c00049640b5",
            "email": "admin@example.com",
            "password": "$2b$10$hZnwaPVFYnfcLUCv15WZgeJFN75twWeetKYzKKGuCC32itAtQUaYK",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "bank": "First Bank",
            "accountNumber": "1234567890"

          })
      }));

      expect(await controller.login(loginEmployeeDto, req.res, req)).toEqual(result);

    })

    it("should not find employee login email", async () => {
      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(null)
      }));

      const loginEmployeeDto = new LoginEmployeeDto();
      loginEmployeeDto.email = "test@test.com";
      loginEmployeeDto.password = "qwerty123456";

      const result = {
        "error": "We cannot find this email in our records"
      }
      expect(await controller.login(loginEmployeeDto, req.res, req)).toEqual(result);
    })

    it("should not login due to ip whitelisting", async () => {
      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

      jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
        resolve(
          {
            "ipWhitelist": [
              "37.120.145.154"
            ],
            "isAdmin": true,
            "isActive": true,
            "_id": "6033d98465690c00049640b5",
            "email": "admin@example.com",
            "password": "$2b$10$hZnwaPVFYnfcLUCv15WZgeJFN75twWeetKYzKKGuCC32itAtQUaYK",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "bank": "First Bank",
            "accountNumber": "1234567890"

          })
      }));

      checkVPNMock = jest.fn().mockReturnValue(false);
      (checkVPN as jest.Mock) = checkVPNMock;

      const loginEmployeeDto = new LoginEmployeeDto();
      loginEmployeeDto.email = "test@test.com";
      loginEmployeeDto.password = "qwerty123456";

      const result = { "error": "Your source IP address is not whitelisted, request blocked" }
      expect(await controller.login(loginEmployeeDto, req.res, req)).toEqual(result);
    })
  })

  it("should not login due to wrong password", async () => {
    const req = httpMocks.createRequest()
    req.res = httpMocks.createResponse()

    const loginEmployeeDto = new LoginEmployeeDto();
    loginEmployeeDto.email = "test@test.com";
    loginEmployeeDto.password = "qwerty123456";

    jest.spyOn(service, 'findByEmail').mockImplementation(() => new Promise<Employee>((resolve, reject) => {
      resolve(
        {
          "ipWhitelist": [
            "37.120.145.154"
          ],
          "isAdmin": true,
          "isActive": true,
          "_id": "6033d98465690c00049640b5",
          "email": "admin@example.com",
          "password": "$2b$10$hZnwaPVFYnfcLUCv15WZgeJFN75twWeetKYzKKGuCC32itAtQUaYK",
          "firstName": "Oke",
          "surname": "Agi-Tuedor",
          "bank": "First Bank",
          "accountNumber": "1234567890"

        })
    }));

    checkVPNMock = jest.fn().mockReturnValue(true);
    (checkVPN as jest.Mock) = checkVPNMock;

    bcryptCompareMock = jest.fn().mockReturnValue(false);
    (bcrypt.compare as jest.Mock) = bcryptCompareMock;

    const result = {
      "error": "invalid credentials"
    }
    expect(await controller.login(loginEmployeeDto, req.res, req)).toEqual(result);

  })
});
