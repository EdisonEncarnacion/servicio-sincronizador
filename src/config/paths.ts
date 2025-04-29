import path from 'path';
import { PROJECT_BASE_PATH } from './env';

export const TENANCY_STORAGE_PATH = path.join(
    PROJECT_BASE_PATH || process.cwd(),
    'storage',
    'app',
    'tenancy',
    'tenants'
);
