#!/usr/bin/env node

/**
 * 分析e2e测试日志，找出超过30秒的步骤
 */

// 从文件读取测试日志内容
function readLogContent() {
    const fs = require('fs');
    const path = require('path');

    try {
        // 尝试读取最新的日志文件 - 从根目录查找
        const logFiles = [
            path.join(__dirname, '..', 'packages', 'e2e-test-app', 'performance-test.log'), // 新的性能测试日志
            path.join(__dirname, '..', 'packages', 'e2e-test-app', 'temp-performance-log.txt'), // 临时日志
            path.join(__dirname, '..', 'packages', 'e2e-test-app', 'e2e-test-output.log'),
            path.join(__dirname, '..', 'packages', 'e2e-test-app', 'e2e-test-iframe-fix.log'),
            path.join(__dirname, '..', 'packages', 'e2e-test-app', 'e2e-test-hybrid-fix.log'),
            path.join(__dirname, '..', 'packages', 'e2e-test-app', 'e2e-test-locator-api.log')
        ];

        for (const logFile of logFiles) {
            if (fs.existsSync(logFile)) {
                console.log(`📖 Reading log file: ${path.relative(process.cwd(), logFile)}`);
                return fs.readFileSync(logFile, 'utf8');
            }
        }

        // 尝试从最近的测试运行中获取日志
        console.log('⚠️  No existing log files found, attempting to run tests and capture logs...');
        return runTestsAndCaptureLog();

    } catch (error) {
        console.error('Error reading log file:', error.message);
        return '';
    }
}

// 运行测试并捕获日志
function runTestsAndCaptureLog() {
    const { execSync } = require('child_process');
    const fs = require('fs');
    const path = require('path');

    try {
        console.log('🚀 Running E2E tests to generate performance data...');

        // 创建临时日志文件路径
        const tempLogFile = path.join(__dirname, '..', 'packages', 'e2e-test-app', 'temp-performance-log.txt');

        // 运行测试并捕获输出
        const testCommand = 'cd packages/e2e-test-app && npm run test:playwright:headless';

        try {
            const output = execSync(testCommand, {
                encoding: 'utf8',
                stdio: 'pipe',
                timeout: 300000, // 5 minutes timeout
                cwd: path.join(__dirname, '..')
            });

            // 保存输出到临时文件
            fs.writeFileSync(tempLogFile, output);
            console.log(`✅ Test completed, log saved to: ${path.relative(process.cwd(), tempLogFile)}`);

            return output;

        } catch (testError) {
            // 即使测试失败，也尝试获取输出
            const output = testError.stdout || testError.stderr || '';
            if (output) {
                fs.writeFileSync(tempLogFile, output);
                console.log(`⚠️  Tests failed but captured output: ${path.relative(process.cwd(), tempLogFile)}`);
                return output;
            }
            throw testError;
        }

    } catch (error) {
        console.error('❌ Failed to run tests:', error.message);
        console.log('📝 Using sample data for demonstration...');

        // 返回示例数据
        return `
13:03:44 | info      | worker/c-9i0_qG5HckiwGKD-FRY | [web-application] [step] Navigating to http://localhost:8080/alert.html
13:03:46 | info      | worker/c-9i0_qG5HckiwGKD-FRY | [web-application] [step] Checking if alert is open
13:03:47 | info      | worker/c-9i0_qG5HckiwGKD-FRY | [web-application] [step] Getting CSS property "background-color" of (//*[@data-test-automation-id='root']//*[@data-test-automation-id='withClass'])[1] for 30000
13:04:17 | info      | worker/c-9i0_qG5HckiwGKD-FRY | [web-application] [step] Getting CSS property "background-color" of (//*[@data-test-automation-id='root']//*[@data-test-automation-id='withStyle'])[1] for 30000
13:04:47 | info      | worker/c-9i0_qG5HckiwGKD-FRY | [web-application] [step] [assert] equal(act = "rgba(139,0,0,1)", exp = "rgba(139,0,0,1)")
13:04:47 | info      | worker/c-9i0_qG5HckiwGKD-FRY | [web-application] [step] Checking if (//*[@data-test-automation-id='root']//*[@data-test-automation-id='withStyle'])[1] has any of the classes customDivClass
13:05:18 | info      | worker/c-9i0_qG5HckiwGKD-FRY | [web-application] [step] Checking if (//*[@data-test-automation-id='root']//*[@data-test-automation-id='withClass'])[1] has any of the classes customDivClass
13:05:48 | info      | worker/c-9i0_qG5HckiwGKD-FRY | [web-application] [step] [assert] equal(act = false, exp = false)
`;
    }
}

const logContent = readLogContent();

