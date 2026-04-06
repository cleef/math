export type SignOperator = "+" | "-";
export type ScenarioTheme = "candy" | "chocolate" | "rooms" | "apples" | "custom";
export type ScenarioSource = "builtin" | "ai";

export type CapacityAdjustmentVariant = {
  id: string;
  label: string;
  sentence: string;
  kind: "capacity-adjustment";
  coefficient: number;
  operator: SignOperator;
  adjustment: number;
  adjustmentLabel: string;
  explanation: string;
  correctReason: string;
  wrongReason: string;
};

export type GroupOffsetVariant = {
  id: string;
  label: string;
  sentence: string;
  kind: "group-offset";
  coefficient: number;
  operator: SignOperator;
  offset: number;
  offsetLabel: string;
  explanation: string;
  correctReason: string;
  wrongReason: string;
};

export type AllocationVariant = CapacityAdjustmentVariant | GroupOffsetVariant;

export type AllocationScenario = {
  id: string;
  title: string;
  theme: ScenarioTheme;
  generatedBy: ScenarioSource;
  badge: string;
  story: string;
  introLine: string;
  unknownLabel: string;
  unknownSymbol: "x";
  itemLabel: string;
  itemUnit: string;
  groupLabel: string;
  variants: [AllocationVariant, AllocationVariant];
  solvedValue: number;
  note: string;
};
