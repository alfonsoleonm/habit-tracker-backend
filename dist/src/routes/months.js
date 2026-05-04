"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthsRouter = void 0;
const express_1 = require("express");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const dynamo_1 = require("../db/dynamo");
exports.monthsRouter = (0, express_1.Router)();
const CORE_HABITS = [
    { id: 'meditation', label: 'Meditation / NSDR', core: true },
    { id: 'journaling', label: 'Journaling', core: true },
    { id: 'reading', label: 'Reading', core: true },
    { id: 'study', label: 'Study', core: true },
];
// GET /months — list all months for the user
exports.monthsRouter.get('/', async (req, res) => {
    const userId = req.userId;
    try {
        const result = await dynamo_1.db.send(new lib_dynamodb_1.QueryCommand({
            TableName: dynamo_1.TABLE,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': 'MONTH#'
            }
        }));
        res.json(result.Items ?? []);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to fetch months' });
    }
});
// GET /months/:id — get one month with entries
exports.monthsRouter.get('/:id', async (req, res) => {
    const userId = req.userId;
    const monthId = req.params.id;
    try {
        const result = await dynamo_1.db.send(new lib_dynamodb_1.GetCommand({
            TableName: dynamo_1.TABLE,
            Key: { PK: `USER#${userId}`, SK: `MONTH#${monthId}` }
        }));
        if (!result.Item) {
            res.status(404).json({ error: 'Month not found' });
            return;
        }
        res.json(result.Item);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to fetch month' });
    }
});
// POST /months — create a new month
exports.monthsRouter.post('/', async (req, res) => {
    const userId = req.userId;
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
        checks: Object.fromEntries(columns.map((c) => [c.id, false]))
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
        await dynamo_1.db.send(new lib_dynamodb_1.PutCommand({ TableName: dynamo_1.TABLE, Item: item }));
        res.status(201).json(item);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to create month' });
    }
});
// DELETE /months/:id
exports.monthsRouter.delete('/:id', async (req, res) => {
    const userId = req.userId;
    const monthId = req.params.id;
    try {
        await dynamo_1.db.send(new lib_dynamodb_1.DeleteCommand({
            TableName: dynamo_1.TABLE,
            Key: { PK: `USER#${userId}`, SK: `MONTH#${monthId}` }
        }));
        res.json({ success: true });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to delete month' });
    }
});