function parseTimeFromLog(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

function formatDuration(seconds) {
    if (seconds >= 60) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
}

function analyzeLongSteps() {
    const lines = logContent.trim().split('\n').filter(line => line.trim());
    const longSteps = [];

    // 找到所有包含[step]的行
    const stepLines = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('[step]') && line.match(/\d{2}:\d{2}:\d{2}/)) {
            stepLines.push({
                index: i,
                line: line,
                timeMatch: line.match(/(\d{2}:\d{2}:\d{2})/),
                time: null
            });
        }
    }

    // 计算时间
    stepLines.forEach(step => {
        if (step.timeMatch) {
            step.time = parseTimeFromLog(step.timeMatch[1]);
        }
    });

    // 分析相邻步骤之间的时间间隔
    for (let i = 0; i < stepLines.length - 1; i++) {
        const currentStep = stepLines[i];
        const nextStep = stepLines[i + 1];

        if (currentStep.time !== null && nextStep.time !== null) {
            let duration = nextStep.time - currentStep.time;

            // 处理跨小时的情况
            if (duration < 0) {
                duration += 3600; // 加一小时
            }

            // 只记录超过等于30秒的步骤
            if (duration >= 30) {
                // 提取步骤描述
                const stepMatch = currentStep.line.match(/\[step\] (.+?)(?:\s+for \d+)?$/);
                const stepDescription = stepMatch ? stepMatch[1] : currentStep.line;

                longSteps.push({
                    startTime: currentStep.timeMatch[1],
                    endTime: nextStep.timeMatch[1],
                    duration: duration,
                    description: stepDescription.trim(),
                    fullLine: currentStep.line,
                    worker: currentStep.line.match(/worker\/([^|]+)/)?.[1] || 'unknown'
                });
            }
        }
    }

    return longSteps;
}

function analyzeModerateLongSteps() {
    const lines = logContent.trim().split('\n').filter(line => line.trim());
    const longSteps = [];

    // 找到所有包含[step]的行
    const stepLines = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('[step]') && line.match(/\d{2}:\d{2}:\d{2}/)) {
            stepLines.push({
                index: i,
                line: line,
                timeMatch: line.match(/(\d{2}:\d{2}:\d{2})/),
                time: null
            });
        }
    }

    // 计算时间
    stepLines.forEach(step => {
        if (step.timeMatch) {
            step.time = parseTimeFromLog(step.timeMatch[1]);
        }
    });

    // 分析相邻步骤之间的时间间隔
    for (let i = 0; i < stepLines.length - 1; i++) {
        const currentStep = stepLines[i];
        const nextStep = stepLines[i + 1];

        if (currentStep.time !== null && nextStep.time !== null) {
            let duration = nextStep.time - currentStep.time;

            // 处理跨小时的情况
            if (duration < 0) {
                duration += 3600; // 加一小时
            }

            // 记录超过10秒的步骤
            if (duration > 10) {
                // 提取步骤描述
                const stepMatch = currentStep.line.match(/\[step\] (.+?)(?:\s+for \d+)?$/);
                const stepDescription = stepMatch ? stepMatch[1] : currentStep.line;

                longSteps.push({
                    startTime: currentStep.timeMatch[1],
                    endTime: nextStep.timeMatch[1],
                    duration: duration,
                    description: stepDescription.trim(),
                    fullLine: currentStep.line,
                    worker: currentStep.line.match(/worker\/([^|]+)/)?.[1] || 'unknown'
                });
            }
        }
    }

    return longSteps.sort((a, b) => b.duration - a.duration);
}

