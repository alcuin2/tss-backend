import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { EmployeesModule } from "./employees.module";
import { Employee } from "./interfaces/employee.interface";
import { MongooseModule } from '@nestjs/mongoose';
import config from "../config/keys";

describe('EmployeesService', () => {
  let service: EmployeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EmployeesModule, MongooseModule.forRoot(config.mongoURI)],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  /*

  describe('findAll', () => {
    it('should return an instance of Promise', async () => {

      expect(await service.findAll()[0] instanceof Promise<Employee[]>).toBe(true);
    });
  });
  */
});
