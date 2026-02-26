import cors from 'cors';
import https from 'https';
import express from 'express';
import { configDotenv } from 'dotenv';

import connect from './lib/db';
import * as schemas from './lib/zodSchemas';

import Plugin from './models/plugin';
import Author from './models/author';

configDotenv()

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(cors({ origin: '*' }));

app.use((res, _, next) => {
    const time = new Date().toISOString().split('T').pop()!.split('.')[ 0 ];
    console.log(`${ time } ${ res.method } ${ res.path }`);
    next();
});

app.post('/api/get-plugins', async (req, res) => {
    const { skip, count } = schemas.getPluginsBodySchema.parse(req.body);

    await connect();

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

app.post('/api/get-plugins-by-query', async (req, res) => {
    const { query, skip, count } = schemas.getPluginsByQueryBodySchema.parse(req.body);

    await connect();

    const dataUrl = process.env.DATA_URL ?? '';
    const trimmedQuery = query.trim();

    const setAssetUrlsStage = {
        $set: {
            iconUrl: {
                $concat: [ dataUrl, '/plugins/', '$name', '/icon.png' ]
            },
            downloadUrl: {
                $concat: [ dataUrl, '/plugins/', '$name', '/plugin.zip' ]
            }
        }
    } as const;

    const listProjectStage = {
        $project: {
            description: false,
            author: false
        }
    } as const;

    const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    let plugins: unknown[];

    try {
        plugins = await Plugin.aggregate([
            {
                $search: {
                    index: 'name_text',
                    text: {
                        query: trimmedQuery,
                        path: 'name',
                        fuzzy: {
                            maxEdits: 2,
                            prefixLength: 1
                        }
                    }
                }
            },
            { $addFields: { _score: { $meta: 'searchScore' } } },
            setAssetUrlsStage,
            { $sort: { _score: -1, name: 1 } },
            listProjectStage,
            { $project: { _score: false } },
            { $skip: skip },
            { $limit: count }
        ]);
    } catch (err) {
        // `$search` only works on Atlas Search / specific server setups.
        // Fall back to a regex-based search so local/self-hosted MongoDB works too.
        const safe = escapeRegex(trimmedQuery);
        const qLower = trimmedQuery.toLowerCase();

        plugins = await Plugin.aggregate([
            { $match: { name: { $regex: new RegExp(safe, 'i') } } },
            {
                $addFields: {
                    _exactMatch: {
                        $eq: [ { $toLower: '$name' }, qLower ]
                    },
                    _startsWith: {
                        $regexMatch: {
                            input: { $toLower: '$name' },
                            regex: `^${ safe.toLowerCase() }`
                        }
                    }
                }
            },
            setAssetUrlsStage,
            { $sort: { _exactMatch: -1, _startsWith: -1, name: 1 } },
            listProjectStage,
            { $project: { _exactMatch: false, _startsWith: false } },
            { $skip: skip },
            { $limit: count }
        ]);
    }

    return res.send(plugins);
});

app.post('/api/get-plugin', async (req, res) => {
    const { name } = schemas.getPluginBodySchema.parse(req.body);

    await connect();

    const [ plugin ] = await Plugin.aggregate([
        { $set: {
            iconUrl: {
                $concat: [ process.env.DATA_URL, '/plugins/', '$name', '/icon.png' ]
            },
            downloadUrl: {
                $concat: [ process.env.DATA_URL, '/plugins/', '$name', '/plugin.zip' ]
            }
        } },
        { $match: {
            name: {
                $eq: name
            }
        } },
        { $project: {
            _id: false,
            __v: false
        } }
    ]);

    console.log(plugin)
    return res.send(plugin);
});

app.post('/api/get-author', async (req, res) => {
    const { name } = schemas.getAuthorBodySchema.parse(req.body);

    await connect();

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

const httpsServer = https.createServer({
    key: process.env.SSL_KEY,
    cert: process.env.SSL_CERT
}, app);

httpsServer.listen(Number(process.env.PORT) || 3000);
