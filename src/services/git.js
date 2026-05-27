const { exec } = require('child_process');
const path = require('path');
const config = require('../../config');

let _pulling = false;

/**
 * Execute git pull in the content directory.
 * Uses a simple lock to prevent concurrent pulls.
 */
function pullContent() {
  return new Promise((resolve, reject) => {
    if (_pulling) {
      return resolve({ skipped: true, reason: 'already pulling' });
    }

    _pulling = true;
    const contentDir = path.resolve(config.contentDir);
    const cmd = `git -C "${contentDir}" reset --hard && git -C "${contentDir}" pull`;

    exec(cmd, { timeout: 30000 }, (err, stdout, stderr) => {
      _pulling = false;
      if (err) {
        return reject(new Error(`git pull failed: ${stderr || err.message}`));
      }
      resolve({ skipped: false, output: stdout.trim() });
    });
  });
}

module.exports = { pullContent };
