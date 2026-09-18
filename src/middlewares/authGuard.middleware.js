import jwt from "jsonwebtoken";

const verifyTokenGuard = async (req, res, next) => {
    try {
        const authToken = req.headers['authorization'];
        if(!authToken) {
            res.status(401).json({message: "Unauthorized Access"});
            return;
        }

        const [type, token] = authToken.split(" ");
        if(type !== "Bearer") {
            res.status(400).send("Bad Request");
            return;
        }

        const payload = jwt.verify(token, process.env.FORGOT_PASSWORD_SECRET);
        if(!payload) {
            res.status(401).json({message: "Unauthorized Access"});
            return;
        }
        req.user = payload;
        next();
    } catch(err) {
        res.status(500).json({message: err.message});
    }
}

const adminUserGuard = async (req, res, next) => {
    try {
        const {authtoken} = req.cookies;
        if(!authtoken) {
            return invalidAccess(res);
        }

        const payload = jwt.verify(authtoken, process.env.AUTH_SECRET);
        if(!payload) {
            return invalidAccess(res);
        }
        if(payload.role !== "user" && payload.role !== "admin") {
            return invalidAccess(res);
        }
        req.user = payload;
        next();
    } catch(err) {
        return invalidAccess(res);
    }
}

const adminGuard = async (req, res, next) => {
    try {
        const {authtoken} = req.cookies;
        if(!authtoken) {
            return invalidAccess(res);
        }

        const payload = jwt.verify(authtoken, process.env.AUTH_SECRET);
        if(!payload) {
            return invalidAccess(res);
        }
        if(payload.role !== "admin") {
            return invalidAccess(res);
        }
        req.user = payload;
        next();
    } catch(err) {
        return invalidAccess(res);
    }
}


// helper function
const invalidAccess = (res) => {
    res.cookie("authtoken", null, {
        httpOnly: true,
        secure: process.env.ENVIRONMENT !== "dev",
        sameSite: process.env.ENVIRONMENT === "dev" ? "lax" : "none",
        path: "/",
        // domain: process.env.ENVIRONMENT === "dev" ? "localhost" : process.env.CLIENT_URL || undefined,
        maxAge: 0
    })
    res.status(400).json({message: "Unauthorized Access"});
    return;
}

export {verifyTokenGuard, adminUserGuard, adminGuard};