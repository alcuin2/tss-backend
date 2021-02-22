import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';


dotenv.config();

var transport = nodemailer.createTransport({
    host: process.env.EMAILHOST,
    port: process.env.EMAILPORT,
    auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASS
    }
});

export default {
    mongoURI: "" + process.env.MONGODBURI,
    JWTSecret: process.env.JWTSECRET,
    mailer: transport
}