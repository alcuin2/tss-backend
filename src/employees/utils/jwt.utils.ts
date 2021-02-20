
import { HttpStatus } from '@nestjs/common';
import * as jwt from "jsonwebtoken";

import config from "../../config/keys";

const decodeJWT = (token, res): any => {
    if (token === undefined) {
        res.status(HttpStatus.FORBIDDEN).send({
            "error": "token is required"
        })
        return;

    } else {
        const data = jwt.verify(token, config.JWTSecret, (err, decoded) => {
            if (err) {
                res.status(HttpStatus.FORBIDDEN).send({
                    "error": "token is invalid"
                })
                return
            }
            return decoded;
        });
        return data;
    }

}

const signJWT = (result): string => {
    const token = jwt.sign({
        email: result.email,
        isAdmin: result.isAdmin,
        isActive: result.isAdmin,
        ipWhitelist: result.ipWhitelist

    }, config.JWTSecret);
    return token
}

const checkAdminToken = (token, res): any => {
    if (token === undefined) {
        res.status(HttpStatus.FORBIDDEN).send({
            "error": "token is required in header"
        })
        return;

    } else {
        const data = jwt.verify(token, config.JWTSecret, (err, decoded) => {
            if (err) {
                res.status(HttpStatus.FORBIDDEN).send({
                    "error": "token is invalid"
                })
                return
            }
            return decoded;
        });
        if (data.isAdmin === true) {
            return true
        } else {
            res.status(HttpStatus.FORBIDDEN).send({
                "error": "admins only"
            })
            return
        }
    }
}

export {
    decodeJWT,
    signJWT,
    checkAdminToken,
}