import { HttpStatus } from '@nestjs/common';
import config from "../../config/keys";

const checkVPN = (req, res): any => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }
    if (config.IPWhiteList.indexOf(ip) === -1) {
        res.status(HttpStatus.FORBIDDEN).send({
            "error": "blocked"
        })
        return;
    } else {
        return true;
    }
}

export {
    checkVPN
}