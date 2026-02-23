# light math app template

快速创建一个可被 Light Math Hub 托管的教学应用。

## 使用

```bash
cp -R templates/light-app apps/<your-app-id>
cd apps/<your-app-id>
npm install
npm run dev
```

## 构建要求
- `vite.config.ts` 的 `base` 必须是 `/apps/<id>/`
- 输出目录必须是 `../../dist/apps/<id>`
- 建议保留 `index.html + game-spotlight.html` 双入口
