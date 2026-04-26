import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  exerciseBank,
  getExercisesForPhoneme,
  type ExerciseItem
} from "./data/exercises";
import { getPhoneme, phonemes, type Phoneme, type PhonemeType } from "./data/phonemes";
import "./styles.css";

type Mode = "learn" | "review";

type AnswerState = {
  exerciseId: string;
  selectedId: string;
  isCorrect: boolean;
};

type LearnedMap = Record<string, string>;

const LEARNED_STORAGE_KEY = "light-learning.english-phonics-lab.learned.v1";

const typeLabels: Record<PhonemeType, string> = {
  "short-vowel": "Short vowels",
  "long-vowel": "Long vowels",
  diphthong: "Diphthongs",
  "r-controlled-vowel": "R-controlled",
  "weak-vowel": "Weak vowel",
  consonant: "Consonants"
};

const typeOrder: PhonemeType[] = [
  "short-vowel",
  "long-vowel",
  "r-controlled-vowel",
  "weak-vowel",
  "diphthong",
  "consonant"
];

const getKindLabel = (kind: ExerciseItem["kind"]) =>
  ({
    "sound-to-word": "Sound -> Word",
    "word-to-sound": "Word -> Sound",
    "underline-match": "Pattern",
    "contrast-choice": "Contrast"
  })[kind];

