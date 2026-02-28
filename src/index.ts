import cors from 'cors';
import https from 'https';
import express from 'express';
import { configDotenv } from 'dotenv';

import connect from './lib/db/index.ts';
import router from './route/index.ts';

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

app.use(async (_, __, next) => {
    await connect();
    next();
});

app.use('/api', router);

if(!process.env.VERCEL) {
    const httpsServer = https.createServer({
        key: process.env.SSL_KEY,
        cert: process.env.SSL_CERT
    }, app);

    httpsServer.listen(8080);
};

export default app;