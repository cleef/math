# Light Math App Standard

## 1. 必备文件
每个应用目录 `apps/<id>/` 至少包含：
- `light-app.json`
- `package.json`
- `vite.config.ts`
- `index.html`
- `game-spotlight.html`
- `src/main.tsx`

## 2. 清单规范（light-app.json）
必填字段：
- `id`: 与目录名一致（如 `fraction-lab`）
- `name`: 展示名称
- `version`: 版本号
- `description`: 简短介绍
- `entry`: 默认 `index.html`

## 3. 构建规范
- Vite `base` 必须为 `/apps/<id>/`
- 输出目录必须为 `../../dist/apps/<id>`
- 推荐多入口：`index.html` 与 `game-spotlight.html`

## 4. Hub 接入规范
在 `light-math-hub/src/data/apps.json` 注册应用时，确保：
- `id` 与 `light-app.json.id` 一致
- `entryPath` 为 `/apps/<id>/`
- `enabled` 与 `listed` 符合预期

## 5. 质量要求
- 桌面和移动端均可正常加载
- 页面文本与交互符合教学场景
- `npm run build` 无报错
