import express from 'express';
import validate from '../lib/validate.ts';
import { getAuthorBodySchema } from '../lib/zodSchemas.ts';
import Author from '../models/author.ts';

const router = express.Router();

router.post('/get-author', validate(getAuthorBodySchema), async ({ body: { name } }, res) => {
    const [ author ] = await Author.aggregate([
        { $match: {
            name: {
                $eq: name
            }
        } },
        { $set: {
            pictureUrl: {
                $concat: [ process.env.DATA_URL, '/authors/', '$name', '/profile.png' ]
            }
        } },
        { $project: {
            _id: false,
            __v: false
        } }
    ]);
    
    return res.send(author);
});

export default router;