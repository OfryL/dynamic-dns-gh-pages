import { writeFile } from 'fs/promises';
import { execSync } from 'child_process';
import { dirname } from 'path';
import type { IPData, Config } from './types.js';

function execGit(command: string, cwd: string): void {
  try {
    execSync(command, { cwd, stdio: 'pipe' });
  } catch (error) {
    throw new Error(`Git command failed: ${command}\n${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function updateIPFile(ip: string, filePath: string): Promise<void> {
  const data: IPData = {
    ip,
    updatedAt: new Date().toISOString(),
  };

  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function commitAndPush(config: Config, ip: string): Promise<void> {
  const repoRoot = dirname(dirname(dirname(config.ipDataFilePath)));

  execGit(`git config user.name "${config.gitUserName}"`, repoRoot);
  execGit(`git config user.email "${config.gitUserEmail}"`, repoRoot);

  execGit('git add docs/ip.json', repoRoot);

  try {
    execGit(`git commit -m "Update IP to ${ip}"`, repoRoot);
    execGit('git push', repoRoot);
    console.log(`✓ Successfully committed and pushed IP update: ${ip}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('nothing to commit')) {
      console.log('No changes to commit');
    } else {
      throw error;
    }
  }
}

export async function updateAndCommit(config: Config, ip: string): Promise<void> {
  await updateIPFile(ip, config.ipDataFilePath);
  await commitAndPush(config, ip);
}
