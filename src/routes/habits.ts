import { Router } from 'express';
import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { db, TABLE } from '../db/dynamo';

export const habitsRouter = Router();

// PATCH /months/:id/days/:day — toggle a habit check
habitsRouter.patch('/months/:id/days/:day', async (req, res) => {
    const userId = (req as any).userId;
    const { id, day } = req.params;
    const { colId, value } = req.body;

    if (!colId || value === undefined) {
        res.status(400).json({ error: 'colId and value are required' });
        return;
    }

    const dayNum = parseInt(day);

    // First verify the month exists
    const existing = await db.send(new GetCommand({
        TableName: TABLE,
        Key: { PK: `USER#${userId}`, SK: `MONTH#${id}` }
    }));

    if (!existing.Item) {
        res.status(404).json({ error: 'Month not found' });
        return;
    }

    // Update the specific day entry in the entries array
    const entries = existing.Item.entries.map((e: any) => {
        if (e.day !== dayNum) return e;
        return { ...e, checks: { ...e.checks, [colId]: value } };
    });

    try {
        await db.send(new UpdateCommand({
            TableName: TABLE,
            Key: { PK: `USER#${userId}`, SK: `MONTH#${id}` },
            UpdateExpression: 'SET entries = :entries',
            ExpressionAttributeValues: { ':entries': entries }
        }));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to update entry' });
    }
});