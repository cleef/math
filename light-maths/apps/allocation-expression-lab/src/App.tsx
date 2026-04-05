import React, { useEffect, useMemo, useState } from "react";
import {
  BUILTIN_SCENARIOS,
  actualGroupCount,
  evaluateVariant,
  scenarioConcreteTotal
} from "./scenarios";
import { AllocationScenario, AllocationVariant } from "./types";

const CJK_UI_FONT_STACK =
  '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", "Roboto", "Droid Sans Fallback", "WenQuanYi Micro Hei", sans-serif';
const DISPLAY_FONT_STACK =
  '"STKaiti", "KaiTi", "Kaiti SC", "Songti SC", "Noto Serif SC", serif';
const PLAYBACK_BATCH_MS = 1000;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildCardFillCounts(cardCount: number, slotCount: number, filledTotal: number): number[] {
  return Array.from({ length: cardCount }, (_, index) => {
    const alreadyFilled = index * slotCount;
    return clamp(filledTotal - alreadyFilled, 0, slotCount);
  });
}

function buildBatchRevealCounts(
  finalFillCounts: number[],
  progress: number,
  hasStarted: boolean
): number[] {
  if (finalFillCounts.length === 0) {
    return [];
  }

  const activeCardCount = finalFillCounts.filter((filled) => filled > 0).length;
  if (activeCardCount === 0) {
    return finalFillCounts.map(() => 0);
  }

  const visibleCards = hasStarted
    ? Math.min(activeCardCount, Math.max(1, Math.ceil(progress * activeCardCount)))
    : 0;
  let revealed = 0;

  return finalFillCounts.map((filled) => {
    if (filled <= 0) {
      return 0;
    }

    if (revealed < visibleCards) {
      revealed += 1;
      return filled;
    }

    revealed += 1;
    return 0;
  });
}

function concreteStoryLine(scenario: AllocationScenario, concreteTotal: number): string {
  const tail = scenario.story.replace(/^给[^，]+，/, "");

  if (scenario.theme === "rooms") {
    return `给${concreteTotal}${scenario.itemUnit}${scenario.itemLabel}分配${scenario.groupLabel}，${tail}`;
  }

  if (scenario.theme === "apples") {
    return `给${concreteTotal}${scenario.itemUnit}${scenario.itemLabel}装${scenario.groupLabel}，${tail}`;
  }

  return `${concreteTotal}${scenario.itemUnit}${scenario.itemLabel}，${tail}`;
}

function relationLabels(scenario: AllocationScenario) {
  if (scenario.theme === "rooms") {
    return {
      first: "房间",
      second: "床位",
      third: "人数",
      firstUnit: "间",
      secondUnit: "个",
      thirdUnit: "人"
    };
  }

  if (scenario.theme === "apples") {
    return {
      first: "袋子",
      second: "袋里苹果",
      third: "苹果总数",
      firstUnit: "袋",
      secondUnit: "个",
      thirdUnit: "个"
    };
  }

  return {
    first: "组数",
    second: "基础总量",
    third: "实际总量",
    firstUnit: "组",
    secondUnit: scenario.itemUnit,
    thirdUnit: scenario.itemUnit
  };
}

function numericGroupExpression(variant: AllocationVariant, xValue: number) {
  return variant.kind === "group-offset"
    ? `${xValue} ${variant.operator} ${variant.offset}`
    : `${xValue}`;
}

function numericBaseExpression(variant: AllocationVariant, xValue: number) {
  if (variant.kind === "group-offset") {
    return `(${numericGroupExpression(variant, xValue)}) × ${variant.coefficient}`;
  }

  return `${xValue} × ${variant.coefficient}`;
}

function numericBaseValue(variant: AllocationVariant, xValue: number) {
  return variant.coefficient * actualGroupCount(variant, xValue);
}

function numericActualExpression(variant: AllocationVariant, xValue: number) {
  const base = numericBaseExpression(variant, xValue);
  if (variant.kind === "capacity-adjustment") {
    return `${base} ${variant.operator} ${variant.adjustment}`;
  }

  return base;
}

function usePlayback(playbackKey: string, durationMs: number) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    setProgress(0);
    setIsPlaying(false);
    setHasStarted(false);
  }, [playbackKey]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    let frameId = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const elapsed = now - last;
      last = now;

      setProgress((current) => Math.min(1, current + elapsed / durationMs));
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [durationMs, isPlaying]);

  useEffect(() => {
    if (progress >= 1) {
      setIsPlaying(false);
    }
  }, [progress]);

  return {
    progress,
    isPlaying,
    hasStarted,
    start: () => {
      setHasStarted(true);
      setIsPlaying(true);
    },
    pause: () => setIsPlaying(false),
    reset: () => {
      setProgress(0);
      setIsPlaying(false);
      setHasStarted(false);
    }
  };
}

