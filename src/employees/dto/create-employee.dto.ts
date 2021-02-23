
export class CreateEmployeeDto {
    email: string;
    password: string;
    firstName: string;
    surname: string;
    bank: string;
    accountNumber: string;
    ipWhitelist: string[];
    isAdmin: boolean;
    isActive: boolean;
    token?: string
}