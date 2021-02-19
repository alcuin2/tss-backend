import { Document } from 'mongoose';


export interface Employee {
    _id?: string;
    firstName: string;
    surname: string;
    email: string,
    password: string,
    bank: string;
    accountNumber: string;
    isAdmin: boolean;
    isActive: boolean;

}
