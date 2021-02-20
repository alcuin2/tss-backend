import * as nodemailer from 'nodemailer';

var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "2f4e24055ee96e",
        pass: "d0d1c2f757346f"
    }
});

export default {
    mongoURI: "mongodb+srv://alcuin:1RW4hSkVTgS1p4KA@tss.ofetu.mongodb.net/tss?retryWrites=true&w=majority",
    JWTSecret: "jhdfhvjksdhdu7rgbbvi9dfhnhfiocniihie39iudfj",
    IPWhiteList: [],
    mailer: transport
}