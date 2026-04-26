# Learning Platform Final Implementation Plan

## 目标

把当前 `math` 项目直接改造成最终形态的多学科学习平台 `learning`，首批学科为数学和英语，后续可扩展历史、科学等学科。

已完成前置条件：
- GitHub 仓库已调整为 `https://github.com/cleef/learning`。
- `learning.chat1.co` DNS 已设置。

本计划不再采用“先保留 light-math 命名、后续再迁移”的过渡方案，而是直接按照最终目标结构改造。

## 最终结构

目标目录：

```text
/Users/lee/git/learning
├── light-learning-hub/          # Learning 首页、学科导航、学科页、应用详情与启动
├── light-learning-apps/         # 各学科学习应用集合、构建脚本、静态 host、API gateway
│   ├── apps/
│   │   ├── fraction-lab/
│   │   ├── pi-approx-lab/
│   │   └── english-phonics-lab/
│   ├── docs/
│   ├── scripts/
│   └── server/
├── docs/
├── memory/
├── scripts/
│   └── deploy-learning-chat1.sh
├── SOUL.md
├── MEMORY.md
└── README.md
```

从当前结构迁移：

```text
light-math-hub/  -> light-learning-hub/
light-maths/     -> light-learning-apps/
```

本地仓库目录建议同步改名：

```text
/Users/lee/git/math -> /Users/lee/git/learning
```

## 核心保留契约

虽然目录命名改为 `learning`，现有 app 运行契约继续保留：

- 每个应用仍位于 `light-learning-apps/apps/<id>/`。
- 每个应用仍有 `light-app.json`。
- 应用 Vite `base` 仍为 `/apps/<id>/`。
- 构建输出改为 `light-learning-apps/dist/apps/<id>/`。
- 线上访问路径仍为 `/apps/<id>/`。
- Learning Hub 的 `/run/:id` 仍重定向到应用 `entryPath`。

保持 `/apps/<id>/` 不变，可以避免数学应用路径和部署结构被无意义打断。

## 首页与路由

`learning.chat1.co` 首页不再做传统应用商店式 Hub。最终产品形态是轻量 Learning Shell：

```text
https://learning.chat1.co/
├── Math
├── English
└── Future subjects: History / Science / ...
```

首页原则：
- 顶部或左侧主导航只展示学科。
- 首页主体接近 ChatGPT 风格：简洁输入/选择入口，让学习者快速进入学科。
- 不在首页展示完整应用卡片列表。
- 应用列表放在学科页内部。
- 文案克制，避免用说明文字替代清晰结构。

最终路由：

```text
/                         # Learning Shell 首页
/math                      # 数学学科页，展示数学应用
/english                   # 英语学科页，展示英语应用
/history                   # 未来学科
/app/<id>                  # 应用详情
/run/<id>                  # 启动重定向
/apps/<id>/                # 应用静态入口
/apps/<id>/game-spotlight.html
```

公开 URL 不使用 `/subject/...`。`subject` 只作为内部注册表字段和路由参数语义，用户看到的是更短的 `/math`、`/english`。

## Hub 注册表

注册表从数学应用列表升级为跨学科学习应用列表：

```text
light-learning-hub/src/data/apps.json
```

每个应用增加 `subject`：

```json
{
  "id": "english-phonics-lab",
  "subject": "english",
  "name": "自然拼读实验室",
  "icon": "Aa",
  "description": "通过音素、口型和拼写模式学习自然拼读。",
  "listed": true,
  "enabled": true,
  "tags": ["phonics", "grade-5"],
  "permissions": ["light.subject.english", "light.app.english.phonics.lab"],
  "entryPath": "/apps/english-phonics-lab/"
}
```

迁移要求：
- 现有数学应用全部补充 `"subject": "math"`。
- 未设置 `subject` 的旧应用在代码中可临时 fallback 为 `math`，但迁移完成后注册表应显式写全。
- `currentUser.ts` 加入学科级权限：

```ts
light.subject.math
light.subject.english
```

过滤规则：
- 首页只显示学科入口。
- `/:subject` 学科页显示 `enabled === true && listed !== false`、权限允许、且 `subject` 匹配的应用。
- `/app/:id` 和 `/run/:id` 继续按 app id 查找。

