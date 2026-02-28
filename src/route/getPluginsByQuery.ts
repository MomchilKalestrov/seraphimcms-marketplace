import express from 'express';
import validate from '../lib/validate.ts';
import { getPluginsByQueryBodySchema } from '../lib/zodSchemas.ts';
import Plugin from '../models/plugin.ts';

const router = express.Router();

router.post('/get-plugins-by-query', validate(getPluginsByQueryBodySchema), async ({ body: { query, skip, count } }, res) => {
    const plugins =
        await Plugin.aggregate([
            { $search: {
                index: 'name',
                text: {
                    query,
                    path: [ 'name' ],
                    fuzzy: { maxEdits: 2 }
                }
            } },
            { $set: {
                iconUrl: {
                    $concat: [ process.env.DATA_URL, '/plugins/', '$name', '/icon.png' ]
                },
                downloadUrl: {
                    $concat: [ process.env.DATA_URL, '/plugins/', '$name', '/plugin.zip' ]
                }
            } },
            { $project: {
                description: false,
                images: false,
                author: false,
                _id: false,
                __v: false
            } },
            { $skip: skip },
            { $limit: count }
        ]);
    
    return res.send(plugins);
});

export default router;