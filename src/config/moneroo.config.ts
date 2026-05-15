import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const monerooConfigSchema = Joi.object({
    MONEROO_API_KEY: Joi.string().required(),
    MONEROO_SECRET_KEY: Joi.string().required(),
    MONEROO_WEBHOOK_SECRET: Joi.string().required(),
    MONEROO_BASE_URL: Joi.string().default('https://api.moneroo.io/v1'),
    MONEROO_ALLOWED_IPS: Joi.string().optional(),
});

export default registerAs('moneroo', () => ({
    apiKey: process.env.MONEROO_API_KEY,
    secretKey: process.env.MONEROO_SECRET_KEY,
    webhookSecret: process.env.MONEROO_WEBHOOK_SECRET,
    baseUrl: process.env.MONEROO_BASE_URL || 'https://api.moneroo.io/v1',
    allowedIps: process.env.MONEROO_ALLOWED_IPS?.split(',') || [],
}));