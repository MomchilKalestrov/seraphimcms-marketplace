import type z from 'zod';
import { type RequestHandler } from 'express';

const validate = (schema: z.ZodObject): RequestHandler => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (error) {
        res.sendStatus(400);
    };
};

export default validate;