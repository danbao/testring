#!/usr/bin/env node

const { spawn } = require('child_process');
const { exec } = require('child_process');

console.log('测试单个简单的 Playwright 测试...');

// 只运行 alert 测试，这个比较简单
const testProcess = spawn('npm', ['run', 'test:playwright'], {
    cwd: 'packages/e2e-test-app',
    stdio: 'inherit',
    env: { ...process.env, TESTRING_FILTER: 'alert' }
});

testProcess.on('exit', (code, signal) => {
    console.log(`\n[测试脚本] 测试进程正常退出，code: ${code}, signal: ${signal}`);
    
    // 等待2秒让清理完成
    setTimeout(() => {
        exec('pgrep -f "playwright.*chrom" | wc -l', (error, stdout, stderr) => {
            const count = parseInt(stdout.trim());
            console.log(`\n[测试脚本] 正常完成后发现 ${count} 个残留的 chromium 进程`);
            
            if (count > 0) {
                console.log('[测试脚本] 仍有残留，手动清理...');
                exec('pkill -9 -f "playwright.*chrom" 2>/dev/null || true', (error, stdout, stderr) => {
                    console.log('[测试脚本] 手动清理完成');
                    process.exit(0);
                });
            } else {
                console.log('[测试脚本] 没有残留进程，清理机制工作正常');
                process.exit(0);
            }
        });
    }, 2000);
});