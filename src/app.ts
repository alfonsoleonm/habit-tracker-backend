import express from 'express';
import { requireAuth } from './middleware/auth';
import { monthsRouter } from './routes/months';
import { habitsRouter } from './routes/habits';

export const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});

app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.use(requireAuth);
app.use('/months', monthsRouter);
app.use('/', habitsRouter);