function PlaybackConditionCard({
  scenario,
  variant,
  heading
}: {
  scenario: AllocationScenario;
  variant: AllocationVariant;
  heading: string;
}) {
  const xValue = scenario.solvedValue;
  const totalItems = evaluateVariant(variant, xValue);
  const groupCount = actualGroupCount(variant, xValue);
  const slotsPerCard = variant.coefficient;
  const baselineCapacity = variant.coefficient * xValue;
  const fillInsideCards =
    variant.kind === "capacity-adjustment" && variant.operator === "+"
      ? Math.min(baselineCapacity, totalItems)
      : totalItems;
  const looseItems =
    variant.kind === "capacity-adjustment" && variant.operator === "+"
      ? Math.max(0, totalItems - baselineCapacity)
      : 0;
  const finalFillCounts = buildCardFillCounts(groupCount, slotsPerCard, fillInsideCards);
  const activeBatchCount = Math.max(1, finalFillCounts.filter((filled) => filled > 0).length);
  const playback = usePlayback(
    `${scenario.id}-${variant.id}`,
    activeBatchCount * PLAYBACK_BATCH_MS
  );
  const fillCounts = buildBatchRevealCounts(
    finalFillCounts,
    playback.progress,
    playback.hasStarted
  );
  const visibleLooseItems =
    variant.kind === "capacity-adjustment" && variant.operator === "+" && playback.progress >= 1
      ? looseItems
      : 0;

  return (
    <article className="mode-card">
      <div className="mode-card__header">
        <div>
          <p className="mode-card__eyebrow">{heading}</p>
          <h3>{variant.sentence}</h3>
        </div>
        <div className="mode-card__controls">
          <button type="button" onClick={playback.start} disabled={playback.isPlaying}>
            {playback.hasStarted ? "继续" : "开始"}
          </button>
          <button type="button" onClick={playback.pause} disabled={!playback.isPlaying}>
            暂停
          </button>
          <button type="button" onClick={playback.reset}>
            重置
          </button>
        </div>
      </div>
      <div className={`card-grid card-grid--${scenario.theme}`}>
        {fillCounts.map((filled, index) => {
          const isFullBatch = filled === slotsPerCard;
          const isExtraGroup =
            variant.kind === "group-offset" &&
            variant.operator === "+" &&
            index >= xValue;

          return (
            <section
              className={`batch-card ${isExtraGroup ? "batch-card--extra" : ""}`}
              key={`${variant.id}-${index}`}
            >
              <div className="batch-card__title">
                {scenario.groupLabel}
                {index + 1}
              </div>
              <div className="batch-card__dots">
                {Array.from({ length: slotsPerCard }, (_, slotIndex) => (
                  <span
                    key={`${variant.id}-${index}-${slotIndex}`}
                    className={`token ${
                      slotIndex < filled
                        ? isFullBatch
                          ? "token--filled-full"
                          : "token--filled"
                        : "token--empty"
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {visibleLooseItems > 0 ? (
        <div className="tray">
          <div className="tray__title">剩余</div>
          <div className="tray__pill">{visibleLooseItems}{scenario.itemUnit}</div>
        </div>
      ) : null}
    </article>
  );
}

function RelationCaseCard({
  scenario,
  variant,
  heading
}: {
  scenario: AllocationScenario;
  variant: AllocationVariant;
  heading: string;
}) {
  const xValue = scenario.solvedValue;
  const labels = relationLabels(scenario);
  const groupValue = actualGroupCount(variant, xValue);
  const baseValue = numericBaseValue(variant, xValue);
  const actualValue = evaluateVariant(variant, xValue);
  const groupExpression = numericGroupExpression(variant, xValue);
  const baseExpression = numericBaseExpression(variant, xValue);
  const actualExpression = numericActualExpression(variant, xValue);

  return (
    <article className="relation-card">
      <div className="relation-card__header">
        <div>
          <p className="composer__eyebrow">{heading}</p>
          <h3>{variant.sentence}</h3>
        </div>
      </div>

      <div className="relation-flow">
        <div className="relation-node">
          <span>{labels.first}</span>
          <strong>{groupExpression}</strong>
          <em>
            {groupValue}
            {labels.firstUnit}
          </em>
        </div>
        <div className="relation-arrow">→</div>
        <div className="relation-node">
          <span>{labels.second}</span>
          <strong>{baseExpression}</strong>
          <em>
            {baseValue}
            {labels.secondUnit}
          </em>
        </div>
        <div className="relation-arrow">→</div>
        <div className="relation-node relation-node--final">
          <span>{labels.third}</span>
          <strong>{actualExpression}</strong>
          <em>
            {actualValue}
            {labels.thirdUnit}
          </em>
        </div>
      </div>
    </article>
  );
}

function generateApiPath() {
  return "/api/apps/allocation-expression-lab/scenario/generate";
}

export function AllocationExpressionLabApp() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(BUILTIN_SCENARIOS[0].id);
  const [customScenario, setCustomScenario] = useState<AllocationScenario | null>(null);
  const [aiPrompt, setAiPrompt] = useState("分书本或者分桌椅都可以，要适合小学应用题。");
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  const allScenarios = useMemo(
    () => (customScenario ? [...BUILTIN_SCENARIOS, customScenario] : BUILTIN_SCENARIOS),
    [customScenario]
  );

  const activeScenario =
    allScenarios.find((scenario) => scenario.id === selectedScenarioId) ?? allScenarios[0];

  const concreteTotal = scenarioConcreteTotal(activeScenario);
  const storyLine = concreteStoryLine(activeScenario, concreteTotal);

  const handleGenerateScenario = async () => {
    setAiLoading(true);
    setAiMessage("");

    try {
      const response = await fetch(generateApiPath(), {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          prompt: aiPrompt
        })
      });

      const data = (await response.json()) as { message?: string; scenario?: AllocationScenario };

      if (!response.ok || !data.scenario) {
        setAiMessage(data.message ?? "AI 场景暂时不可用");
        return;
      }

      setCustomScenario(data.scenario);
      setSelectedScenarioId(data.scenario.id);
      setAiMessage(data.scenario.title);
      setIsAiPanelOpen(false);
    } catch {
      setAiMessage("AI 场景暂时不可用");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main
      className="allocation-app"
      style={
        {
          "--font-ui": CJK_UI_FONT_STACK,
          "--font-display": DISPLAY_FONT_STACK
        } as React.CSSProperties
      }
    >
      <div className="allocation-app__grain" aria-hidden="true" />

      <section className="scenario-strip">
        <div className="scenario-strip__buttons">
          {BUILTIN_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              className={selectedScenarioId === scenario.id ? "is-selected" : ""}
              type="button"
              onClick={() => {
                setSelectedScenarioId(scenario.id);
                setIsAiPanelOpen(false);
              }}
            >
              {scenario.title}
            </button>
          ))}
          <button
            className={
              isAiPanelOpen || activeScenario.generatedBy === "ai"
                ? "is-selected ai-trigger"
                : "ai-trigger"
            }
            type="button"
            onClick={() => setIsAiPanelOpen((current) => !current)}
          >
            AI 新场景
          </button>
        </div>

        {isAiPanelOpen ? (
          <div className="ai-panel">
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              placeholder="例如：分书本、分船、分桌椅"
            />
            <div className="ai-panel__actions">
              <button type="button" onClick={handleGenerateScenario} disabled={aiLoading}>
                {aiLoading ? "生成中..." : "生成"}
              </button>
            </div>
          </div>
        ) : null}

        {aiMessage ? <p className="ai-message">{aiMessage}</p> : null}
      </section>

      <section className="lesson story-board">
        <div className="story-board__meta">
          <span>{activeScenario.badge}</span>
        </div>
        <p className="story-board__story">{storyLine}</p>
      </section>

      <section className="lesson lesson--playback">
        <div className="playback-grid playback-grid--stack">
          <PlaybackConditionCard
            scenario={activeScenario}
            variant={activeScenario.variants[0]}
            heading="Case 1"
          />
          <PlaybackConditionCard
            scenario={activeScenario}
            variant={activeScenario.variants[1]}
            heading="Case 2"
          />
        </div>
      </section>

      <section className="lesson lesson--bridge">
        <div className="trial-panel trial-panel--static">
          <div className="composer-grid">
            <RelationCaseCard
              scenario={activeScenario}
              variant={activeScenario.variants[0]}
              heading="Case 1"
            />
            <RelationCaseCard
              scenario={activeScenario}
              variant={activeScenario.variants[1]}
              heading="Case 2"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
