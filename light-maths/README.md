# light-maths（数学应用集合）

`light-maths` 用于管理 Math Hub 的教学应用集合：每个应用是独立前端项目，构建后统一输出到 `dist/apps/<id>/`，由 `light-math-hub` 托管。

## 目录结构

```text
apps/<id>/            # 单个数学应用目录
templates/light-app/  # 数学应用模板
dist/apps/<id>/       # 构建输出（静态 host 提供）
server/               # 可选 API Gateway
```

## 应用约定
- 每个应用包含 `light-app.json` 作为清单
- 必须提供脚本：`dev` / `build` / `preview`
- `base` 路径固定为 `/apps/<id>/`
- 构建输出到 `dist/apps/<id>/`

## 新增应用

```bash
cp -R templates/light-app apps/<id>
```

然后更新 `apps/<id>/light-app.json` 的 `id/name/description`，再运行：

```bash
cd apps/<id>
npm install
npm run dev
```

构建全部应用：

```bash
cd /Users/lee/git/math/light-maths
npm run build:all
```

## Spotlight 页规范
Hub 默认尝试加载：
- `/apps/<id>/lesson-spotlight.html`
- 若不存在，再回退到 `/apps/<id>/game-spotlight.html`

推荐保留多入口构建（`index.html + game-spotlight.html`）。

## 常用命令
- `npm run list:apps`：列出当前应用
- `npm run build:all`：构建全部应用
- `npm run start:api`：启动 API Gateway（默认 7060）
- `./start-frontend.sh`：仅启动静态 host
- `./start.sh`：启动静态 host + API Gateway
- `./start.sh -d`：daemon 模式启动
- `./stop.sh`：停止 daemon 模式

## 本地联调

```bash
# Terminal 1
cd /Users/lee/git/math/light-maths
npm install
npm run build:all
python -m http.server 5174 --directory dist

# Terminal 2
cd /Users/lee/git/math/light-math-hub
npm install
LIGHT_APPS_HOST_URL=http://localhost:5174 npm run dev -- --host 0.0.0.0 --port 5173
```

访问 [http://localhost:5173/](http://localhost:5173/)，在 Hub 中进入对应数学应用。