路由实现要求：
- `/:subject` 不能做无约束 catch-all。
- 学科必须来自显式白名单，例如 `math`、`english`、`history`、`science`。
- React Router 中固定路由必须优先于学科路由声明：`/app/:id`、`/run/:id`、`/apps/*` 先匹配，学科路由最后匹配。
- 如果路径不是合法 subject，返回 404 或回到首页，不应误当成空学科页。

## 英语首个应用

首个英语应用直接按最终结构创建：

```text
light-learning-apps/apps/english-phonics-lab/
├── light-app.json
├── package.json
├── vite.config.ts
├── index.html
├── game-spotlight.html
└── src/
```

Vite 配置：

```ts
base: "/apps/english-phonics-lab/"
```

构建输出：

```text
../../dist/apps/english-phonics-lab
```

第一版内容范围：
- 音素学习卡：sound / mouth / pattern / contrast。
- 拼写模式：如 `air`, `ear`, `are`。
- 练习类型：Sound to Word、Word to Sound、Underline Match、Contrast Choice。
- 每日计划：25 天音素训练 + 5 天复习。

可复用资料：
- `docs/phonics-system.md`
- `docs/exam_revision/english_*.md`

## Git 调整

目标远程仓库已确定：

```text
https://github.com/cleef/learning
```

本地确认：

```bash
cd /Users/lee/git/learning
git remote -v
```

如果本地目录仍叫 `/Users/lee/git/math`，执行目录改名后再进入：

```bash
cd /Users/lee/git
mv math learning
cd learning
git remote -v
```

如远程尚未在本地生效：

```bash
git remote set-url origin https://github.com/cleef/learning.git
git push -u origin main
```

如果当前分支不是 `main`，先确认并按实际分支推送：

```bash
git branch --show-current
```

## 部署脚本

最终只保留 learning 部署脚本作为主脚本：

```text
scripts/deploy-learning-chat1.sh
```

旧脚本处理：

```text
scripts/deploy-math-chat1.sh -> 删除，或仅保留为 deprecated 文档引用
```

默认参数：

```bash
REMOTE_HOST="root@47.116.122.50"
DOMAIN="learning.chat1.co"
REMOTE_BASE="/var/www/learning.chat1.co"
LOCAL_RELEASE_DIR="/tmp/light-learning-release-$RELEASE_ID"
```

构建步骤改为最终目录：

```bash
cd "$ROOT_DIR/light-learning-hub" && npm run build
cd "$ROOT_DIR/light-learning-apps" && npm run build:all
```

发布规则：
- `light-learning-hub/dist` 发布到站点根目录。
- 从 `light-learning-hub/src/data/apps.json` 读取 `enabled && listed` 应用。
- 每个应用从 `light-learning-apps/dist/apps/<id>` 发布到 `/apps/<id>/`。

线上 smoke check：

```bash
curl -I -m 10 -sS https://learning.chat1.co/
curl -I -m 10 -sS https://learning.chat1.co/math
curl -I -m 10 -sS https://learning.chat1.co/english
curl -I -m 10 -sS https://learning.chat1.co/apps/<id>/
```

## Nginx 与 HTTPS

DNS 已设置后，服务器需要完成 Nginx 和证书。

线上服务器：

```text
root@47.116.122.50
```

现有 `math.chat1.co` 可作为参考：

```text
/etc/nginx/sites-available/math.chat1.co.conf
/etc/nginx/sites-enabled/math.chat1.co.conf -> /etc/nginx/sites-available/math.chat1.co.conf
/etc/letsencrypt/live/math.chat1.co/fullchain.pem
/etc/letsencrypt/live/math.chat1.co/privkey.pem
```

当前线上证书状态：
- `math.chat1.co` 使用独立 Certbot certificate。
- `chat1.co` 证书只覆盖 `chat1.co`、`mi.chat1.co`、`www.chat1.co`，不覆盖 `learning.chat1.co`。
- 线上已有 `certbot-renew.timer`，证书续期由 systemd timer 自动触发。

站点目录：

```text
/var/www/learning.chat1.co/current
```

### 1. 准备站点目录

`current` 由部署脚本创建为 release symlink，不手工预建为普通目录。只预建 release 根目录：

```bash
ssh root@47.116.122.50
mkdir -p /var/www/learning.chat1.co/releases
chown -R nginx:nginx /var/www/learning.chat1.co
```

