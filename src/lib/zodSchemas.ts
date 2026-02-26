import z from 'zod';

export const getPluginsBodySchema = z.object({
    skip: z.number().min(0),
    count: z.number().min(0).max(50)
});

export const getPluginsByQueryBodySchema = getPluginsBodySchema.extend({
    query: z.string().min(1)
});

export const getPluginBodySchema = z.object({
    name: z.string().min(1)
});

export const getAuthorBodySchema = z.object({
    name: z.string().min(1)
});