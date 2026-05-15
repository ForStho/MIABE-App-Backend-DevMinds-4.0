import { Schema } from 'mongoose';
import { softDeletePlugin } from './soft-delete.plugin';
import { slugPlugin } from './slug.plugin';

export type MongoosePlugin = (schema: Schema, options?: unknown) => void;

/**
 * Liste centralisée des plugins mongoose
 * Permet l'auto chargement dans le DatabaseModule
 */
export const mongoosePlugins: MongoosePlugin[] = [softDeletePlugin, slugPlugin];
