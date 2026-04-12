

你观察到的现象，本质不是“prompt技巧差异”，而是**是否引入了“成熟设计范式”**。

当你说“参考 ChatGPT 风格”，其实你做了三件关键事情：
1）引入了**成熟的设计系统（design system）**  
2）隐式带入了**信息架构（IA）与交互模式（UX patterns）**  
3）给 agent 一个**可对齐的“风格锚点（style anchor）”**

而不是让它“自由发挥”。

---

## 一、为什么你的站点会“看起来业余”

从产品设计角度，本质是三个缺失：

### 1）没有“约束体系”（Design Constraints）
LLM 默认会：
- 用最简单的布局（div + margin）
- 缺少一致 spacing / typography / hierarchy
- 不会主动建立视觉系统

👉 结果：**功能对了，但视觉是拼出来的**

---

### 2）没有“信息优先级设计”（Hierarchy）
典型问题：
- 所有元素“同等重要”
- 没有视觉节奏（没有主次）
- CTA 不突出

👉 结果：用户感觉“乱”和“没设计”

---

### 3）没有“交互语法”（Interaction Grammar）
专业产品都有隐含规则：
- hover / active / loading 状态
- 空状态（empty state）
- skeleton loading
- 动效节奏

👉 LLM 默认不会补这些

---

## 二、你真正要学的，不是“设计”，而是这 3 套系统

你是工程背景，其实不需要成为设计师，而是要掌握：

---

### 1）设计系统（Design System）——核心

你需要有一套**固定模板脑子**

建议直接对标：

- entity["company","OpenAI","AI company"]（ChatGPT UI）
- entity["company","Apple","technology company"]（极简+层级）
- entity["company","Linear","software company"]（开发者工具标杆）
- entity["company","Notion","software company"]（信息密度控制）

---

你要抽象出这些维度：

**（1）Spacing system**
```text
4 / 8 / 12 / 16 / 24 / 32 / 48
```

**（2）Typography**
```text
Title / Subtitle / Body / Caption
```

**（3）Color roles**
```text
Primary / Secondary / Muted / Border / Background
```

**（4）Component primitives**
```text
Button / Card / Input / List / Modal
```

👉 一句话总结：
**不要让 LLM 自己设计，让它在你定义的系统里填内容**

---

## 三、让 LLM 变“设计师”的关键方法（实操）

### 方法1：不要用“优化样式”，要用“约束式 prompt”

❌ 错误：
> 帮我优化UI，让它更好看

✅ 正确：
```text
使用类似 Linear + ChatGPT 的设计风格：
- 使用 8px spacing system
- 最大宽度 1200px，居中
- 卡片使用 subtle border + 8px radius
- 字体层级：title / body / caption 明确区分
- 所有按钮必须有 hover / active 状态
- 页面必须有 clear primary CTA

输出完整 CSS + React 结构
```

👉 本质：**你在提供“设计DSL”**

---

### 方法2：建立“UI Prompt Library”（非常关键）

你应该沉淀一套自己的 prompt：

例如：

#### Prompt A：Dashboard
```text
设计一个专业 SaaS dashboard：
参考 Linear / Stripe
包含：
- 左侧导航（固定）
- 顶部状态栏
- 内容区卡片 grid
- loading / empty state

风格：minimal / high-end / developer tool
```

#### Prompt B：Landing Page
```text
参考 Apple + OpenAI landing page：
- Hero section（强视觉）
- 三段价值说明
- social proof
- CTA

避免营销感过强
```

👉 这会让你**稳定输出专业 UI**

---

### 方法3：先“拆产品”，再让 LLM 写 UI

不要直接让 LLM 生成页面

先做：

```text
1）信息结构（IA）
2）组件拆分
3）状态设计
```

例如：

```text
Page:
- Header
- Sidebar
- Main Content
    - Card list
    - Detail panel

States:
- loading
- empty
- error
```

然后再让 LLM 写

👉 这一步决定“专业 vs 业余”

---

## 四、你可以快速提升的 3 个训练方式

### 训练1：反向拆 ChatGPT

打开 ChatGPT，拆：

- spacing 是多少？
- 字体层级？
- hover 怎么做？
- sidebar 怎么收起？

👉 你会发现它是“极强约束系统”

---

### 训练2：临摹 Linear（最推荐）

搜索 Linear UI：

- 卡片间距
- hover 动效
- 列表密度
- 颜色对比

👉 Linear 是“工程师审美天花板”

---

### 训练3：建立你自己的“UI baseline repo”

做一个 repo：

```text
/ui-system
  button.tsx
  card.tsx
  layout.tsx
  spacing.ts
```

以后所有 agent 都基于这个生成

👉 这是关键跃迁点

---

## 五、关键认知（最重要）

你现在的阶段，不是“学设计”，而是：

> **学如何给 LLM 提供结构化设计约束**

---

一句话总结：

> LLM 不会设计，它只会“在约束中生成”  
> 你越像一个设计系统，它就越像一个专业设计师

---
