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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EmployeesModule, MongooseModule.forRoot(config.mongoURI)],
    }).compile();

    controller = module.get(EmployeesController);
    service = module.get(EmployeesService);

  });

  describe('findAll', () => {
    it('should return an array of employees', async () => {
      const result = new Promise<Employee[]>((resolve, reject) => {
        resolve([
          {
            "isAdmin": true,
            "isActive": true,
            "_id": "602f986788d56ac35a166363",
            "email": "mail2oke6@gmail.com",
            "password": "$2b$10$WLHr1ws3jS2WaTb0dHR1QuVSECZySVI2gaZIz8BuZFqf9DMkctsp2",
            "firstName": "Oke",
            "surname": "Agi-Tuedor",
            "bank": "UBA",
            "accountNumber": "2155215445"
          }])
      });
      const req = httpMocks.createRequest({
        connection: {
          remoteAddress: "127.0.0.1"
        }
      }
      )
      req.res = httpMocks.createResponse()
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1haWwyb2tlNUBnbWFpbC5jb20iLCJpc0FkbWluIjp0cnVlLCJpc0FjdGl2ZSI6dHJ1ZSwiaWF0IjoxNjEzNzU5MjgyfQ.tQzU3JWVqj8zqmUVPJ8J8Eum22rPM4j0NCcC80g6kIk"

      jest.spyOn(service, 'findAll').mockImplementation(() => result);
      // let checkVPN = jest.fn(() => true)
      expect(await controller.findAll(req.res, req, token)).toBe(result);
    });
  });
});
