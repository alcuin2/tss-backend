import { Document } from 'mongoose';

export class CreateEmployeeDto extends Document {
    readonly email: string;
    readonly password: string;
    readonly firstName: string;
    readonly surname: string;
    readonly bank: string;
    readonly accountNumber: string;
    readonly ipWhitelist: string[];
    readonly isAdmin: boolean;
    readonly isActive: boolean;
    readonly token?: string
}