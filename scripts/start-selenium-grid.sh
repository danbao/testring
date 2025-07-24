#!/bin/bash

# Testring Selenium Grid 启动脚本
# 用于本地开发和测试

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/docker"

echo "🚀 Starting Selenium Grid for Testring..."
echo "Project Root: $PROJECT_ROOT"
echo "Docker Config: $DOCKER_DIR/docker-selenium.yml"

# 检查 Docker 是否运行
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# 检查配置文件是否存在
if [ ! -f "$DOCKER_DIR/docker-selenium.yml" ]; then
    echo "❌ Docker Selenium config not found: $DOCKER_DIR/docker-selenium.yml"
    exit 1
fi

# 进入 docker 目录
cd "$DOCKER_DIR"

# 启动 Selenium Grid
echo "📦 Starting Docker containers..."
docker compose -f docker-selenium.yml up -d

# 等待 Grid 就绪
echo "⏳ Waiting for Selenium Grid to be ready..."
timeout=120  # 2 minutes timeout
interval=5
elapsed=0

while [ $elapsed -lt $timeout ]; do
    if curl -f http://localhost:4444/wd/hub/status >/dev/null 2>&1; then
        echo "✅ Selenium Grid is ready!"
        echo ""
        echo "🔍 Grid Info:"
        curl -s http://localhost:4444/wd/hub/status | jq '.' 2>/dev/null || curl -s http://localhost:4444/wd/hub/status
        echo ""
        echo "🌐 Grid UI: http://localhost:4444"
        echo "📡 Grid Hub: http://localhost:4444/wd/hub"
        echo ""
        echo "🧪 To run tests with this Grid:"
        echo "   cd $PROJECT_ROOT"
        echo "   export SELENIUM_GRID_URL=http://localhost:4444/wd/hub"
        echo "   npm run test:playwright:custom-grid"
        echo ""
        break
    fi
    echo "Waiting for Grid... (${elapsed}s/${timeout}s)"
    sleep $interval
    elapsed=$((elapsed + interval))
done

if [ $elapsed -ge $timeout ]; then
    echo "❌ Timeout waiting for Selenium Grid"
    echo "Docker containers status:"
    docker ps
    echo ""
    echo "Hub logs:"
    docker logs selenium-hub-grid4 2>&1 | tail -10
    exit 1
fi

echo "🎉 Selenium Grid is ready for testing!" 