import { AllocationScenario, AllocationVariant, SignOperator } from "./types";

export const BUILTIN_SCENARIOS: AllocationScenario[] = [
  {
    id: "candy-shortage",
    title: "分糖缺颗",
    theme: "candy",
    generatedBy: "builtin",
    badge: "数量场景",
    story: "若每人 8 颗糖，缺 6 颗；若每人 10 颗，缺 16 颗。共有几个人？共有几颗糖？",
    introLine: "假设有 5 个人，看看两种分法下糖的缺口各是多少。",
    unknownLabel: "人数",
    unknownSymbol: "x",
    itemLabel: "糖",
    itemUnit: "颗",
    groupLabel: "人",
    solvedValue: 5,
    note: "两个条件都用\u201c缺\u201d\u2014\u2014表示总量不够，关键是判断两种分法下缺口的方向都是减法。",
    variants: [
      {
        id: "candy-shortage-a",
        label: "条件一",
        sentence: "每人 8 颗，缺 6 颗糖。",
        kind: "capacity-adjustment",
        coefficient: 8,
        operator: "-",
        adjustment: 6,
        adjustmentLabel: "缺 6 颗糖",
        explanation: "按每人 8 颗计算共需 8x 颗，但实际只有 8x - 6 颗——少了 6 颗。",
        correctReason: "“缺 6 颗”说明实际糖数比 8x 少了 6，所以写成 8x - 6。",
        wrongReason: "写成 8x + 6 表示糖比需要的还多 6 颗，和“缺”的意思相反。"
      },
      {
        id: "candy-shortage-b",
        label: "条件二",
        sentence: "每人 10 颗，缺 16 颗糖。",
        kind: "capacity-adjustment",
        coefficient: 10,
        operator: "-",
        adjustment: 16,
        adjustmentLabel: "缺 16 颗糖",
        explanation: "按每人 10 颗计算共需 10x 颗，但实际只有 10x - 16 颗——少了 16 颗。",
        correctReason: "“缺 16 颗”说明实际糖数比 10x 少了 16，所以写成 10x - 16。",
        wrongReason: "写成 10x + 16 表示糖反而多出 16 颗，和“缺”的意思相反。"
      }
    ]
  },
  {
    id: "chocolate-leftover",
    title: "巧克力分发",
    theme: "chocolate",
    generatedBy: "builtin",
    badge: "生活场景",
    story:
      "一盒巧克力分给几个小朋友：每人 8 颗则多出 10 颗；每人 10 颗则有 2 个小朋友分不到。共有几个小朋友？这盒巧克力有多少颗？",
    introLine: "假设有 15 个小朋友，看看两种分法下巧克力各怎么变化。",
    unknownLabel: "小朋友人数",
    unknownSymbol: "x",
    itemLabel: "巧克力",
    itemUnit: "颗",
    groupLabel: "人",
    solvedValue: 15,
    note: "条件一用“多”（加法），条件二用“分不到”（减少人数，group-offset）——方向相反，是本题核心难点。",
    variants: [
      {
        id: "chocolate-leftover-a",
        label: "条件一",
        sentence: "每人 8 颗，多出 10 颗巧克力。",
        kind: "capacity-adjustment",
        coefficient: 8,
        operator: "+",
        adjustment: 10,
        adjustmentLabel: "多出 10 颗",
        explanation: "x 个小朋友每人 8 颗共用 8x 颗，多出 10 颗说明总数是 8x + 10。",
        correctReason: "“多出 10 颗”表示总巧克力比 8x 还多 10，所以写成 8x + 10。",
        wrongReason: "写成 8x - 10 表示糖不够分，和“多出”的意思相反。"
      },
      {
        id: "chocolate-leftover-b",
        label: "条件二",
        sentence: "每人 10 颗，有 2 个小朋友分不到。",
        kind: "group-offset",
        coefficient: 10,
        operator: "-",
        offset: 2,
        offsetLabel: "有 2 人分不到",
        explanation:
          "有 2 个小朋友分不到，说明实际只有 x - 2 个人拿到糖，总数是 (x - 2) × 10。",
        correctReason: "“有 2 人分不到”表示领到糖的人数是 x - 2，再乘每人 10 颗。",
        wrongReason: "写成 10(x + 2) 表示领到糖的人数反而多出 2，和题意相反。"
      }
    ]
  },
  {
    id: "rooms-basic",
    title: "学生住宿分房",
    theme: "rooms",
    generatedBy: "builtin",
    badge: "教室场景",
    story:
      "给学生分配房间，如果每间住 10 人，则空闲 12 个床位；如果每间住 6 人，则还需要再加 2 个房间。",
    introLine: "先假设现在有 6 间房，观察 48 名学生在两种分法下分别发生了什么。",
    unknownLabel: "房间数",
    unknownSymbol: "x",
    itemLabel: "学生",
    itemUnit: "名",
    groupLabel: "房间",
    solvedValue: 6,
    note: "这个场景专门训练“空闲床位要减去、房间不够要先加房间数”的判断。",
    variants: [
      {
        id: "rooms-basic-a",
        label: "条件一",
        sentence: "每间住 10 人，空闲 12 个床位。",
        kind: "capacity-adjustment",
        coefficient: 10,
        operator: "-",
        adjustment: 12,
        adjustmentLabel: "空闲 12 个床位",
        explanation: "先算 10x 个床位，再减去空着的 12 个床位，才是实际学生人数。",
        correctReason: "“空闲”说明床位多了，所以要从总床位数里减去 12。",
        wrongReason: "写成 10x + 12 就变成人数比床位还多 12，不符合“空闲床位”。"
      },
      {
        id: "rooms-basic-b",
        label: "条件二",
        sentence: "每间住 6 人，还需要再加 2 个房间。",
        kind: "group-offset",
        coefficient: 6,
        operator: "+",
        offset: 2,
        offsetLabel: "再加 2 个房间",
        explanation: "先把房间数从 x 调整成 x + 2，再乘每间 6 人。",
        correctReason: "“还需要再加 2 个房间”表示房间总数先增加，再按每间 6 人计算。",
        wrongReason: "写成 6(x - 2) 表示房间更少了，和“还需要再加 2 个房间”相反。"
      }
    ]
  },
  {
    id: "apples-basic",
    title: "苹果装袋分发",
    theme: "apples",
    generatedBy: "builtin",
    badge: "生活场景",
    story:
      "给小朋友分苹果，如果每袋装 8 个，还剩 2 个苹果；如果每袋装 10 个，则比前一种少用 1 个袋子。",
    introLine: "先假设按 8 个一袋时用了 6 个袋子，看看 50 个苹果在两种装法下怎么变化。",
    unknownLabel: "8 个一袋时的袋数",
    unknownSymbol: "x",
    itemLabel: "苹果",
    itemUnit: "个",
    groupLabel: "袋子",
    solvedValue: 6,
    note: "这个场景训练“剩下的苹果要加上去、袋子更少时要先改成 x - 1”的判断。",
    variants: [
      {
        id: "apples-basic-a",
        label: "条件一",
        sentence: "每袋装 8 个，还剩 2 个苹果。",
        kind: "capacity-adjustment",
        coefficient: 8,
        operator: "+",
        adjustment: 2,
        adjustmentLabel: "还剩 2 个苹果",
        explanation: "先装满 x 袋，一共有 8x 个，再把袋子外剩下的 2 个苹果加上去。",
        correctReason: "“还剩 2 个苹果”说明总苹果数比 8x 更多，所以要写成 8x + 2。",
        wrongReason: "写成 8x - 2 就表示从已经装好的苹果里又拿走了 2 个，不符合“还剩”。"
      },
      {
        id: "apples-basic-b",
        label: "条件二",
        sentence: "每袋装 10 个，则比前一种少用 1 个袋子。",
        kind: "group-offset",
        coefficient: 10,
        operator: "-",
        offset: 1,
        offsetLabel: "少用 1 个袋子",
        explanation: "先把袋数从 x 调整成 x - 1，再乘每袋 10 个。",
        correctReason: "“少用 1 个袋子”说明袋数先减少，再按每袋 10 个计算。",
        wrongReason: "写成 10(x + 1) 就变成多用了 1 个袋子，和题意相反。"
      }
    ]
  }
];

