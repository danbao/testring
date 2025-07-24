#!/bin/bash

# Testring Selenium Grid 停止脚本
# 用于本地开发和测试

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/docker"

echo "🛑 Stopping Selenium Grid for Testring..."

# 检查 Docker 是否运行
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running."
    exit 1
fi

# 进入 docker 目录
cd "$DOCKER_DIR"

# 停止并移除容器
echo "📦 Stopping Docker containers..."
docker-compose -f docker-selenium.yml down -v

echo "🧹 Cleaning up..."
# 清理已停止的容器
docker container prune -f >/dev/null 2>&1 || true

echo "✅ Selenium Grid stopped successfully!"

# 显示状态
echo ""
echo "📊 Current Docker containers:"
docker ps -a --filter "name=selenium" --filter "ancestor=selenium/" || echo "No selenium containers found" 