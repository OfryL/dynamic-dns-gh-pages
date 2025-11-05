import { readFile } from 'fs/promises';
import type { IPData, IPCheckResult, Config } from './types.js';

export async function fetchCurrentIP(apiUrl: string): Promise<string> {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch IP: ${response.status} ${response.statusText}`);
    }
    const data = await response.json() as { ip: string };
    return data.ip;
  } catch (error) {
    throw new Error(`Failed to fetch current IP: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function loadPreviousIP(filePath: string): Promise<string | undefined> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content) as IPData;
    return data.ip;
  } catch {
    return undefined;
  }
}

export async function checkIPChange(config: Config): Promise<IPCheckResult> {
  const currentIP = await fetchCurrentIP(config.ipApiUrl);
  const previousIP = await loadPreviousIP(config.ipDataFilePath);

  const changed = currentIP !== previousIP;

  return {
    ip: currentIP,
    changed,
    previousIp: previousIP,
  };
}
