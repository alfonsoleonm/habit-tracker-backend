import { Router } from 'express';
import { PutCommand, QueryCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { db, TABLE } from '../db/dynamo';

export const monthsRouter = Router();

const CORE_HABITS = [
    { id: 'meditation', label: 'Meditation / NSDR', core: true },
    { id: 'journaling', label: 'Journaling', core: true },
    { id: 'reading', label: 'Reading', core: true },
    { id: 'study', label: 'Study', core: true },
];

// GET /months — list all months for the user
monthsRouter.get('/', async (req, res) => {
    const userId = (req as any).userId;
    try {
        const result = await db.send(new QueryCommand({
            TableName: TABLE,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': 'MONTH#'
            }
        }));
        res.json(result.Items ?? []);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch months' });
    }
});

// GET /months/:id — get one month with entries
monthsRouter.get('/:id', async (req, res) => {
    const userId = (req as any).userId;
    const monthId = req.params.id;
    try {
        const result = await db.send(new GetCommand({
            TableName: TABLE,
            Key: { PK: `USER#${userId}`, SK: `MONTH#${monthId}` }
        }));
        if (!result.Item) {
            res.status(404).json({ error: 'Month not found' });
            return;
        }
        res.json(result.Item);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch month' });
    }
});

// POST /months — create a new month
monthsRouter.post('/', async (req, res) => {
    const userId = (req as any).userId;
    const { id, label, customColumns = [] } = req.body;

    if (!id || !label) {
        res.status(400).json({ error: 'id and label are required' });
        return;
    }

    const [y, mo] = id.split('-').map(Number);
    const daysInMonth = new Date(y, mo, 0).getDate();
    const columns = [...CORE_HABITS, ...customColumns];
    const entries = Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        checks: Object.fromEntries(columns.map((c: any) => [c.id, false]))
    }));

    const item = {
        PK: `USER#${userId}`,
        SK: `MONTH#${id}`,
        id,
        label,
        columns,
        entries
    };

    try {
        await db.send(new PutCommand({ TableName: TABLE, Item: item }));
        res.status(201).json(item);
    } catch (e) {
        res.status(500).json({ error: 'Failed to create month' });
    }
});

// DELETE /months/:id
monthsRouter.delete('/:id', async (req, res) => {
    const userId = (req as any).userId;
    const monthId = req.params.id;
    try {
        await db.send(new DeleteCommand({
            TableName: TABLE,
            Key: { PK: `USER#${userId}`, SK: `MONTH#${monthId}` }
        }));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete month' });
    }
});