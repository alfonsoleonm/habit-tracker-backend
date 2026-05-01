import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const verifier = CognitoJwtVerifier.create({
    userPoolId: 'us-east-1_UYMT1HC69',
    clientId: '7rbfc122arlgve75lvd9t3sbbh',
    tokenUse: 'access'
});

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing token' });
        return;
    }
    try {
        const payload = await verifier.verify(header.split(' ')[1]);
        (req as any).userId = payload.sub;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}
