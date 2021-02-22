import { HttpStatus } from '@nestjs/common';
// import config from "../../config/keys";

const checkVPN = (req, whiteListedIPs): boolean => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }
    if (whiteListedIPs.indexOf(ip) === -1) {
        return false;
    }
    else {
        return true;
    }

}

export {
    checkVPN
}