新 `deploy-learning-chat1.sh` 必须继承现有 `deploy-math-chat1.sh` 的 guard：
- 如果 `$REMOTE_BASE/current` 已存在且是普通目录，部署时先改名备份为 `$REMOTE_BASE/current.dir.bak.$RELEASE_ID`。
- 然后再执行 `ln -sfn $REMOTE_RELEASE_DIR $REMOTE_BASE/current`。
- 这样首次部署和后续发布都统一使用 `current -> releases/<release-id>` 的 symlink 结构。

### 2. 先创建 HTTP 配置

先写入 `/etc/nginx/sites-available/learning.chat1.co.conf`，此时不要手工写 HTTPS 证书路径，让 Certbot 接管：

```nginx
server {
    listen 80;
    server_name learning.chat1.co;

    root /var/www/learning.chat1.co/current;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

启用站点：

```bash
ln -sfn /etc/nginx/sites-available/learning.chat1.co.conf /etc/nginx/sites-enabled/learning.chat1.co.conf
nginx -t
systemctl reload nginx
```

### 3. 申请 HTTPS 证书

按现有 `math.chat1.co` 的模式，为 `learning.chat1.co` 申请独立证书：

```bash
certbot --nginx -d learning.chat1.co
```

成功后，Certbot 会自动把配置改成类似：

```nginx
server {
    server_name learning.chat1.co;

    root /var/www/learning.chat1.co/current;
    index index.html;

    location ~ ^/apps/([^/]+)/ {
        try_files $uri $uri/ /apps/$1/index.html;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/learning.chat1.co/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/learning.chat1.co/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = learning.chat1.co) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name learning.chat1.co;
    return 404; # managed by Certbot
}
```

如果 Certbot 没有保留 `/apps/<id>/` fallback，需要手工补回：

```nginx
location ~ ^/apps/([^/]+)/ {
    try_files $uri $uri/ /apps/$1/index.html;
}
```

### 4. 验证证书和自动续期

申请后验证：

```bash
nginx -t
systemctl reload nginx
curl -I https://learning.chat1.co/
certbot certificates
certbot renew --dry-run
systemctl list-timers --all | grep -E 'certbot|letsencrypt'
```

期望结果：
- `certbot certificates` 中出现 `Certificate Name: learning.chat1.co`。
- Domains 包含 `learning.chat1.co`。
- `curl -I https://learning.chat1.co/` 返回 HTTPS 响应。
- `certbot renew --dry-run` 成功。
- `certbot-renew.timer` 处于计划状态。

### 5. 证书更新方案

日常无需手工更新证书。线上已有 Certbot timer，会自动执行续期：

```bash
systemctl list-timers --all | grep -E 'certbot|letsencrypt'
```

如果需要手工更新：

```bash
certbot renew
nginx -t
systemctl reload nginx
```

如果只想更新 `learning.chat1.co` 这张证书：

```bash
certbot renew --cert-name learning.chat1.co
nginx -t
systemctl reload nginx
```

如果证书配置损坏或需要重新签发：

```bash
certbot --nginx -d learning.chat1.co --cert-name learning.chat1.co
nginx -t
systemctl reload nginx
```

更新后检查：

```bash
certbot certificates
curl -Iv https://learning.chat1.co/
```

### 6. 回滚

如果 `learning.chat1.co` 配置导致 Nginx 测试失败：

```bash
rm -f /etc/nginx/sites-enabled/learning.chat1.co.conf
nginx -t
systemctl reload nginx
```

如果需要保留配置但临时停用，只删除 `sites-enabled` 里的 symlink，不删除 `sites-available` 文件。

注意：
- `learning.chat1.co` 需要证书明确覆盖该域名。
- 如果现有 `chat1.co` 证书不是通配符证书，不能自动覆盖 `learning.chat1.co`。
- `math.chat1.co` 的长期策略可在 learning 稳定后再定：保留旧数学入口，或 301 到 `https://learning.chat1.co/math`。

## 本地开发

默认端口保持：

```text
Learning Hub dev server: 5173
Learning Apps static host: 5174
Learning Apps API gateway: 7060
```

启动命令改为：