export function expressionForVariant(
  variant: AllocationVariant,
  symbol = "x",
  operatorOverride?: SignOperator
): string {
  const operator = operatorOverride ?? variant.operator;

  if (variant.kind === "capacity-adjustment") {
    return `${variant.coefficient}${symbol} ${operator} ${variant.adjustment}`;
  }

  return `${variant.coefficient}(${symbol} ${operator} ${variant.offset})`;
}

export function evaluateVariant(variant: AllocationVariant, xValue: number): number {
  if (variant.kind === "capacity-adjustment") {
    const baseline = variant.coefficient * xValue;
    return variant.operator === "+"
      ? baseline + variant.adjustment
      : baseline - variant.adjustment;
  }

  const groupCount =
    variant.operator === "+" ? xValue + variant.offset : xValue - variant.offset;

  return variant.coefficient * groupCount;
}

export function actualGroupCount(variant: AllocationVariant, xValue: number): number {
  if (variant.kind === "capacity-adjustment") {
    return xValue;
  }

  return variant.operator === "+" ? xValue + variant.offset : xValue - variant.offset;
}

export function scenarioConcreteTotal(scenario: AllocationScenario): number {
  return evaluateVariant(scenario.variants[0], scenario.solvedValue);
}

export function equationForScenario(scenario: AllocationScenario): string {
  return scenario.variants.map((variant) => expressionForVariant(variant)).join(" = ");
}

export function oppositeOperator(operator: SignOperator): SignOperator {
  return operator === "+" ? "-" : "+";
}
