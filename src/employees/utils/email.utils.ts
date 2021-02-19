import config from "../../config/keys";


const sendUpdateMail = (recipient) => {

    var message = {
        from: "12e565a088-be5be4@inbox.mailtrap.io",
        to: recipient,
        subject: "Update on TSS",
        text: "Profile Update",
        html: "<p>Profile Update</p>"
    };

    config.mailer.sendMail(message);
    // console.log("email sent")

}

export {
    sendUpdateMail
}