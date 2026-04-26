# light-learning

多学科学习应用平台，参考 `playhub` 架构，包含：
- `light-learning-hub`：Learning Shell、学科导航与应用启动（React + Vite）
- `light-learning-apps`：数学、英语等学习应用集合与构建托管脚手架

## 生产访问域名
- [https://learning.chat1.co](https://learning.chat1.co)

## 本地启动

```bash
# 1) 启动应用静态 host + API gateway
cd /Users/lee/git/learning/light-learning-apps
npm install
./start.sh

# 2) 启动 hub
cd /Users/lee/git/learning/light-learning-hub
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

访问 [http://localhost:5173](http://localhost:5173)。

## 发布到生产

```bash
cd /Users/lee/git/learning
./scripts/deploy-learning-chat1.sh
```

默认发布域名为 `learning.chat1.co`，可通过参数覆盖。
