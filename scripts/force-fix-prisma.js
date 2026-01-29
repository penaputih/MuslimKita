
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const src = path.join(process.cwd(), 'prisma', 'schema.prisma');
const destDir = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
const dest = path.join(destDir, 'schema.prisma');

try {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    console.log(`Copying ${src} to ${dest}...`);
    fs.copyFileSync(src, dest);
    console.log('Copy successful.');

    console.log('Running prisma generate...');
    execSync('npx prisma generate', { stdio: 'inherit', cwd: process.cwd() });
    console.log('Prisma generate successful.');

    // Verify verificationCode
    const newContent = fs.readFileSync(dest, 'utf8');
    if (newContent.includes('verificationCode')) {
        console.log('SUCCESS: verificationCode is present in generated schema.');
    } else {
        console.error('FAILURE: verificationCode is MISSING in generated schema after generate.');
    }

} catch (e) {
    console.error('Detailed Error:', e);
}
