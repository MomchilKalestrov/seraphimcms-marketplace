import express from 'express';
import getAuthorRouter from './getAuthor.ts';
import getPluginRouter from './getPlugin.ts';
import getPluginsRouter from './getPlugins.ts';
import getPluginsByQuery from './getPluginsByQuery.ts';

const router = express.Router();

router.use(getAuthorRouter);
router.use(getPluginRouter);
router.use(getPluginsRouter);
router.use(getPluginsByQuery);

export default router;