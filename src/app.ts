import express from 'express';
import { requireAuth } from './middleware/auth';
import { monthsRouter } from './routes/months';
import { habitsRouter } from './routes/habits';

export const app = express();

app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.use(requireAuth);
app.use('/months', monthsRouter);
app.use('/', habitsRouter);