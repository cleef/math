import React, { useEffect, useState } from "react";
import {
  BUILTIN_SCENARIOS,
  actualGroupCount,
  evaluateVariant,
  expressionForVariant,
  oppositeOperator,
  scenarioConcreteTotal
} from "./scenarios";
import { AllocationScenario, AllocationVariant } from "./types";

const CJK_UI_FONT_STACK =
  '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", "Roboto", "Droid Sans Fallback", "WenQuanYi Micro Hei", sans-serif';
const DISPLAY_FONT_STACK =
  '"STKaiti", "KaiTi", "Kaiti SC", "Songti SC", "Noto Serif SC", serif';
const PLAYBACK_BATCH_MS = 1000;

type GuessState = "pending" | "aligned" | "rethink";

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

function concreteStoryLine(scenario: AllocationScenario): string {
  if (scenario.theme === "candy" || scenario.theme === "chocolate") {
    return scenario.story;
  }

  const concreteTotal = scenarioConcreteTotal(scenario);
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
  if (scenario.theme === "candy") {
    return {
      first: "人数",
      second: "所需糖果",
      third: "实际糖果",
      firstUnit: "人",
      secondUnit: "颗",
      thirdUnit: "颗"
    };
  }

  if (scenario.theme === "chocolate") {
    return {
      first: "人数",
      second: "基础用量",
      third: "实际总数",
      firstUnit: "人",
      secondUnit: "颗",
      thirdUnit: "颗"
    };
  }

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

function themeToken(theme: AllocationScenario["theme"]): string {
  if (theme === "candy") return "🍬";
  if (theme === "chocolate") return "🍫";
  if (theme === "rooms") return "🧑";
  if (theme === "apples") return "🍎";
  return "●";
}

function HeroBoard({ scenario }: { scenario: AllocationScenario }) {
  return (
    <section className="hero-board">
      <div className="hero-board__ring" aria-hidden="true">
        <div className="hero-board__ring-center">{themeToken(scenario.theme)}</div>
        <div className="hero-board__orbit hero-board__orbit--a" />
        <div className="hero-board__orbit hero-board__orbit--b" />
      </div>
    </section>
  );
}

function PlaybackConditionCard({
  scenario,
  variant
}: {
  scenario: AllocationScenario;
  variant: AllocationVariant;
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
                  >{slotIndex < filled ? themeToken(scenario.theme) : ""}</span>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {visibleLooseItems > 0 ? (
        <div className="tray">
          <div className="tray__title">剩余</div>
          <div className="tray__content">
            <div className="tray__tokens" aria-hidden="true">
              {Array.from({ length: visibleLooseItems }, (_, index) => (
                <span key={`${variant.id}-loose-${index}`} className="token token--filled">
                  {themeToken(scenario.theme)}
                </span>
              ))}
            </div>
            <div className="tray__pill">
              {visibleLooseItems}
              {scenario.itemUnit}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function ExpressionGuessCard({
  variant,
  onRevealed
}: {
  variant: AllocationVariant;
  onRevealed: () => void;
}) {
  const correctExpr = expressionForVariant(variant);
  const wrongExpr = expressionForVariant(variant, "x", oppositeOperator(variant.operator));

  const [guessState, setGuessState] = useState<GuessState>("pending");
  const [choicesOrder] = useState<[string, string]>(() =>
    Math.random() < 0.5 ? [correctExpr, wrongExpr] : [wrongExpr, correctExpr]
  );

  const handleChoice = (chosen: string) => {
    const isCorrect = chosen === correctExpr;
    setGuessState(isCorrect ? "aligned" : "rethink");
  };

  return (
    <article className="guess-card">
      <p className="guess-card__prompt">{variant.sentence}</p>
      <div className="guess-card__choices">
        {choicesOrder.map((expr) => {
          const isCorrect = expr === correctExpr;
          const isSelected = guessState !== "pending";
          const wasChosen =
            isSelected &&
            ((isCorrect && guessState === "aligned") || (!isCorrect && guessState === "rethink"));

          return (
            <button
              key={expr}
              type="button"
              className={`guess-choice ${
                isSelected
                  ? isCorrect
                    ? "guess-choice--correct"
                    : wasChosen
                    ? "guess-choice--wrong"
                    : "guess-choice--muted"
                  : ""
              }`}
              disabled={isSelected}
              onClick={() => handleChoice(expr)}
            >
              <strong>{expr}</strong>
            </button>
          );
        })}
      </div>

      {guessState !== "pending" ? (
        <div className={`guess-feedback guess-feedback--${guessState}`}>
          <p>{guessState === "aligned" ? variant.correctReason : variant.wrongReason}</p>
          <button type="button" className="guess-reveal-btn" onClick={onRevealed}>
            继续
          </button>
        </div>
      ) : null}
    </article>
  );
}

function RelationCaseCard({
  scenario,
  variant,
  xValue,
  isSolved
}: {
  scenario: AllocationScenario;
  variant: AllocationVariant;
  xValue: number;
  isSolved: boolean;
}) {
  const labels = relationLabels(scenario);
  const groupValue = actualGroupCount(variant, xValue);
  const baseValue = numericBaseValue(variant, xValue);
  const actualValue = evaluateVariant(variant, xValue);
  const groupExpression = numericGroupExpression(variant, xValue);
  const baseExpression = numericBaseExpression(variant, xValue);
  const actualExpression = numericActualExpression(variant, xValue);

  return (
    <article className={`relation-card ${isSolved ? "relation-card--solved" : ""}`}>
      <p className="relation-card__sentence">{variant.sentence}</p>
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
        <div className={`relation-node relation-node--final ${isSolved ? "relation-node--match" : ""}`}>
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

export function AllocationExpressionLabApp() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(BUILTIN_SCENARIOS[0].id);

  const activeScenario =
    BUILTIN_SCENARIOS.find((scenario) => scenario.id === selectedScenarioId) ?? BUILTIN_SCENARIOS[0];

  const storyLine = concreteStoryLine(activeScenario);

  const [xValue, setXValue] = useState(() => Math.max(1, activeScenario.solvedValue - 2));
  const xMax = Math.max(12, activeScenario.solvedValue * 2);

  const [revealedVariants, setRevealedVariants] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setXValue(Math.max(1, activeScenario.solvedValue - 2));
    setRevealedVariants({});
  }, [activeScenario.id, activeScenario.solvedValue]);

  const allRevealed = activeScenario.variants.every((variant) => revealedVariants[variant.id]);

  const val0 = evaluateVariant(activeScenario.variants[0], xValue);
  const val1 = evaluateVariant(activeScenario.variants[1], xValue);
  const isSolved = val0 === val1 && xValue > 0;

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

      <HeroBoard scenario={activeScenario} />

      <section className="scenario-strip">
        <div className="scenario-strip__buttons">
          {BUILTIN_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              className={selectedScenarioId === scenario.id ? "is-selected" : ""}
              type="button"
              onClick={() => setSelectedScenarioId(scenario.id)}
            >
              <span className="scenario-strip__token" aria-hidden="true">
                {themeToken(scenario.theme)}
              </span>
              <span className="scenario-strip__text">
                <strong>{scenario.title}</strong>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="lesson story-board">
        <p className="story-board__intro">{activeScenario.introLine}</p>
        <p className="story-board__story">{storyLine}</p>
      </section>

      <section className="lesson lesson--playback">
        <div className="playback-grid playback-grid--stack">
          <PlaybackConditionCard scenario={activeScenario} variant={activeScenario.variants[0]} />
          <PlaybackConditionCard scenario={activeScenario} variant={activeScenario.variants[1]} />
        </div>
      </section>

      <section className="lesson lesson--bridge">
        {!allRevealed ? (
          <div className="guess-grid">
            {activeScenario.variants.map((variant) =>
              revealedVariants[variant.id] ? (
                <div key={variant.id} className="guess-done-placeholder">
                  <span>✓</span>
                  <p>{variant.sentence}</p>
                </div>
              ) : (
                <ExpressionGuessCard
                  key={variant.id}
                  variant={variant}
                  onRevealed={() =>
                    setRevealedVariants((prev) => ({ ...prev, [variant.id]: true }))
                  }
                />
              )
            )}
          </div>
        ) : (
          <>
            <div className="composer-grid">
              <RelationCaseCard
                scenario={activeScenario}
                variant={activeScenario.variants[0]}
                xValue={xValue}
                isSolved={isSolved}
              />
              <RelationCaseCard
                scenario={activeScenario}
                variant={activeScenario.variants[1]}
                xValue={xValue}
                isSolved={isSolved}
              />
            </div>

            <div className="x-slider-panel">
              <div className="x-slider-panel__label">
                <strong className="x-slider-panel__value">x = {xValue}</strong>
              </div>
              <input
                type="range"
                min={1}
                max={xMax}
                value={xValue}
                onChange={(e) => setXValue(Number(e.target.value))}
              />
              <div className="x-slider-panel__results">
                <span className={`x-result ${isSolved ? "x-result--match" : ""}`}>
                  {expressionForVariant(activeScenario.variants[0])} = {val0}
                </span>
                <span className="x-results-sep">{isSolved ? "=" : "≠"}</span>
                <span className={`x-result ${isSolved ? "x-result--match" : ""}`}>
                  {expressionForVariant(activeScenario.variants[1])} = {val1}
                </span>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
