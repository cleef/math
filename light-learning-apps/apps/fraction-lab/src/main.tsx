import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

type Rational = { n: number; d: number };
type Question = {
  id: string;
  prompt: string;
  hint: string;
  answer: Rational;
};

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x || 1;
}

function normalize(value: Rational): Rational {
  if (value.d === 0) {
    return { n: 0, d: 1 };
  }
  const sign = value.d < 0 ? -1 : 1;
  const n = value.n * sign;
  const d = value.d * sign;
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

function toText(value: Rational): string {
  const normalized = normalize(value);
  if (normalized.d === 1) {
    return String(normalized.n);
  }
  return `${normalized.n}/${normalized.d}`;
}

function parseInput(text: string): Rational | null {
  const raw = text.trim().replace(/\s+/g, "");
  if (!raw) {
    return null;
  }

  const fractionMatch = raw.match(/^(-?\d+)\/(-?\d+)$/);
  if (fractionMatch) {
    const n = Number(fractionMatch[1]);
    const d = Number(fractionMatch[2]);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) {
      return null;
    }
    return normalize({ n, d });
  }

  const integer = Number(raw);
  if (Number.isFinite(integer)) {
    return normalize({ n: integer, d: 1 });
  }

  return null;
}

function equalRational(a: Rational | null, b: Rational): boolean {
  if (!a) {
    return false;
  }
  const left = normalize(a);
  const right = normalize(b);
  return left.n === right.n && left.d === right.d;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createQuestion(index: number): Question {
  const denominators = [2, 3, 4, 5, 6, 8, 10, 12];
  const ops = ["+", "-"] as const;
  const op = ops[randomInt(0, ops.length - 1)];

  const sameDenominator = Math.random() < 0.5;
  const d1 = denominators[randomInt(0, denominators.length - 1)];
  const d2 = sameDenominator ? d1 : denominators[randomInt(0, denominators.length - 1)];
  const n1 = randomInt(1, d1 - 1);
  const n2 = randomInt(1, d2 - 1);

  let answer: Rational;
  if (op === "+") {
    answer = normalize({ n: n1 * d2 + n2 * d1, d: d1 * d2 });
  } else {
    answer = normalize({ n: n1 * d2 - n2 * d1, d: d1 * d2 });
  }

  return {
    id: `q-${index + 1}`,
    prompt: `${n1}/${d1} ${op} ${n2}/${d2} = ?`,
    hint: sameDenominator ? "先看分母是否相同。" : "先通分，再计算分子。",
    answer
  };
}

function createSet(size = 8): Question[] {
  return Array.from({ length: size }, (_, i) => createQuestion(i));
}

function FractionLabApp() {
  const [questions, setQuestions] = useState<Question[]>(() => createSet());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    return questions.reduce((acc, q) => {
      const parsed = parseInput(answers[q.id] ?? "");
      return acc + (equalRational(parsed, q.answer) ? 1 : 0);
    }, 0);
  }, [answers, questions]);

  const handleReset = () => {
    setQuestions(createSet());
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <main className="lab-shell">
      <header className="hero">
        <p className="eyebrow">Fraction Lab</p>
        <h1>分数训练工坊</h1>
        <p className="subtitle">
          适合课堂投屏与课后练习。输入答案支持整数或分数（例如 <code>3/4</code>）。
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" type="button" onClick={() => setSubmitted(true)}>
            提交批改
          </button>
          <button className="btn btn-secondary" type="button" onClick={handleReset}>
            换一组题
          </button>
          <a className="btn btn-secondary" href="./game-spotlight.html">
            课程亮点页
          </a>
        </div>
      </header>

      <section className="score-panel" aria-label="成绩面板">
        <article>
          <span>总题数</span>
          <strong>{questions.length}</strong>
        </article>
        <article>
          <span>当前得分</span>
          <strong>{score}</strong>
        </article>
        <article>
          <span>正确率</span>
          <strong>{Math.round((score / questions.length) * 100)}%</strong>
        </article>
      </section>

      <section className="question-grid" aria-label="训练题目">
        {questions.map((q, idx) => {
          const parsed = parseInput(answers[q.id] ?? "");
          const correct = equalRational(parsed, q.answer);
          return (
            <article className="question-card" key={q.id}>
              <div className="question-top">
                <span className="qid">第 {idx + 1} 题</span>
                <span className="hint">{q.hint}</span>
              </div>
              <div className="question-text">{q.prompt}</div>
              <label className="answer-row">
                <span>你的答案</span>
                <input
                  type="text"
                  value={answers[q.id] ?? ""}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [q.id]: event.target.value
                    }))
                  }
                  placeholder="例如 5/6"
                />
              </label>
              {submitted ? (
                <div className={`result ${correct ? "result--ok" : "result--bad"}`}>
                  {correct
                    ? "回答正确"
                    : `回答不正确，正确答案：${toText(q.answer)}`}
                </div>
              ) : (
                <div className="result result--pending">提交后查看结果</div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FractionLabApp />
  </React.StrictMode>
);
