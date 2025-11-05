import { readFile, writeFile } from 'fs/promises';
import { execSync } from 'child_process';
import { dirname } from 'path';
import type { Config } from './types.js';

function execGit(command: string, cwd: string): void {
  try {
    execSync(command, { cwd, stdio: 'pipe' });
  } catch (error) {
    throw new Error(`Git command failed: ${command}\n${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function updateHTMLFile(ip: string, filePath: string): Promise<void> {
  const updatedAt = new Date().toISOString();

  const htmlTemplate = await readFile(filePath, 'utf-8');

  const updatedHTML = htmlTemplate
    .replace(/\{\{IP\}\}/g, ip)
    .replace(/\{\{UPDATED_AT\}\}/g, updatedAt);

  await writeFile(filePath, updatedHTML, 'utf-8');
}

export async function commitAndPush(config: Config, ip: string): Promise<void> {
  const repoRoot = dirname(dirname(config.htmlFilePath));

  execGit(`git config user.name "${config.gitUserName}"`, repoRoot);
  execGit(`git config user.email "${config.gitUserEmail}"`, repoRoot);

  execGit('git add docs/index.html', repoRoot);

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
  await updateHTMLFile(ip, config.htmlFilePath);
  await commitAndPush(config, ip);
}
