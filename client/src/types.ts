export interface IPData {
  ip: string;
  updatedAt: string;
}

export interface Config {
  pollIntervalMinutes: number;
  ipApiUrl: string;
  gitUserName: string;
  gitUserEmail: string;
  ipDataFilePath: string;
}

export type RunMode = 'daemon' | 'once';

export interface IPCheckResult {
  ip: string;
  changed: boolean;
  previousIp?: string;
}
