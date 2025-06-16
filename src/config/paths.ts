import path from 'path';
import { config } from './env';

export const TENANCY_STORAGE_PATH = path.join(
    config.PROJECT_BASE_PATH || process.cwd(),
    'storage',
    'app',
    'tenancy',
    'tenants'
);
