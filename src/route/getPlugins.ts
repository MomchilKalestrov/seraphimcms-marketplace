import express from 'express';
import validate from '../lib/validate.ts';
import { getPluginsBodySchema } from '../lib/zodSchemas.ts';
import Plugin from '../models/plugin.ts';

const router = express.Router();

router.post('/get-plugins', validate(getPluginsBodySchema), async ({ body: { skip, count } }, res) => {
    const plugins =
        await Plugin.aggregate([
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