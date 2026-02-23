# light-math

数学教学应用平台，参考 `playhub` 架构，包含：
- `light-math-hub`：数学教学应用大厅（React + Vite）
- `light-maths`：数学应用集合与构建托管脚手架

## 生产访问域名
- [https://math.chat1.co](https://math.chat1.co)

## 本地启动

```bash
# 1) 启动应用静态 host + API gateway
cd /Users/lee/git/math/light-maths
npm install
./start.sh

# 2) 启动 hub
cd /Users/lee/git/math/light-math-hub
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

访问 [http://localhost:5173](http://localhost:5173)。

## 发布到生产

```bash
cd /Users/lee/git/math
./scripts/deploy-math-chat1.sh
```

默认发布域名为 `math.chat1.co`，可通过参数覆盖。
