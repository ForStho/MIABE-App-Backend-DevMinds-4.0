import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const storageConfigSchema = Joi.object({
  STORAGE_DRIVER: Joi.string()
    .valid('local', 'backblaze')
    .default('local'),

  LOCAL_STORAGE_PATH: Joi.when('STORAGE_DRIVER', {
    is: 'local',
    then: Joi.string().required(),
    otherwise: Joi.optional(),
  }),

  B2_KEY_ID: Joi.when('STORAGE_DRIVER', {
    is: 'backblaze',
    then: Joi.string().required(),
    otherwise: Joi.optional(),
  }),
  B2_APPLICATION_KEY: Joi.when('STORAGE_DRIVER', {
    is: 'backblaze',
    then: Joi.string().required(),
    otherwise: Joi.optional(),
  }),
  B2_BUCKET_ID: Joi.when('STORAGE_DRIVER', {
    is: 'backblaze',
    then: Joi.string().required(),
    otherwise: Joi.optional(),
  }),
  B2_BUCKET_NAME: Joi.when('STORAGE_DRIVER', {
    is: 'backblaze',
    then: Joi.string().required(),
    otherwise: Joi.optional(),
  }),
  B2_REGION: Joi.when('STORAGE_DRIVER', {
    is: 'backblaze',
    then: Joi.string().required(),
    otherwise: Joi.optional(),
  }),
  B2_ENDPOINT: Joi.string().optional(),
  B2_PUBLIC_URL: Joi.string().optional(),

  MAX_FILE_SIZE: Joi.number().default(10 * 1024 * 1024),
  ALLOWED_MIME_TYPES: Joi.string().default('image/jpeg,image/png,image/webp,application/pdf'),
});

export interface StorageConfig {
  driver: 'local' | 'backblaze';
  local?: { path: string };
  backblaze?: {
    keyId: string;
    applicationKey: string;
    bucketId: string;
    bucketName: string;
    region: string;
    endpoint: string;
    publicUrl: string;
  };
  maxFileSize: number;
  allowedMimeTypes: string[];
}

const getBackblazeEndpoint = (region: string): string => {
  const endpoints: Record<string, string> = {
    'us-west-001': 'https://s3.us-west-001.backblazeb2.com',
    'us-west-002': 'https://s3.us-west-002.backblazeb2.com',
    'us-east-001': 'https://s3.us-east-001.backblazeb2.com',
    'us-east-002': 'https://s3.us-east-002.backblazeb2.com',
    'us-east-005': 'https://s3.us-east-005.backblazeb2.com',
    'eu-central-001': 'https://s3.eu-central-001.backblazeb2.com',
    'eu-central-002': 'https://s3.eu-central-002.backblazeb2.com',
    'ap-northeast-001': 'https://s3.ap-northeast-001.backblazeb2.com',
    'ap-northeast-002': 'https://s3.ap-northeast-002.backblazeb2.com',
  };
  return endpoints[region] || `https://s3.${region}.backblazeb2.com`;
};

const getPublicUrl = (bucketName: string, region: string): string => {
  const regionMatch = region.match(/\d+$/);
  const regionCode = regionMatch ? regionMatch[0] : '005';
  return `https://f${regionCode}.backblazeb2.com/file/${bucketName}`;
};

export default registerAs('storage', (): StorageConfig => {
  const driver = (process.env.STORAGE_DRIVER ?? 'local') as 'local' | 'backblaze';
  const maxFileSize = parseInt(process.env.MAX_FILE_SIZE ?? '10485760', 10);
  const allowedMimeTypes = (process.env.ALLOWED_MIME_TYPES ?? 'image/jpeg,image/png,image/webp,application/pdf').split(',');

  if (driver === 'backblaze') {
    const keyId = process.env.B2_KEY_ID;
    const applicationKey = process.env.B2_APPLICATION_KEY;
    const bucketId = process.env.B2_BUCKET_ID;
    const bucketName = process.env.B2_BUCKET_NAME;
    const region = process.env.B2_REGION;

    if (!keyId || !applicationKey || !bucketId || !bucketName || !region) {
      throw new Error('Missing Backblaze B2 configuration. Please check your .env file.');
    }

    const endpoint = process.env.B2_ENDPOINT || getBackblazeEndpoint(region);
    const publicUrl = process.env.B2_PUBLIC_URL || getPublicUrl(bucketName, region);

    return {
      driver,
      backblaze: {
        keyId,
        applicationKey,
        bucketId,
        bucketName,
        region,
        endpoint,
        publicUrl,
      },
      maxFileSize,
      allowedMimeTypes,
    };
  }

  return {
    driver,
    local: { path: process.env.LOCAL_STORAGE_PATH ?? './uploads' },
    maxFileSize,
    allowedMimeTypes,
  };
});