"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const https_1 = __importDefault(require("https"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const db_1 = __importDefault(require("./lib/db"));
const schemas = __importStar(require("./lib/zodSchemas"));
const plugin_1 = __importDefault(require("./models/plugin"));
const author_1 = __importDefault(require("./models/author"));
(0, dotenv_1.configDotenv)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
app.use((0, cors_1.default)({ origin: '*' }));
app.use((res, _, next) => {
    const time = new Date().toISOString().split('T').pop().split('.')[0];
    console.log(`${time} ${res.method} ${res.path}`);
    next();
});
app.post('/api/get-plugins', async (req, res) => {
    const { skip, count } = schemas.getPluginsBodySchema.parse(req.body);
    await (0, db_1.default)();
    const plugins = await plugin_1.default.aggregate([
        { $set: {
                iconUrl: {
                    $concat: [process.env.DATA_URL, '/plugins/', '$name', '/icon.png']
                },
                downloadUrl: {
                    $concat: [process.env.DATA_URL, '/plugins/', '$name', '/plugin.zip']
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
    await (0, db_1.default)();
    const dataUrl = process.env.DATA_URL ?? '';
    const trimmedQuery = query.trim();
    const setAssetUrlsStage = {
        $set: {
            iconUrl: {
                $concat: [dataUrl, '/plugins/', '$name', '/icon.png']
            },
            downloadUrl: {
                $concat: [dataUrl, '/plugins/', '$name', '/plugin.zip']
            }
        }
    };
    const listProjectStage = {
        $project: {
            description: false,
            author: false
        }
    };
    const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let plugins;
    try {
        plugins = await plugin_1.default.aggregate([
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
    }
    catch (err) {
        // `$search` only works on Atlas Search / specific server setups.
        // Fall back to a regex-based search so local/self-hosted MongoDB works too.
        const safe = escapeRegex(trimmedQuery);
        const qLower = trimmedQuery.toLowerCase();
        plugins = await plugin_1.default.aggregate([
            { $match: { name: { $regex: new RegExp(safe, 'i') } } },
            {
                $addFields: {
                    _exactMatch: {
                        $eq: [{ $toLower: '$name' }, qLower]
                    },
                    _startsWith: {
                        $regexMatch: {
                            input: { $toLower: '$name' },
                            regex: `^${safe.toLowerCase()}`
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
    await (0, db_1.default)();
    const [plugin] = await plugin_1.default.aggregate([
        { $set: {
                iconUrl: {
                    $concat: [process.env.DATA_URL, '/plugins/', '$name', '/icon.png']
                },
                downloadUrl: {
                    $concat: [process.env.DATA_URL, '/plugins/', '$name', '/plugin.zip']
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
    console.log(plugin);
    return res.send(plugin);
});
app.post('/api/get-author', async (req, res) => {
    const { name } = schemas.getAuthorBodySchema.parse(req.body);
    await (0, db_1.default)();
    const [author] = await author_1.default.aggregate([
        { $match: {
                name: {
                    $eq: name
                }
            } },
        { $set: {
                pictureUrl: {
                    $concat: [process.env.DATA_URL, '/authors/', '$name', '/profile.png']
                }
            } },
        { $project: {
                _id: false,
                __v: false
            } }
    ]);
    return res.send(author);
});
const httpsServer = https_1.default.createServer({
    key: process.env.SSL_KEY,
    cert: process.env.SSL_CERT
}, app);
httpsServer.listen(Number(process.env.PORT) || 3000);
