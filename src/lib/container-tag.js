const { execSync } = require('node:child_process');
const crypto = require('node:crypto');
const { loadProjectConfig } = require('./project-config');

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
}

function getGitRoot(cwd) {
  try {
    const gitRoot = execSync('git rev-parse --show-toplevel', {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return gitRoot || null;
  } catch {
    return null;
  }
}

function getContainerTag(cwd) {
  const projectConfig = loadProjectConfig(cwd);
  if (projectConfig?.personalContainerTag) {
    return projectConfig.personalContainerTag;
  }
  const gitRoot = getGitRoot(cwd);
  const basePath = gitRoot || cwd;
  return `claudecode_project_${sha256(basePath)}`;
}

function sanitizeRepoName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function getRepoContainerTag(cwd) {
  const projectConfig = loadProjectConfig(cwd);
  if (projectConfig?.repoContainerTag) {
    return projectConfig.repoContainerTag;
  }
  const gitRoot = getGitRoot(cwd);
  const basePath = gitRoot || cwd;
  const repoName = basePath.split('/').pop() || 'unknown';
  return `repo_${sanitizeRepoName(repoName)}`;
}

function getProjectName(cwd) {
  const gitRoot = getGitRoot(cwd);
  const basePath = gitRoot || cwd;
  return basePath.split('/').pop() || 'unknown';
}

module.exports = {
  sha256,
  getGitRoot,
  getContainerTag,
  getRepoContainerTag,
  getProjectName,
};