const loadLearnedMap = (): LearnedMap => {
  try {
    const raw = window.localStorage.getItem(LEARNED_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const saveLearnedMap = (learned: LearnedMap) => {
  window.localStorage.setItem(LEARNED_STORAGE_KEY, JSON.stringify(learned));
};

function App() {
  const [mode, setMode] = useState<Mode>("learn");
  const [activeType, setActiveType] = useState<PhonemeType>("short-vowel");
  const [activePhonemeId, setActivePhonemeId] = useState(phonemes[0].id);
  const [learnExerciseIndex, setLearnExerciseIndex] = useState(0);
  const [reviewExerciseIndex, setReviewExerciseIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState | null>(null);
  const [touchedWords, setTouchedWords] = useState<Record<string, boolean>>({});
  const [learned, setLearned] = useState<LearnedMap>(() => loadLearnedMap());

  const activePhoneme = getPhoneme(activePhonemeId);
  const activeIsLearned = Boolean(learned[activePhoneme.id]);
  const learnedCount = Object.keys(learned).filter((id) =>
    phonemes.some((phoneme) => phoneme.id === id)
  ).length;
  const learnExercises = useMemo(
    () => getExercisesForPhoneme(activePhonemeId),
    [activePhonemeId]
  );

  useEffect(() => {
    saveLearnedMap(learned);
  }, [learned]);
  const activeExercises = mode === "learn" ? learnExercises : exerciseBank;
  const activeExerciseIndex = mode === "learn" ? learnExerciseIndex : reviewExerciseIndex;
  const activeExercise = activeExercises[activeExerciseIndex] ?? activeExercises[0];

  const groupedPhonemes = useMemo(
    () =>
      typeOrder.map((type) => ({
        type,
        phonemes: phonemes.filter((phoneme) => phoneme.type === type)
      })),
    []
  );

  const choosePhoneme = (phoneme: Phoneme) => {
    setActivePhonemeId(phoneme.id);
    setActiveType(phoneme.type);
    setMode("learn");
    setLearnExerciseIndex(0);
    setAnswerState(null);
  };

  const chooseAnswer = (exercise: ExerciseItem, selectedId: string) => {
    setAnswerState({
      exerciseId: exercise.id,
      selectedId,
      isCorrect: selectedId === exercise.answerId
    });
  };

  const nextExercise = () => {
    if (mode === "learn") {
      setLearnExerciseIndex((index) => (index + 1) % learnExercises.length);
    } else {
      setReviewExerciseIndex((index) => (index + 1) % exerciseBank.length);
    }
    setAnswerState(null);
  };

  const resetPractice = () => {
    if (mode === "learn") {
      setLearnExerciseIndex(0);
    } else {
      setReviewExerciseIndex(0);
    }
    setAnswerState(null);
  };

  const touchWord = (word: string) => {
    setTouchedWords((current) => ({
      ...current,
      [`${activePhoneme.id}:${word}`]: !current[`${activePhoneme.id}:${word}`]
    }));
  };

  const toggleLearned = (phonemeId: string) => {
    setLearned((current) => {
      if (current[phonemeId]) {
        const next = { ...current };
        delete next[phonemeId];
        return next;
      }
      return {
        ...current,
        [phonemeId]: new Date().toISOString()
      };
    });
  };

  return (
    <main className="phonics-app">
      <section className="phonics-hero">
        <div className="phonics-hero__copy">
          <div className="eyebrow">English Phonics</div>
          <h1>Full IPA. Practice freely.</h1>
          <p>{mode === "learn" ? "Choose any phoneme." : "Mixed review across the full system."}</p>
        </div>
        <div className="sound-orb" aria-label={activePhoneme.ipa}>
          <span>{activePhoneme.ipa}</span>
          <small>{activePhoneme.label}</small>
        </div>
      </section>

      <section className="mode-tabs" aria-label="Phonics mode">
        <button
          type="button"
          className={mode === "learn" ? "mode-tab mode-tab--active" : "mode-tab"}
          onClick={() => {
            setMode("learn");
            setAnswerState(null);
          }}
        >
          Single phoneme
        </button>
        <button
          type="button"
          className={mode === "review" ? "mode-tab mode-tab--active" : "mode-tab"}
          onClick={() => {
            setMode("review");
            setAnswerState(null);
          }}
        >
          Review
        </button>
        <div className="learned-summary" aria-label="Learned phonemes">
          <strong>
            {learnedCount}/{phonemes.length}
          </strong>
          <span>learned</span>
        </div>
      </section>

      {mode === "learn" ? (
        <>
          <section className="type-tabs" aria-label="Phoneme groups">
            {groupedPhonemes.map((group) => (
              <button
                type="button"
                key={group.type}
                className={group.type === activeType ? "type-tab type-tab--active" : "type-tab"}
                onClick={() => setActiveType(group.type)}
              >
                {typeLabels[group.type]}
                <span>{group.phonemes.length}</span>
              </button>
            ))}
          </section>

          <section className="phoneme-picker" aria-label="IPA phoneme picker">
            {phonemes
              .filter((phoneme) => phoneme.type === activeType)
              .map((phoneme) => (
                <button
                  type="button"
                  key={phoneme.id}
                  className={
                    [
                      "phoneme-chip",
                      phoneme.id === activePhoneme.id ? "phoneme-chip--active" : "",
                      learned[phoneme.id] ? "phoneme-chip--learned" : ""
                    ].join(" ")
                  }
                  onClick={() => choosePhoneme(phoneme)}
                >
                  <strong>{phoneme.ipa}</strong>
                  <span>{phoneme.label}</span>
                  {learned[phoneme.id] && <em>Done</em>}
                </button>
              ))}
          </section>

          <section className="phoneme-layout phoneme-layout--single">
            <article className="learning-card">
              <header>
                <div className="learning-card__symbol">{activePhoneme.ipa}</div>
                <div>
                  <h2>{activePhoneme.label}</h2>
                  <p>{activePhoneme.soundHint}</p>
                </div>
                <button
                  type="button"
                  className={
                    activeIsLearned
                      ? "learned-toggle learned-toggle--active"
                      : "learned-toggle"
                  }
                  onClick={() => toggleLearned(activePhoneme.id)}
                  aria-pressed={activeIsLearned}
                >
                  {activeIsLearned ? "Unmark" : "Mark learned"}
                </button>
              </header>

              <div className="learning-grid">
                <section>
                  <h3>Mouth</h3>
                  <p>{activePhoneme.mouthHint}</p>
                  <ol className="mouth-steps">
                    {activePhoneme.mouthSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </section>
                <section>
                  <h3>Pattern</h3>
                  <div className="pattern-groups">
                    {activePhoneme.spellingPatterns.map((pattern) => (
                      <div className="pattern-group" key={pattern.grapheme}>
                        <strong>{pattern.grapheme}</strong>
                        <span>{pattern.examples.join(" / ")}</span>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h3>Words</h3>
                  <div className="word-row">
                    {activePhoneme.exampleWords.map((word) => (
                      <button
                        type="button"
                        key={word.word}
                        className={
                          touchedWords[`${activePhoneme.id}:${word.word}`]
                            ? "word-chip word-chip--touched"
                            : "word-chip"
                        }
                        onClick={() => touchWord(word.word)}
                      >
                        {word.word}
                        <small>{word.pattern}</small>
                      </button>
                    ))}
                  </div>
                </section>
                <ContrastPanel phoneme={activePhoneme} />
              </div>
            </article>
          </section>
        </>
      ) : (
        <section className="review-board">
          <div className="review-map">
            {typeOrder.map((type) => (
              <div key={type}>
                <h2>{typeLabels[type]}</h2>
                <div className="review-map__chips">
                  {phonemes
                    .filter((phoneme) => phoneme.type === type)
                    .map((phoneme) => (
                      <button type="button" key={phoneme.id} onClick={() => choosePhoneme(phoneme)}>
                        {phoneme.ipa}
                        {learned[phoneme.id] && <span>Done</span>}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <PracticeCard
        exercise={activeExercise}
        index={activeExerciseIndex}
        total={activeExercises.length}
        answerState={answerState}
        onChoose={chooseAnswer}
        onNext={nextExercise}
        onReset={resetPractice}
      />
    </main>
  );
}

function PracticeCard({
  exercise,
  index,
  total,
  answerState,
  onChoose,
  onNext,
  onReset
}: {
  exercise: ExerciseItem;
  index: number;
  total: number;
  answerState: AnswerState | null;
  onChoose: (exercise: ExerciseItem, selectedId: string) => void;
  onNext: () => void;
  onReset: () => void;
}) {
  const targetPhoneme = getPhoneme(exercise.phonemeId);

  return (
    <section className="practice-panel practice-panel--single">
      <article className="exercise-card">
        <div className="exercise-card__topline">
          <span>{getKindLabel(exercise.kind)}</span>
          <small>
            {index + 1}/{total} · {targetPhoneme.ipa}
          </small>
        </div>
        <h2>{exercise.prompt}</h2>
        <div className="answer-grid">
          {exercise.options.map((option) => {
            const selected = answerState?.selectedId === option.id;
            const correct = answerState && option.id === exercise.answerId;
            return (
              <button
                type="button"
                key={option.id}
                className={[
                  "answer-option",
                  selected ? "answer-option--selected" : "",
                  correct ? "answer-option--correct" : "",
                  selected && answerState && !answerState.isCorrect ? "answer-option--wrong" : ""
                ].join(" ")}
                onClick={() => onChoose(exercise, option.id)}
                disabled={Boolean(answerState)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {answerState && (
          <div className={answerState.isCorrect ? "feedback feedback--correct" : "feedback feedback--wrong"}>
            {answerState.isCorrect ? exercise.feedback.correct : exercise.feedback.incorrect}
          </div>
        )}
        <div className="practice-actions">
          <button type="button" onClick={onNext} disabled={!answerState}>
            Next
          </button>
          <button type="button" className="ghost-button" onClick={onReset}>
            Reset practice
          </button>
        </div>
      </article>
    </section>
  );
}

function ContrastPanel({ phoneme }: { phoneme: Phoneme }) {
  const contrast = phoneme.confusableWith[0] ? getPhoneme(phoneme.confusableWith[0]) : null;
  const pair = phoneme.minimalPairs[0];

  return (
    <section>
      <h3>Contrast</h3>
      <div className="contrast-pair">
        <div>
          <strong>{phoneme.ipa}</strong>
          <span>{pair?.targetWord ?? phoneme.exampleWords[0].word}</span>
        </div>
        <div>
          <strong>{contrast?.ipa ?? "?"}</strong>
          <span>{pair?.contrastWord ?? contrast?.exampleWords[0].word ?? "contrast"}</span>
        </div>
      </div>
    </section>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
