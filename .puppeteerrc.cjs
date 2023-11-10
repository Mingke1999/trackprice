const os = require('os');
const path = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer.
  cacheDirectory: path.join(os.homedir(), '.cache', 'puppeteer')
};