```bash
cd /Users/lee/git/learning/light-learning-apps
npm install
./start.sh

cd /Users/lee/git/learning/light-learning-hub
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Hub Vite 允许域名：

```ts
allowedHosts: ["light", "localhost", "127.0.0.1", "learning.chat1.co"]
```

环境变量改为 learning 命名，并可临时兼容旧变量：

```text
LIGHT_LEARNING_APPS_HOST_URL
LIGHT_LEARNING_APPS_API_GATEWAY_URL
LIGHT_LEARNING_APPS_IDLE_TIMEOUT_MINUTES
```

兼容策略：
- 新代码优先读取 `LIGHT_LEARNING_*`。
- 如未设置，再 fallback 到旧 `LIGHT_APPS_*`。
- 文档只推荐新变量。

## 具体实施顺序

### Phase 1：目录与命名

1. 本地仓库目录改为 `/Users/lee/git/learning`。
2. `light-math-hub` 改名为 `light-learning-hub`。
3. `light-maths` 改名为 `light-learning-apps`。
4. 更新 README、AGENTS、MEMORY、docs 中的旧路径和旧命名。
5. 更新 package name：
   - `light-math-hub` -> `light-learning-hub`
   - `light-maths` -> `light-learning-apps`

### Phase 2：Learning Shell

1. 首页从应用卡片大厅改为学科导航入口。
2. 增加 `/:subject` 学科路由，公开路径使用 `/math`、`/english`。
3. `apps.json` 增加 `subject` 字段，现有应用全部设为 `math`。
4. `currentUser.ts` 增加学科级权限。
5. `/app/:id`、`/run/:id` 保持兼容。

### Phase 3：构建与部署

1. `light-learning-apps/scripts/build-all.mjs` 确认输出到 `dist/apps/<id>`。
2. 所有 app 的 `vite.config.ts` 确认输出路径从旧目录逻辑迁移后仍正确。
3. 新增 `scripts/deploy-learning-chat1.sh`。
4. 删除或废弃 `scripts/deploy-math-chat1.sh`。
5. 执行：

```bash
cd light-learning-hub && npm run build
cd light-learning-apps && npm run build:all
```

### Phase 4：服务器与 HTTPS

1. 服务器创建 `/var/www/learning.chat1.co/releases`，`current` 由部署脚本创建为 symlink。
2. 添加 Nginx `learning.chat1.co` server。
3. 申请 Certbot HTTPS 证书。
4. 执行部署：

```bash
./scripts/deploy-learning-chat1.sh
```

5. 验证首页、学科页和应用页。

### Phase 5：英语应用

1. 新建 `light-learning-apps/apps/english-phonics-lab/`。
2. 在 `light-learning-hub/src/data/apps.json` 注册，`subject` 为 `english`。
3. 复用 `docs/phonics-system.md` 设计第一版内容。
4. 构建并部署到 `learning.chat1.co`。

## 验收清单

代码结构：
- 仓库目录为 `/Users/lee/git/learning`。
- 主项目目录为 `light-learning-hub` 和 `light-learning-apps`。
- 旧 `light-math-hub`、`light-maths` 路径不再作为主路径出现。

Git：
- `git remote -v` 指向 `https://github.com/cleef/learning.git`。
- 当前主分支已推送到 `cleef/learning`。

本地构建：
- `cd light-learning-hub && npm run build`
- `cd light-learning-apps && npm run build:all`

本地功能：
- 首页只展示学科导航入口。
- `/math` 显示数学应用。
- `/english` 显示英语应用或英语空状态。
- `/run/<id>` 正常跳转到 `/apps/<id>/`。
- `/apps/<id>/game-spotlight.html` 正常打开。

线上：
- `https://learning.chat1.co/` 正常打开。
- `https://learning.chat1.co/math` 正常打开。
- `https://learning.chat1.co/english` 正常打开。
- `https://learning.chat1.co/apps/<id>/` 正常打开。
- HTTPS 证书覆盖 `learning.chat1.co`。
- `certbot renew --dry-run` 成功。

## 关键决策

- 直接实现最终 `learning` 结构，不再以 `light-math-*` 作为主项目名。
- 首页采用轻量 Learning Shell，不做传统应用商店式 Hub。
- 学科是第一层导航，应用是学科内部的学习体验。
- `/apps/<id>/` 保持稳定，降低已有数学应用迁移风险。
- `learning.chat1.co` 使用独立 Nginx server 和 HTTPS 证书。
