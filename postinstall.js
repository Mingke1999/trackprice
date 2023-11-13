const { exec } = require('child_process');
const path = require('path');

const puppeteerFolderPath = path.join(__dirname, '../node_modules/puppeteer');

// Change the current working directory to the puppeteer folder
process.chdir(puppeteerFolderPath);

// Run npm install
exec('npm install', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error during npm install: ${error.message}`);
    process.exit(1);
  }
  if (stderr) {
    console.error(`npm install stderr: ${stderr}`);
    process.exit(1);
  }
  console.log(`npm install stdout: ${stdout}`);
});
