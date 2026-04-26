# Light Learning Hub

`light-learning-hub` 是多学科 Learning Shell：
- 首页展示数学、英语等学科入口
- 学科页展示并检索 `light-learning-apps/apps` 里的学习应用
- 提供详情页和一键进入
- 通过静态 host 加载 `/apps/<id>/` 的构建产物

## 本地联调（两服务）

```bash
# Terminal 1: 构建并托管 learning apps
cd /Users/lee/git/learning/light-learning-apps
npm install
npm run build:all
python -m http.server 5174 --directory dist

# Terminal 2: 启动 learning hub
cd /Users/lee/git/learning/light-learning-hub
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

访问 [http://localhost:5173/](http://localhost:5173/)。

## Hub 环境变量

在 `/Users/lee/git/learning/light-learning-hub/.env.development.local` 配置：

```bash
LIGHT_LEARNING_APPS_HOST_URL=http://localhost:5174
LIGHT_LEARNING_APPS_API_GATEWAY_URL=http://localhost:7060
# 单位: 分钟，默认 0（不自动回收）
LIGHT_LEARNING_APPS_IDLE_TIMEOUT_MINUTES=0
```

## 注册新学习应用（Hub 侧）

1. 在 `src/data/apps.json` 增加条目：

```json
{
  "id": "<id>",
  "subject": "math",
  "name": "课程名称",
  "icon": "🧮 或 assets/icon.svg",
  "description": "简短描述",
  "longDescription": "完整说明",
  "owner": "Owner/Team",
  "lastUpdated": "YYYY-MM-DD",
  "listed": true,
  "enabled": true,
  "status": "New",
  "permissions": ["light.subject.math", "light.app.<id>"],
  "entryPath": "/apps/<id>/"
}
```

2. 在 `src/data/currentUser.ts` 增加本地联调权限：

```ts
permissions: ["light.app.<id>", ...]
```

说明：
- `listed: false` 表示临时下架（配置保留但前端不可见）
- `enabled: false` 表示不可启动（前端不可见且不能运行）
