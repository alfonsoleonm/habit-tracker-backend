"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const aws_jwt_verify_1 = require("aws-jwt-verify");
const verifier = aws_jwt_verify_1.CognitoJwtVerifier.create({
    userPoolId: 'us-east-1_UYMT1HC69',
    clientId: '7rbfc122arlgve75lvd9t3sbbh',
    tokenUse: 'access'
});
async function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing token' });
        return;
    }
    try {
        const payload = await verifier.verify(header.split(' ')[1]);
        req.userId = payload.sub;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}
