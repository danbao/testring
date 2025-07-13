#!/usr/bin/env node

const { spawn } = require('child_process');
const { exec } = require('child_process');

console.log('开始测试 title.spec.js 清理机制...');

// 启动测试进程 - 专门测试 title case
const testProcess = spawn('npm', ['run', 'test:e2e'], {
    cwd: '.',
    stdio: 'pipe',
    detached: false,
    env: { ...process.env, TESTRING_FILTER: 'title' }
});

let output = '';
testProcess.stdout.on('data', (data) => {
    const text = data.toString();
    output += text;
    process.stdout.write(text);
    
    // 如果看到 title 测试开始，记录进程数
    if (text.includes('title') || text.includes('Title')) {
        exec('pgrep -f "playwright.*chrom" | wc -l', (error, stdout, stderr) => {
            const count = parseInt(stdout.trim());
            console.log(`\n[调试] title 测试期间检测到 ${count} 个 chromium 进程`);
        });
    }
});

testProcess.stderr.on('data', (data) => {
    output += data.toString();
    process.stderr.write(data);
});

// 8秒后强制终止测试进程 (更短时间专注 title 测试)
setTimeout(() => {
    console.log('\n[测试脚本] 8秒后强制终止测试进程...');
    testProcess.kill('SIGTERM');
    
    // 再等待3秒检查残留进程
    setTimeout(() => {
        exec('pgrep -f "playwright.*chrom" | wc -l', (error, stdout, stderr) => {
            const count = parseInt(stdout.trim());
            console.log(`\n[测试脚本] title 测试后发现 ${count} 个残留的 chromium 进程`);
            
            // 列出详细的进程信息
            exec('pgrep -af "playwright.*chrom"', (error, stdout, stderr) => {
                if (stdout.trim()) {
                    console.log('[调试] 残留进程详情:');
                    console.log(stdout);
                }
            });
            
            if (count > 0) {
                console.log('[测试脚本] 手动清理残留进程...');
                exec('pkill -9 -f "playwright.*chrom" 2>/dev/null || true', (error, stdout, stderr) => {
                    if (error) {
                        console.error('[测试脚本] 清理失败:', error);
                    } else {
                        console.log('[测试脚本] 清理完成');
                    }
                    process.exit(0);
                });
            } else {
                console.log('[测试脚本] 没有残留进程，清理机制工作正常');
                process.exit(0);
            }
        });
    }, 3000);
}, 8000);

testProcess.on('exit', (code, signal) => {
    console.log(`\n[测试脚本] 测试进程退出，code: ${code}, signal: ${signal}`);
});