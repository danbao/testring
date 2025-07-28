#!/bin/bash

set -e

echo "🚀 部署 Mock Web Server 到 Cloudflare Workers"
echo ""

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ 错误: 请先安装 Wrangler CLI"
    echo "   运行: npm install -g wrangler"
    exit 1
fi

# 检查是否已登录
if ! wrangler whoami &> /dev/null; then
    echo "❌ 错误: 请先登录 Cloudflare"
    echo "   运行: wrangler login"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# Cloudflare Workers 原生支持 TypeScript，无需构建
echo "ℹ️  Cloudflare Workers 原生支持 TypeScript，跳过构建步骤"
echo ""

# 部署
echo "🚀 部署到 Cloudflare Workers..."
npm run deploy:worker

echo ""
echo "🎉 部署完成！"
echo ""
echo "你可以在 Cloudflare Workers 仪表板中查看部署状态：" 
echo "https://dash.cloudflare.com/" 