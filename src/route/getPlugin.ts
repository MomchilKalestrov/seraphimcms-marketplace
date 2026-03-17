import express from 'express';
import validate from '../lib/validate.ts';
import { getPluginBodySchema } from '../lib/zodSchemas.ts';
import Plugin from '../models/plugin.ts';

const router = express.Router();

//  What in God's name was I thinking when writing this?
//  I should be shot for making so unoptimized code.
//
//  const [ plugin ] = await Plugin.aggregate([
//      { $set: {
//          iconUrl: {
//              $concat: [ process.env.DATA_URL, '/plugins/', '$name', '/icon.png' ]
//          },
//          downloadUrl: {
//              $concat: [ process.env.DATA_URL, '/plugins/', '$name', '/plugin.zip' ]
//          }
//      } },
//      { $match: {
//          name: {
//              $eq: name
//          }
//      } },
//      { $project: {
//          _id: false,
//          __v: false
//      } }
//  ]);

router.post('/get-plugin', validate(getPluginBodySchema), async ({ body: { name } }, res) => {
    const plugin = await Plugin.findOne({ name }).lean() as any; // cast to any because we will be modifying
    plugin.iconUrl = `${ process.env.DATA_URL }/plugins/${ name }/icon.png`;
    plugin.downloadUrl = `${ process.env.DATA_URL }/plugins/${ name }/plugin.zip`;
    delete plugin._id;
    delete plugin.__v;
    
    console.log('sending', plugin)

    return res.send(plugin);
});

export default router;