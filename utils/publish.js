const path = require('path');
const fs = require('fs');
const batchPackages = require('@lerna/batch-packages');
const {filterPackages} = require('@lerna/filter-packages');
const runParallelBatches = require('@lerna/run-parallel-batches');
const {getPackages} = require('@lerna/project');
const {npmPublish} = require('@jsdevtools/npm-publish');

const token = process.env.NPM_TOKEN;

// Parse command line arguments
const argv = process.argv.slice(2);
let excludeList = [];
let isDevPublish = false;
let githubUsername = '';
let commitId = '';
let isDryRun = false;

for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--exclude=')) {
        excludeList = argv[i].replace('--exclude=', '').split(',').map(s => s.trim());
    } else if (argv[i].startsWith('--dev')) {
        isDevPublish = true;
    } else if (argv[i].startsWith('--github-username=')) {
        githubUsername = argv[i].replace('--github-username=', '');
    } else if (argv[i].startsWith('--commit-id=')) {
        commitId = argv[i].replace('--commit-id=', '');
    } else if (argv[i].startsWith('--dry-run')) {
        isDryRun = true;
    }
}

if (!token && !isDryRun) {
    throw new Error('NPM_TOKEN required');
}

// Function to recursively find all files in a directory
function findFiles(dir, extensions = ['.js', '.ts', '.json', '.d.ts', '.md']) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            files.push(...findFiles(fullPath, extensions));
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Function to replace package references in source files
function replacePackageReferences(pkgLocation) {
    const files = findFiles(pkgLocation);
    
    for (const file of files) {
        try {
            let content = fs.readFileSync(file, 'utf8');
            let modified = false;
            
            // Replace @testring/ with @testring-dev/
            if (content.includes('@testring/')) {
                content = content.replace(/@testring\//g, '@testring-dev/');
                modified = true;
            }
            
            // Replace 'testring' with 'testring-dev' (in quotes)
            if (content.includes("'testring'")) {
                content = content.replace(/'testring'/g, "'testring-dev'");
                modified = true;
            }
            
            if (content.includes('"testring"')) {
                content = content.replace(/"testring"/g, '"testring-dev"');
                modified = true;
            }
            
            // Replace testring with testring-dev (as word boundary)
            if (content.includes('testring ')) {
                content = content.replace(/\btestring\s/g, 'testring-dev ');
                modified = true;
            }
            
            // Replace github.com/ringcentral/testring with git.ringcentral.com/testring/testring-dev
            if (content.includes('github.com/ringcentral/testring')) {
                content = content.replace(/github\.com\/ringcentral\/testring/g, 'git.ringcentral.com/testring/testring-dev');
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(file, content);
                process.stdout.write(`  Modified file: ${path.relative(pkgLocation, file)}\n`);
            }
        } catch (error) {
            process.stderr.write(`Error processing file ${file}: ${error.message}\n`);
        }
    }
}

// Function to restore package references in source files
function restorePackageReferences(pkgLocation) {
    const files = findFiles(pkgLocation);
    
    for (const file of files) {
        try {
            let content = fs.readFileSync(file, 'utf8');
            let modified = false;
            
            // Restore @testring-dev/ with @testring/
            if (content.includes('@testring-dev/')) {
                content = content.replace(/@testring-dev\//g, '@testring/');
                modified = true;
            }
            
            // Restore 'testring-dev' with 'testring' (in quotes)
            if (content.includes("'testring-dev'")) {
                content = content.replace(/'testring-dev'/g, "'testring'");
                modified = true;
            }
            
            if (content.includes('"testring-dev"')) {
                content = content.replace(/"testring-dev"/g, '"testring"');
                modified = true;
            }
            
            // Restore testring-dev with testring (as word boundary)
            if (content.includes('testring-dev ')) {
                content = content.replace(/\btestring-dev\s/g, 'testring ');
                modified = true;
            }
            
            // Restore git.ringcentral.com/testring/testring-dev with github.com/ringcentral/testring
            if (content.includes('git.ringcentral.com/testring/testring-dev')) {
                content = content.replace(/git\.ringcentral\.com\/testring\/testring-dev/g, 'github.com/ringcentral/testring');
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(file, content);
                process.stdout.write(`  Restored file: ${path.relative(pkgLocation, file)}\n`);
            }
        } catch (error) {
            process.stderr.write(`Error processing file ${file}: ${error.message}\n`);
        }
    }
}

// Function to modify package.json for dev publishing
function createDevPackageJson(pkg) {
    const packageJsonPath = path.join(pkg.location, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Create dev version: original-version-username-commitid
    const devVersion = `${packageJson.version}-${githubUsername}-${commitId}`;

    // Transform package name
    let devName;
    if (packageJson.name === 'testring') {
        devName = 'testring-dev';
    } else if (packageJson.name.startsWith('@testring/')) {
        devName = packageJson.name.replace('@testring/', '@testring-dev/');
    } else {
        devName = packageJson.name; // Keep original name if it doesn't match expected patterns
    }

    // Create modified package.json
    const devPackageJson = {
        ...packageJson,
        name: devName,
        version: devVersion
    };

    // Transform dependencies to use dev versions
    if (devPackageJson.dependencies) {
        for (const [depName, depVersion] of Object.entries(devPackageJson.dependencies)) {
            if (depName === 'testring') {
                devPackageJson.dependencies[depName] = `${depVersion}-${githubUsername}-${commitId}`;
            } else if (depName.startsWith('@testring/')) {
                devPackageJson.dependencies[depName] = `${depVersion}-${githubUsername}-${commitId}`;
            }
        }
    }

    return devPackageJson;
}

async function task(pkg) {
    let displayName = pkg.name;
    let devPackageJson = null;
    let originalPackageJson = null;

    if (isDevPublish) {
        devPackageJson = createDevPackageJson(pkg);
        displayName = devPackageJson.name;
    }

    process.stdout.write(
        `Publishing package: ${displayName}...\n  path: ${pkg.location}\n`,
    );
    let published = false;
    try {
        // For dev publishing, we need to temporarily replace the package.json and source files
        if (isDevPublish) {
            const originalPackageJsonPath = path.join(pkg.location, 'package.json');
            
            // Backup original package.json
            originalPackageJson = fs.readFileSync(originalPackageJsonPath, 'utf8');
            
            // Replace package references in source files
            replacePackageReferences(pkg.location);
            
            // Replace with dev version
            fs.writeFileSync(originalPackageJsonPath, JSON.stringify(devPackageJson, null, 2));
        }
        
        if (isDryRun) {
            process.stdout.write(`  [DRY RUN] Would publish package: ${displayName}\n`);
            process.stdout.write(`  [DRY RUN] Package location: ${pkg.location}\n`);
            if (isDevPublish) {
                process.stdout.write(`  [DRY RUN] Dev package name: ${displayName}\n`);
                process.stdout.write(`  [DRY RUN] Dev package version: ${devPackageJson.version}\n`);
            }
            published = true; // Mark as "published" for dry run
        } else {
            await npmPublish({
                package: pkg.location,
                token,
                access: 'public'
            });
            published = true;
        }
    } catch (error) {
        process.stderr.write(error.toString());
    } finally {
        // Restore original package.json and source files if they were modified
        if (isDevPublish && originalPackageJson) {
            const originalPackageJsonPath = path.join(pkg.location, 'package.json');
            fs.writeFileSync(originalPackageJsonPath, originalPackageJson);
            
            // Restore package references in source files
            restorePackageReferences(pkg.location);
        }
    }

    return {
        name: displayName,
        location: pkg.location,
        published,
    };
}

async function main() {
    // Validate dev publish parameters
    if (isDevPublish) {
        if (!githubUsername) {
            throw new Error('--github-username is required for dev publishing');
        }
        if (!commitId) {
            throw new Error('--commit-id is required for dev publishing');
        }
            process.stdout.write(`Dev publishing mode enabled:\n`);
    process.stdout.write(`  GitHub username: ${githubUsername}\n`);
    process.stdout.write(`  Commit ID: ${commitId}\n`);
    if (isDryRun) {
        process.stdout.write(`  Dry run mode: enabled\n`);
    }
    }

    const packages = await getPackages(__dirname);
    const filtered = filterPackages(packages, [], excludeList, false);
    const batchedPackages = batchPackages(filtered);

    try {
        const packagesBatchDescriptors = await runParallelBatches(
            batchedPackages,
            2,
            task,
        );
        const packagesDescriptors = packagesBatchDescriptors.reduce(
            (pkgs, batch) => pkgs.concat(batch),
            [],
        );
        const totalPackages = packagesDescriptors.reduce(
            (acc, item) => (acc += item.published ? 1 : 0),
            0,
        );

        process.stdout.write(`Packages published: ${totalPackages}\n`);
    } catch (e) {
        process.stderr.write(e.toString());
    }
}

main().catch(() => process.exit(1));
