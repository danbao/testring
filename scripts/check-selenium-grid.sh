#!/bin/bash

# Selenium Grid 检查脚本
# 检查Grid基本状态和可用性

GRID_URL="http://localhost:4444"

echo "🔍 Checking Selenium Grid at $GRID_URL..."

# 检查Grid是否运行
echo "1. Checking if Grid is running..."
if curl -f -s "$GRID_URL/wd/hub/status" > /dev/null; then
    echo "✅ Grid is running"
else
    echo "❌ Grid is not running or not accessible"
    exit 1
fi

# 获取Grid状态
echo "2. Grid status:"
GRID_STATUS=$(curl -s "$GRID_URL/wd/hub/status" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "$GRID_STATUS" | jq '.' 2>/dev/null || echo "$GRID_STATUS"
else
    echo "Failed to get grid status"
fi



echo "✅ Grid check completed" 