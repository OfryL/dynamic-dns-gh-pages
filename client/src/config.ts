import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import type { Config } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

loadEnv({ path: resolve(__dirname, '../../.env') });

function getEnvOrDefault(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export function getConfig(): Config {
  return {
    pollIntervalMinutes: parseInt(getEnvOrDefault('POLL_INTERVAL_MINUTES', '15'), 10),
    ipApiUrl: getEnvOrDefault('IP_API_URL', 'https://api.ipify.org?format=json'),
    gitUserName: getEnvOrDefault('GIT_USER_NAME', 'Dynamic DNS Bot'),
    gitUserEmail: getEnvOrDefault('GIT_USER_EMAIL', 'bot@dynamic-dns.local'),
    htmlTemplatePath: getEnvOrDefault('HTML_TEMPLATE_PATH', resolve(__dirname, '../../index.template.html')),
    htmlOutputPath: getEnvOrDefault('HTML_OUTPUT_PATH', resolve(__dirname, '../../../docs/index.html')),
  };
}
