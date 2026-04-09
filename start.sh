#!/bin/bash

# 台股投信买超筛选系统 - 启动脚本

echo "╔════════════════════════════════════════════════════╗"
echo "║  台股投信买超筛选系统 - 快速启动                   ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# 检查 Docker
echo "📦 检查 Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装或不在 PATH 中"
    echo "请安装 Docker: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker 已安装"
echo ""

# 创建 .env 文件（如果不存在）
if [ ! -f .env ]; then
    echo "⚙️  创建环境文件 .env..."
    cp .env.example .env
    echo "✅ .env 已创建（使用默认配置）"
    echo ""
fi

# 启动服务
echo "🚀 启动 Docker 服务..."
docker compose up -d

echo ""
echo "⏳ 等待服务启动（约 30 秒）..."
sleep 15

# 检查服务状态
echo ""
echo "📋 检查服务状态..."
docker compose ps

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║  ✅ 服务已启动！                                  ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "📱 访问应用:"
echo "   前端:      http://localhost:3001"
echo "   后端 API:  http://localhost:3000/api"
echo "   健康检查:  http://localhost:3000/api/health"
echo ""
echo "📖 查看日志:"
echo "   docker compose logs -f"
echo ""
echo "🛑 停止服务:"
echo "   docker compose down"
echo ""
