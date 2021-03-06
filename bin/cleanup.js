#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const NODE_MODULES_PATH = path.resolve('./node_modules');
const DIST_DIRECTORY = path.resolve('./dist');
const PACKAGE_LOCK = path.resolve('./package-lock.json');

if (fs.existsSync(NODE_MODULES_PATH)) {
    rimraf.sync(NODE_MODULES_PATH);
}

if (fs.existsSync(DIST_DIRECTORY)) {
    rimraf.sync(DIST_DIRECTORY);
}

if (fs.existsSync(PACKAGE_LOCK)) {
    rimraf.sync(PACKAGE_LOCK);
}
