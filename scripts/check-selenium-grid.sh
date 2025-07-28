#!/bin/bash

# Selenium Grid 检查脚本
# 统一检查Grid状态和可用性

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

# 检查可用会话
echo "3. Available sessions:"
SESSIONS=$(curl -s "$GRID_URL/wd/hub/sessions" 2>/dev/null)
if [ $? -eq 0 ] && [ -n "$SESSIONS" ]; then
    echo "$SESSIONS" | jq '.' 2>/dev/null || echo "$SESSIONS"
else
    echo "No sessions information available"
fi

# 尝试获取Grid信息（兼容不同版本）
echo "4. Grid information:"
GRID_INFO=$(curl -s "$GRID_URL/grid/api/hub" 2>/dev/null)
if [ $? -eq 0 ] && [ -n "$GRID_INFO" ]; then
    echo "$GRID_INFO" | jq '.' 2>/dev/null || echo "$GRID_INFO"
else
    echo "Grid API endpoint not available (this is normal for some Grid versions)"
fi

echo "✅ Grid check completed" 