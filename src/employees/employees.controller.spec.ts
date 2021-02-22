import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { Employee } from "./interfaces/employee.interface";
import { EmployeesService } from "./employees.service";
import { EmployeesModule } from "./employees.module";
import { decodeJWT, signJWT, checkAdminToken } from "./utils/jwt.utils";
import { checkVPN } from "./utils/vpn.utils";
import { MongooseModule } from '@nestjs/mongoose';

import config from "../config/keys";
import * as httpMocks from 'node-mocks-http';


describe('EmployeesController', () => {
  let controller: EmployeesController;
  let service: EmployeesService;
  let checkVPNMock: jest.Mock;
  let decodeJWTMock: jest.Mock;
  let signJWTMock: jest.Mock;
  let checkAdminTokenMock: jest.Mock;

  beforeEach(async () => {

    jest.setTimeout(30000);

    const module: TestingModule = await Test.createTestingModule({
      imports: [EmployeesModule, MongooseModule.forRoot(config.mongoURI)],
    }).compile();

    controller = module.get(EmployeesController);
    service = module.get(EmployeesService);

    //jest.mock('CheckVPN');

    checkVPNMock = jest.fn().mockReturnValue(true);
    (checkVPN as jest.Mock) = checkVPNMock;
    decodeJWTMock = jest.fn().mockReturnValue({ email: "email@email.com" });
    (decodeJWT as jest.Mock) = decodeJWTMock;

  });

  describe('findAll', () => {
    it('should return an array of employees', async () => {
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
      const req = httpMocks.createRequest()
      req.res = httpMocks.createResponse()

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
  });
});
