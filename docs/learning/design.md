

---

# 🧩 Interaction Design Guide（工程师版）

> 一句话原则：
> **界面 = 约束系统（Design Constraints） × 信息结构（IA） × 交互语法（Interaction Grammar）**

---

# 一、Design Constraints（设计约束系统）

这是“专业感”的来源，本质是**统一性**

---

## 1）Spacing System（间距系统）

```text
4 / 8 / 12 / 16 / 24 / 32 / 48
```

### 使用规则（关键）

* 组件内：8 / 12 / 16
* 组件间：16 / 24
* 模块间：32 / 48

---

### ❌ 常见错误

* 13px / 21px / 27px（随机数）
* 不同区域间距不一致

---

### ✅ 正确心法

> 间距不是“调出来的”，是“选出来的”

---

## 2）Typography（排版系统）

```text
Title / Subtitle / Body / Caption
```

### 标准结构

| 层级       | 用途      | 特征    |
| -------- | ------- | ----- |
| Title    | 页面/卡片标题 | 大 + 强 |
| Subtitle | 分组说明    | 中等    |
| Body     | 内容      | 常规    |
| Caption  | 辅助信息    | 小 + 灰 |

---

### ❌ 常见错误

* 所有文字大小差不多
* 没有“视觉锚点”

---

### ✅ 原则

> 用户视线应该有“路径”，不是扫雷

---

## 3）Color Roles（颜色角色）

```text
Primary / Secondary / Muted / Border / Background
```

### 定义

| 类型         | 用途       |
| ---------- | -------- |
| Primary    | CTA / 重点 |
| Secondary  | 次级操作     |
| Muted      | 次要信息     |
| Border     | 分隔       |
| Background | 层级区分     |

---

### ❌ 常见错误

* 随意用颜色
* 多个“主色”

---

### ✅ 原则

> 一个页面只能有一个“最重要的颜色”

---

## 4）Component Primitives（基础组件）

```text
Button / Card / Input / List / Modal
```

### 要求

每个组件必须：

* 有统一 padding
* 有状态（hover / active）
* 有尺寸规范（S / M / L）

---

### ❌ 常见问题

* 每个按钮长得不一样
* 卡片没有统一结构

---

### ✅ 原则

> UI 不是页面拼出来的，是组件组合出来的

---

# 二、Hierarchy（信息层级 / IA）

这是“专业 vs 业余”的分水岭

---

## 1）核心原则：不要让所有元素一样重要

---

### ❌ 业余 UI

* 所有文字一样大
* 所有按钮一样显眼
* 信息堆在一起

---

### ✅ 专业 UI

有明确层级：

```text
Title（最重要）
↓
Primary CTA
↓
核心内容
↓
次级信息
↓
辅助信息
```

---

## 2）CTA（核心动作）

必须满足：

* 只有一个 Primary CTA
* 视觉最突出
* 文案直接表达行为

---

### 示例（AI产品）

| 场景   | CTA             |
| ---- | --------------- |
| Chat | Send            |
| 分析工具 | Generate Report |
| 事件系统 | 查看未来路径          |

---

## 3）视觉节奏（Visual Rhythm）

通过以下手段实现：

* spacing（最重要）
* 字号变化
* 颜色对比
* 分组（card / section）

---

### 原则

> 页面应该像“呼吸”，而不是一堵墙

---

# 三、Interaction Grammar（交互语法）

这是“像产品”的关键

---

## 1）状态系统（必须有）

每个组件至少包含：

### Button

* default
* hover
* active
* disabled

---

### Input

* focus
* error
* success

---

### 页面级

* loading
* empty
* error

---

## 2）Empty State（空状态）

### ❌ 错误

* 空白
* “暂无数据”

---

### ✅ 正确

包含：

* 说明（为什么空）
* CTA（下一步做什么）

---

### 示例

```text
还没有事件分析
👉 点击「生成分析」开始
```

---

## 3）Loading（加载）

### 两种方式：

#### （1）Spinner（简单）

适合短时间

---

#### （2）Skeleton（推荐）

适合：

* 列表
* 卡片
* 内容区

---

### 原则

> 不要让用户看到“突然出现的内容”

---

## 4）动效节奏（Motion）

### 基本规则

* hover：100–150ms
* 页面切换：200–300ms
* modal：ease-out

---

### ❌ 常见错误

* 没动效 → 生硬
* 动效过多 → 花哨

---

### ✅ 原则

> 动效是“反馈”，不是“表演”

---

# 四、工程落地模板（最关键）

你可以直接用这个结构写代码：

---

## Layout

```text
Page
├── Header
├── Sidebar（可选）
└── Main
    ├── Section
    │   ├── Title
    │   ├── CTA
    │   └── Content（Card/List）
```

---

## Card 模板

```text
Card
├── Title
├── Subtitle
├── Content
└── Actions（按钮）
```

---

## Button 规范

```text
Primary（主）
Secondary（次）
Ghost（弱）
```

---

# 五、一个快速自检 Checklist（强烈建议收藏）

每次做完页面，问自己：

---

### Design Constraints

```text
□ 是否只使用 spacing system？
□ 是否只有 1 套字体层级？
□ 是否颜色角色清晰？
□ 是否组件统一？
```

---

### Hierarchy

```text
□ 用户第一眼看到什么？
□ CTA 是否唯一且明确？
□ 信息是否分层？
```

---

### Interaction

```text
□ 是否有 hover / active？
□ 是否有 empty state？
□ 是否有 loading 状态？
□ 动效是否自然？
```

---

# 六、最终总结（核心认知）

> 专业 UI ≠ 更好看
> 专业 UI = 更清晰 + 更一致 + 更可预测

---