function generateReport() {
    const longSteps = analyzeLongSteps();

    console.log('🔍 E2E测试中超过30秒的步骤分析');
    console.log('=' .repeat(80));
    console.log();

    // 调试信息
    console.log('📊 调试信息:');
    console.log(`总共分析了 ${logContent.split('\n').filter(line => line.includes('[step]')).length} 个步骤`);
    console.log();

    if (longSteps.length === 0) {
        console.log('✅ 没有发现超过30秒的步骤');

        // 显示一些较长的步骤（超过10秒）作为参考
        const moderateSteps = analyzeModerateLongSteps();
        if (moderateSteps.length > 0) {
            console.log('\n📋 超过10秒的步骤（参考）:');
            moderateSteps.slice(0, 5).forEach((step, index) => {
                console.log(`${index + 1}. 🕐 持续时间: ${formatDuration(step.duration)}`);
                console.log(`   ⏰ 时间段: ${step.startTime} → ${step.endTime}`);
                console.log(`   👷 Worker: ${step.worker}`);
                console.log(`   📝 步骤: ${step.description}`);
                console.log();
            });
        }
        return;
    }
    
    console.log(`⚠️  发现 ${longSteps.length} 个超过30秒的步骤:\n`);
    
    // 按持续时间排序
    longSteps.sort((a, b) => b.duration - a.duration);
    
    longSteps.forEach((step, index) => {
        console.log(`${index + 1}. 🕐 持续时间: ${formatDuration(step.duration)}`);
        console.log(`   ⏰ 时间段: ${step.startTime} → ${step.endTime}`);
        console.log(`   📝 步骤: ${step.description}`);
        console.log();
    });
    
    // 统计分析
    console.log('📊 统计分析:');
    console.log('-'.repeat(40));
    
    const totalLongTime = longSteps.reduce((sum, step) => sum + step.duration, 0);
    const averageDuration = Math.round(totalLongTime / longSteps.length);
    const maxDuration = Math.max(...longSteps.map(step => step.duration));
    
    console.log(`总计长时间步骤: ${longSteps.length} 个`);
    console.log(`总计额外时间: ${formatDuration(totalLongTime)}`);
    console.log(`平均持续时间: ${formatDuration(averageDuration)}`);
    console.log(`最长持续时间: ${formatDuration(maxDuration)}`);
    
    // 分类分析
    console.log('\n🏷️  步骤类型分析:');
    console.log('-'.repeat(40));
    
    const categories = {};
    longSteps.forEach(step => {
        let category = 'Other';
        
        if (step.description.includes('Clicking for')) {
            category = 'Click Operations';
        } else if (step.description.includes('Getting text') || step.description.includes('Getting CSS')) {
            category = 'Element Queries';
        } else if (step.description.includes('Waiting')) {
            category = 'Wait Operations';
        } else if (step.description.includes('Checking if')) {
            category = 'Element Checks';
        }
        
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(step);
    });
    
    Object.entries(categories).forEach(([category, steps]) => {
        const totalTime = steps.reduce((sum, step) => sum + step.duration, 0);
        console.log(`${category}: ${steps.length} 个步骤, 总计 ${formatDuration(totalTime)}`);
    });

    // 问题分析和建议
    console.log('\n🔧 问题分析和优化建议:');
    console.log('='.repeat(80));

    longSteps.forEach((step, index) => {
        console.log(`\n${index + 1}. ${step.description}`);
        console.log(`   持续时间: ${formatDuration(step.duration)}`);

        let analysis = '';
        let suggestion = '';

        if (step.description.includes('halfHoveredButton') || step.description.includes('partiallyHoveredButton')) {
            analysis = '🔍 问题: 点击被覆盖的按钮，Playwright在非headless模式下等待元素变为可点击';
            suggestion = '💡 建议: 使用force选项或更短的超时时间，或在CI环境使用headless模式';
        } else if (step.description.includes('Getting CSS property')) {
            analysis = '🔍 问题: CSS属性查询超时，可能是元素渲染延迟或选择器问题';
            suggestion = '💡 建议: 检查元素是否存在，优化CSS选择器，或添加元素等待逻辑';
        } else if (step.description.includes('Checking if') && step.description.includes('classes')) {
            analysis = '🔍 问题: 类名检查超时，可能是元素状态变化延迟';
            suggestion = '💡 建议: 添加元素状态等待，或使用更精确的选择器';
        } else if (step.description.includes('Waiting')) {
            analysis = '🔍 问题: 等待操作超时，元素可能不会出现或条件不会满足';
            suggestion = '💡 建议: 检查等待条件是否正确，考虑使用更短的超时或不同的等待策略';
        } else if (step.description.includes('Getting selected text')) {
            analysis = '🔍 问题: 获取选中文本超时，可能是select元素状态问题';
            suggestion = '💡 建议: 确保select元素已正确渲染和选择，添加状态检查';
        } else {
            analysis = '🔍 问题: 步骤执行时间异常长，需要进一步调查';
            suggestion = '💡 建议: 检查网络连接、元素状态、或考虑优化测试逻辑';
        }

        console.log(`   ${analysis}`);
        console.log(`   ${suggestion}`);
    });

    console.log('\n📋 总体优化建议:');
    console.log('-'.repeat(40));
    console.log('1. 🎯 针对被覆盖元素的点击操作，使用force选项或更短超时');
    console.log('2. ⚡ 优化CSS和元素查询，添加适当的等待逻辑');
    console.log('3. 🔄 在CI环境中使用headless模式以获得更一致的性能');
    console.log('4. 📊 考虑将长时间操作的超时时间从30秒减少到更合理的值');
    console.log('5. 🧪 添加更多的中间状态检查，避免长时间等待');
}

