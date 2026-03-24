const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKEND_PORT = 5000;
const FRONTEND_PORT = 5174;
const API_JS_PATH = path.join(__dirname, 'client', 'src', 'api.js');

console.log('🚀 Starting Share Pipeline...');

// Clear old output
fs.writeFileSync(path.join(__dirname, 'tunnel_output.txt'), '');

// 1. Start Backend Tunnel
const backendTunnel = exec(`npx -y localtunnel --port ${BACKEND_PORT}`);

backendTunnel.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('your url is:')) {
        const backendUrl = output.split('your url is:')[1].trim();
        console.log(`✅ Backend online: ${backendUrl}`);
        fs.appendFileSync(path.join(__dirname, 'tunnel_output.txt'), `Backend: ${backendUrl}\n`);

        // 2. Update client/src/api.js WITH the new tunnel URL
        let apiContent = fs.readFileSync(API_JS_PATH, 'utf-8');
        apiContent = apiContent.replace(
            /const BASE_URL = 'http:\/\/localhost:5000\/api';/,
            `const BASE_URL = '${backendUrl}/api';`
        );
        fs.writeFileSync(API_JS_PATH, apiContent);
        console.log('📝 Updated client/src/api.js');

        // 3. Start Frontend Tunnel
        const frontendTunnel = exec(`npx -y localtunnel --port ${FRONTEND_PORT}`);
        frontendTunnel.stdout.on('data', (frontData) => {
            const frontOutput = frontData.toString();
            if (frontOutput.includes('your url is:')) {
                const frontendUrl = frontOutput.split('your url is:')[1].trim();
                fs.appendFileSync(path.join(__dirname, 'tunnel_output.txt'), `Frontend: ${frontendUrl}\n`);
                console.log('\n=============================================');
                console.log('🎉 SHARE THIS LINK WITH YOUR FRIEND:');
                console.log(`👉 ${frontendUrl}`);
                console.log('=============================================\n');
                console.log('ℹ️  Localtunnel requires a bypass password if visiting via phone.');
                console.log('Your friend should enter YOUR public IP address when prompted.');
                console.log('You can find your IP here: https://loca.lt/mytunnelpassword');
                console.log('=============================================\n');
            }
        });
    }
});

backendTunnel.stderr.on('data', (data) => console.error(`Backend Tunnel Error: ${data}`));
