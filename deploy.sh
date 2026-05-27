#!/bin/bash
# diary-site 一键部署脚本
# 在云服务器上运行: bash deploy.sh

set -e

echo "=== 检查环境 ==="
command -v docker >/dev/null 2>&1 || { echo "请先安装 Docker: https://docs.docker.com/engine/install/"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "请先安装 Git"; exit 1; }

# ── 配置区（修改这里） ──
APP_REPO="https://github.com/你的用户名/diary-site.git"      # 项目代码仓库
CONTENT_REPO="https://github.com/你的用户名/diary-content.git" # 日记内容仓库
DOMAIN="levinstark.online"
SITE_PASSWORD="你的密码"
# ─────────────────────

echo "=== 克隆项目 ==="
git clone "$APP_REPO" diary-site
cd diary-site

echo "=== 克隆日记内容仓库 ==="
git clone "$CONTENT_REPO" content

echo "=== 生成密钥 ==="
SESSION_SECRET=$(openssl rand -hex 32)
WEBHOOK_SECRET=$(openssl rand -hex 32)

echo "=== 创建 .env ==="
cat > .env << ENVEOF
PORT=3000
SESSION_SECRET=$SESSION_SECRET
SITE_PASSWORD=$SITE_PASSWORD
WEBHOOK_SECRET=$WEBHOOK_SECRET
CONTENT_DIR=content
ENVEOF

echo "=== 构建并启动 ==="
docker compose up -d --build

echo ""
echo "======================================"
echo "  部署完成！"
echo "  网站: https://$DOMAIN"
echo ""
echo "  GitHub Webhook 配置:"
echo "  URL:    https://$DOMAIN/webhook"
echo "  Secret: $WEBHOOK_SECRET"
echo "======================================"
