import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { EmployeesService } from "./../src/employees/employees.service";

describe('Testing app controllers', () => {
  let app: INestApplication;
  let service: EmployeesService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    service = moduleFixture.get(EmployeesService);


  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello TSS! See documentation at https://documenter.getpostman.com/view/5539822/TWDXmwEi');
  });

  /*
  it('should should create an employee', () => {
    return request(app.getHttpServer())
      .post('/employees')
      .send({
        "email": "test@example.com",
        "password": "qwerty123456",
        "firstName": "test",
        "surname": "testy",
        "bank": "First Bank",
        "accountNumber": "1234567890",
        "ipWhitelist": [
          "127.0.0.1"
        ],
        "isAdmin": true
      })
      .expect(201)
  })

  */

  afterAll(async () => {
    // await service.findByEmailAndDelete("test@example.com")
    await app.close();
  });

});