function saveReportToFile() {
    const fs = require('fs');
    const path = require('path');

    const longSteps = analyzeLongSteps();
    const moderateSteps = analyzeModerateLongSteps();

    const reportContent = `# E2E测试长时间步骤分析报告

## 执行时间
${new Date().toLocaleString('zh-CN')}

## 概述
- 总共分析了 ${logContent.split('\n').filter(line => line.includes('[step]')).length} 个测试步骤
- 发现 ${longSteps.length} 个超过30秒的步骤
- 发现 ${moderateSteps.length} 个超过10秒的步骤

## 超过30秒的步骤详情

${longSteps.length === 0 ? '✅ 没有发现超过30秒的步骤' : longSteps.map((step, index) => `
### ${index + 1}. ${step.description}

- **持续时间**: ${formatDuration(step.duration)}
- **时间段**: ${step.startTime} → ${step.endTime}
- **Worker**: ${step.worker}
- **完整日志**: \`${step.fullLine}\`

**问题分析**:
${getAnalysisForStep(step)}

**优化建议**:
${getSuggestionForStep(step)}
`).join('\n')}

## 超过10秒的步骤（前10个）

${moderateSteps.slice(0, 10).map((step, index) => `
### ${index + 1}. ${step.description}

- **持续时间**: ${formatDuration(step.duration)}
- **时间段**: ${step.startTime} → ${step.endTime}
- **Worker**: ${step.worker}
`).join('\n')}

## 总体统计

${longSteps.length > 0 ? `
- 总计长时间步骤: ${longSteps.length} 个
- 总计额外时间: ${formatDuration(longSteps.reduce((sum, step) => sum + step.duration, 0))}
- 平均持续时间: ${formatDuration(Math.round(longSteps.reduce((sum, step) => sum + step.duration, 0) / longSteps.length))}
- 最长持续时间: ${formatDuration(Math.max(...longSteps.map(step => step.duration)))}
` : ''}

## 优化建议

1. 🎯 针对被覆盖元素的点击操作，使用force选项或更短超时
2. ⚡ 优化CSS和元素查询，添加适当的等待逻辑
3. 🔄 在CI环境中使用headless模式以获得更一致的性能
4. 📊 考虑将长时间操作的超时时间从30秒减少到更合理的值
5. 🧪 添加更多的中间状态检查，避免长时间等待

## 生成时间
${new Date().toISOString()}
`;

    // 保存到根目录的 docs 文件夹
    const reportPath = path.join(__dirname, '..', 'docs', 'performance-analysis.md');

    // 确保目录存在
    const docsDir = path.dirname(reportPath);
    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, reportContent, 'utf8');
    console.log(`\n📄 详细报告已保存到: ${path.relative(process.cwd(), reportPath)}`);
}

function getAnalysisForStep(step) {
    if (step.description.includes('halfHoveredButton') || step.description.includes('partiallyHoveredButton')) {
        return '🔍 问题: 点击被覆盖的按钮，Playwright在非headless模式下等待元素变为可点击';
    } else if (step.description.includes('Getting CSS property')) {
        return '🔍 问题: CSS属性查询超时，可能是元素渲染延迟或选择器问题';
    } else if (step.description.includes('Checking if') && step.description.includes('classes')) {
        return '🔍 问题: 类名检查超时，可能是元素状态变化延迟';
    } else if (step.description.includes('Waiting')) {
        return '🔍 问题: 等待操作超时，元素可能不会出现或条件不会满足';
    } else if (step.description.includes('Getting selected text')) {
        return '🔍 问题: 获取选中文本超时，可能是select元素状态问题';
    } else {
        return '🔍 问题: 步骤执行时间异常长，需要进一步调查';
    }
}

function getSuggestionForStep(step) {
    if (step.description.includes('halfHoveredButton') || step.description.includes('partiallyHoveredButton')) {
        return '💡 建议: 使用force选项或更短的超时时间，或在CI环境使用headless模式';
    } else if (step.description.includes('Getting CSS property')) {
        return '💡 建议: 检查元素是否存在，优化CSS选择器，或添加元素等待逻辑';
    } else if (step.description.includes('Checking if') && step.description.includes('classes')) {
        return '💡 建议: 添加元素状态等待，或使用更精确的选择器';
    } else if (step.description.includes('Waiting')) {
        return '💡 建议: 检查等待条件是否正确，考虑使用更短的超时或不同的等待策略';
    } else if (step.description.includes('Getting selected text')) {
        return '💡 建议: 确保select元素已正确渲染和选择，添加状态检查';
    } else {
        return '💡 建议: 检查网络连接、元素状态、或考虑优化测试逻辑';
    }
}

if (require.main === module) {
    generateReport();
    saveReportToFile();
}

module.exports = { analyzeLongSteps, generateReport, saveReportToFile };
