# Dynamic DNS with GitHub Pages

A TypeScript-based dynamic DNS solution that monitors your public IP address and automatically updates a GitHub Pages site to redirect visitors to your current IP.

## Table of Contents

1. [Overview](#1-overview)
2. [Features](#2-features)
3. [Architecture](#3-architecture)
4. [Prerequisites](#4-prerequisites)
5. [Installation](#5-installation)
6. [Configuration](#6-configuration)
7. [Deployment Methods](#7-deployment-methods)
   - [7.1 Long-Running Process (Daemon)](#71-long-running-process-daemon)
   - [7.2 Cron Job](#72-cron-job)
   - [7.3 Docker Container](#73-docker-container)
   - [7.4 GitHub Actions](#74-github-actions)
8. [GitHub Pages Setup](#8-github-pages-setup)
9. [Project Structure](#9-project-structure)
10. [Development](#10-development)
11. [Troubleshooting](#11-troubleshooting)
12. [License](#12-license)

---

## 1. Overview

This project automatically:
1. Polls your public IP address at configurable intervals
2. Detects IP address changes
3. Updates the HTML file with embedded IP data
4. Commits and pushes changes to GitHub
5. Serves a GitHub Pages site that redirects visitors to your current IP

---

## 2. Features

✓ **TypeScript** - Type-safe, maintainable code
✓ **Configurable Polling** - Set check interval via environment variable
✓ **Multiple Deployment Options** - Daemon, cron, or Docker (local execution)
✓ **Automatic Git Integration** - Commits and pushes IP changes
✓ **GitHub Pages Redirect** - Meta refresh redirect to your current IP
✓ **Auto-Deploy** - GitHub Actions automatically deploys changes
✓ **Zero JavaScript** - Redirect page uses pure HTML with meta tags
✓ **SEO-Friendly** - IP data stored in meta tags for crawlers
✓ **Error Handling** - Comprehensive error handling and logging

---

## 3. Architecture

```mermaid
graph TD
    A[IP Checker] -->|Fetch from API| B[Current IP]
    B -->|Compare| C{IP Changed?}
    C -->|Yes| D[Update HTML Template]
    C -->|No| E[Skip Update]
    D --> F[Git Commit & Push]
    F --> G[GitHub Repository]
    G --> H[GitHub Pages]
    H --> I[Meta Refresh Redirect]
    I --> J[http://your.ip.address]
```

**Components:**
- **TypeScript Client**: Monitors IP and manages git operations
- **client/index.template.html**: HTML template with placeholders
- **docs/index.html**: Generated output with actual IP data and redirect
- **Template System**: Uses placeholders ({{IP}}, {{UPDATED_AT}}) for dynamic content
- **GitHub Actions**: Automatic Pages deployment when docs/ changes

---

## 4. Prerequisites

- Node.js 20+ (for local/cron deployment)
- Git with push access to this repository
- Docker (optional, for containerized deployment)
- GitHub account with Pages enabled

---

## 5. Installation

### Clone and Install

```bash
git clone <your-repo-url>
cd dynamic-dns-gh-pages/client
npm install
```

### Build the Client

```bash
npm run build
```

---

## 6. Configuration

### Environment Variables

Copy `env.template` to `.env` and configure:

```bash
cd client
cp env.template .env
```

**Available Options:**

| Variable | Default | Description |
|----------|---------|-------------|
| `POLL_INTERVAL_MINUTES` | `15` | How often to check IP (in minutes) |
| `IP_API_URL` | `https://api.ipify.org?format=json` | API endpoint for IP detection |
| `GIT_USER_NAME` | `Dynamic DNS Bot` | Git commit author name |
| `GIT_USER_EMAIL` | `bot@dynamic-dns.local` | Git commit author email |
| `HTML_TEMPLATE_PATH` | `client/index.template.html` | Path to HTML template file (optional) |
| `HTML_OUTPUT_PATH` | `docs/index.html` | Path to output HTML file (optional) |

**Alternative IP APIs:**
- `https://api.ipify.org?format=json`
- `https://ifconfig.me/all.json`
- `https://api.my-ip.io/ip.json`

---

## 7. Deployment Methods

### 7.1 Long-Running Process (Daemon)

Run as a continuous background process:

```bash
cd client
npm run daemon
```

This will:
- Check IP immediately
- Poll every `POLL_INTERVAL_MINUTES` minutes
- Run until stopped (Ctrl+C)

**Use with Process Manager (pm2):**

```bash
cd client
npm install -g pm2
pm2 start npm --name "dynamic-dns" -- run daemon
pm2 save
pm2 startup
```

---

### 7.2 Cron Job

Run as a scheduled task using cron:

1. **Make script executable:**
   ```bash
   chmod +x client/scripts/run-once.sh
   ```

2. **Add to crontab:**
   ```bash
   crontab -e
   ```

3. **Add entry (runs every 15 minutes):**
   ```cron
   */15 * * * * /path/to/dynamic-dns-gh-pages/client/scripts/run-once.sh
   ```

4. **Create logs directory:**
   ```bash
   mkdir -p logs
   ```

---

### 7.3 Docker Container

Run in a containerized environment:

#### Build and Run

```bash
cd client
docker-compose up -d
```

#### View Logs

```bash
docker-compose logs -f
```

#### Stop Container

```bash
docker-compose down
```

**Docker Setup Requirements:**

1. **SSH Keys** (for git push):
   ```bash
   mkdir -p client/ssh-keys
   cp ~/.ssh/id_rsa client/ssh-keys/
   cp ~/.ssh/id_rsa.pub client/ssh-keys/
   ```

2. **Configure Environment:**
   Edit `client/docker-compose.yml` or create `client/.env` file

---

### 7.4 GitHub Actions (Pages Deployment Only)

The GitHub Actions workflow automatically deploys the GitHub Pages site when changes are pushed to the `docs/` directory.

**What it does:**

- Triggers on push to `main` branch when `docs/**` files change
- Deploys static content from `docs/` folder to GitHub Pages
- No IP checking or client execution

**Manual Trigger:**

Go to Actions tab → "Deploy GitHub Pages" → "Run workflow"

**Note:** This workflow only handles GitHub Pages deployment. IP checking and updates must be run locally using one of the other deployment methods (daemon, cron, or Docker).

---

## 8. GitHub Pages Setup

### Enable GitHub Pages

1. Go to repository **Settings**
2. Navigate to **Pages** section
3. Under **Source**, select:
   - **Build and deployment**: GitHub Actions
4. The workflow will automatically deploy when you push changes to `docs/`

### Access Your Site

After the workflow runs, your site will be available at:

```
https://<your-username>.github.io/<repo-name>/
```

The page will automatically redirect visitors to `http://<your-current-ip>`

### How Deployment Works

1. Local client updates `docs/index.html` with current IP
2. Changes are committed and pushed to GitHub
3. GitHub Actions workflow detects changes in `docs/`
4. Workflow automatically deploys to GitHub Pages
5. Site is updated within seconds

---

## 9. Project Structure

```
dynamic-dns-gh-pages/
├── README.md                       # This file
├── .gitignore                      # Git ignore patterns
├── .github/
│   └── workflows/
│       └── update-ip.yml           # GitHub Actions workflow
├── docs/                           # GitHub Pages content
│   └── index.html                  # Generated redirect page with IP data
└── client/                         # TypeScript client
    ├── src/
    │   ├── index.ts                # Main entry point
    │   ├── ip-checker.ts           # IP detection logic
    │   ├── git-updater.ts          # Git operations
    │   ├── config.ts               # Configuration management
    │   └── types.ts                # TypeScript interfaces
    ├── scripts/
    │   └── run-once.sh             # Cron execution script
    ├── index.template.html         # HTML template with placeholders
    ├── package.json                # Client dependencies
    ├── tsconfig.json               # TypeScript configuration
    ├── Dockerfile                  # Docker build instructions
    ├── docker-compose.yml          # Docker Compose configuration
    └── env.template                # Environment variables template
```

---

## 10. Development

### Build

```bash
cd client
npm run build
```

### Run Once (Single Check)

```bash
cd client
npm run once
```

### Watch Mode (Auto-rebuild)

```bash
cd client
npm run dev
```

### Clean Build Artifacts

```bash
cd client
npm run clean
```

---

## 11. Troubleshooting

### IP Not Updating

1. **Check logs:**
   ```bash
   # Daemon mode
   docker-compose logs -f

   # Cron mode
   tail -f logs/ip-check.log
   ```

2. **Verify git credentials:**
   ```bash
   git config user.name
   git config user.email
   ```

3. **Test git push manually:**
   ```bash
   git push
   ```

### GitHub Pages Not Redirecting

1. **Verify Pages is enabled** in repository settings
2. **Check `docs/index.html` exists** and has IP placeholders filled
3. **Wait 1-2 minutes** for Pages to rebuild
4. **Verify meta tags** in HTML source contain actual IP (not {{IP}} placeholder)

### Permission Errors

**Docker SSH Issues:**

```bash
# Ensure SSH keys have correct permissions
chmod 600 client/ssh-keys/id_rsa
chmod 644 client/ssh-keys/id_rsa.pub
```

**Git Push Authentication:**

- For HTTPS: Use personal access token
- For SSH: Ensure SSH keys are configured in GitHub

---

## 12. License

MIT License - Feel free to use and modify as needed.

---

**Questions or Issues?**

Open an issue in this repository for support.
