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
        // For dev publishing, we need to temporarily replace the package.json
        if (isDevPublish) {
            const originalPackageJsonPath = path.join(pkg.location, 'package.json');
            
            // Backup original package.json
            originalPackageJson = fs.readFileSync(originalPackageJsonPath, 'utf8');
            
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
        // Restore original package.json if it was modified
        if (isDevPublish && originalPackageJson) {
            const originalPackageJsonPath = path.join(pkg.location, 'package.json');
            fs.writeFileSync(originalPackageJsonPath, originalPackageJson);
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
