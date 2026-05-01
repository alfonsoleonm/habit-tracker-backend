"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.habitsRouter = void 0;
const express_1 = require("express");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const dynamo_1 = require("../db/dynamo");
exports.habitsRouter = (0, express_1.Router)();
// PATCH /months/:id/days/:day — toggle a habit check
exports.habitsRouter.patch('/months/:id/days/:day', async (req, res) => {
    const userId = req.userId;
    const { id, day } = req.params;
    const { colId, value } = req.body;
    if (!colId || value === undefined) {
        res.status(400).json({ error: 'colId and value are required' });
        return;
    }
    const dayNum = parseInt(day);
    // First verify the month exists
    const existing = await dynamo_1.db.send(new lib_dynamodb_1.GetCommand({
        TableName: dynamo_1.TABLE,
        Key: { PK: `USER#${userId}`, SK: `MONTH#${id}` }
    }));
    if (!existing.Item) {
        res.status(404).json({ error: 'Month not found' });
        return;
    }
    // Update the specific day entry in the entries array
    const entries = existing.Item.entries.map((e) => {
        if (e.day !== dayNum)
            return e;
        return { ...e, checks: { ...e.checks, [colId]: value } };
    });
    try {
        await dynamo_1.db.send(new lib_dynamodb_1.UpdateCommand({
            TableName: dynamo_1.TABLE,
            Key: { PK: `USER#${userId}`, SK: `MONTH#${id}` },
            UpdateExpression: 'SET entries = :entries',
            ExpressionAttributeValues: { ':entries': entries }
        }));
        res.json({ success: true });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to update entry' });
    }
});
