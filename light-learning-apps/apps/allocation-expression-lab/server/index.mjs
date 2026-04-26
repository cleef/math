import http from "node:http";
import { randomUUID } from "node:crypto";

const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number(process.env.PORT ?? 7061);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(
  /\/$/,
  ""
);
const OPENAI_MODEL =
  process.env.ALLOCATION_SCENARIO_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("access-control-allow-origin", "*");
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";

    request.on("data", (chunk) => {
      raw += String(chunk);
      if (raw.length > 32_000) {
        reject(new Error("Request body too large."));
      }
    });

    request.on("end", () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });

    request.on("error", reject);
  });
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function evaluateVariant(variant, xValue) {
  if (variant.kind === "capacity-adjustment") {
    const baseline = variant.coefficient * xValue;
    return variant.operator === "+" ? baseline + variant.adjustment : baseline - variant.adjustment;
  }

  const groupCount = variant.operator === "+" ? xValue + variant.offset : xValue - variant.offset;
  return variant.coefficient * groupCount;
}

function normalizeVariant(raw, index) {
  if (!raw || typeof raw !== "object") {
    throw new Error(`Variant ${index + 1} is missing.`);
  }

  const base = {
    id: `ai-${randomUUID()}-${index}`,
    label: typeof raw.label === "string" && raw.label.trim() ? raw.label.trim() : `条件${index + 1}`,
    sentence:
      typeof raw.sentence === "string" && raw.sentence.trim()
        ? raw.sentence.trim()
        : `条件${index + 1}`,
    explanation:
      typeof raw.explanation === "string" && raw.explanation.trim()
        ? raw.explanation.trim()
        : "请根据题意判断调整量应该写在总量上，还是写在组数上。",
    correctReason:
      typeof raw.correctReason === "string" && raw.correctReason.trim()
        ? raw.correctReason.trim()
        : "这个符号方向和题意一致。",
    wrongReason:
      typeof raw.wrongReason === "string" && raw.wrongReason.trim()
        ? raw.wrongReason.trim()
        : "这个符号方向和题意相反。"
  };

  if (raw.kind === "capacity-adjustment") {
    const coefficient = Number(raw.coefficient);
    const adjustment = Number(raw.adjustment);
    const operator = raw.operator === "-" ? "-" : "+";

    if (!isPositiveInteger(coefficient) || !isPositiveInteger(adjustment)) {
      throw new Error(`Variant ${index + 1} must use positive integers.`);
    }

    return {
      ...base,
      kind: "capacity-adjustment",
      coefficient,
      operator,
      adjustment,
      adjustmentLabel:
        typeof raw.adjustmentLabel === "string" && raw.adjustmentLabel.trim()
          ? raw.adjustmentLabel.trim()
          : `${adjustment}`
    };
  }

  if (raw.kind === "group-offset") {
    const coefficient = Number(raw.coefficient);
    const offset = Number(raw.offset);
    const operator = raw.operator === "-" ? "-" : "+";

    if (!isPositiveInteger(coefficient) || !isPositiveInteger(offset)) {
      throw new Error(`Variant ${index + 1} must use positive integers.`);
    }

    return {
      ...base,
      kind: "group-offset",
      coefficient,
      operator,
      offset,
      offsetLabel:
        typeof raw.offsetLabel === "string" && raw.offsetLabel.trim()
          ? raw.offsetLabel.trim()
          : `${offset}`
    };
  }

  throw new Error(`Variant ${index + 1} has unsupported kind.`);
}

function normalizeScenario(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Scenario payload is empty.");
  }

  const solvedValue = Number(raw.solvedValue);
  if (!isPositiveInteger(solvedValue)) {
    throw new Error("solvedValue must be a positive integer.");
  }

  if (!Array.isArray(raw.variants) || raw.variants.length !== 2) {
    throw new Error("variants must contain exactly 2 conditions.");
  }

  const variants = [normalizeVariant(raw.variants[0], 0), normalizeVariant(raw.variants[1], 1)];
  const firstTotal = evaluateVariant(variants[0], solvedValue);
  const secondTotal = evaluateVariant(variants[1], solvedValue);

  if (!isPositiveInteger(firstTotal) || !isPositiveInteger(secondTotal)) {
    throw new Error("Scenario totals must be positive integers.");
  }

  if (firstTotal !== secondTotal) {
    throw new Error("The two generated conditions do not describe the same total.");
  }

  return {
    id: `ai-${randomUUID()}`,
    title: typeof raw.title === "string" && raw.title.trim() ? raw.title.trim() : "AI 新场景",
    theme: "custom",
    generatedBy: "ai",
    badge: "AI 新题",
    story:
      typeof raw.story === "string" && raw.story.trim()
        ? raw.story.trim()
        : "这是 AI 生成的新分配问题场景。",
    introLine:
      typeof raw.introLine === "string" && raw.introLine.trim()
        ? raw.introLine.trim()
        : `先假设 ${firstTotal} 个单位已经准备好，再看两种分法。`,
    unknownLabel:
      typeof raw.unknownLabel === "string" && raw.unknownLabel.trim()
        ? raw.unknownLabel.trim()
        : "分组数",
    unknownSymbol: "x",
    itemLabel:
      typeof raw.itemLabel === "string" && raw.itemLabel.trim() ? raw.itemLabel.trim() : "物品",
    itemUnit:
      typeof raw.itemUnit === "string" && raw.itemUnit.trim() ? raw.itemUnit.trim() : "个",
    groupLabel:
      typeof raw.groupLabel === "string" && raw.groupLabel.trim() ? raw.groupLabel.trim() : "组",
    solvedValue,
    note:
      typeof raw.note === "string" && raw.note.trim()
        ? raw.note.trim()
        : "这是一道与内置题同结构的新分配问题。",
    variants
  };
}

async function requestScenarioFromOpenAI(prompt) {
  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      response_format: {
        type: "json_object"
      },
      messages: [
        {
          role: "system",
          content:
            "You create one elementary-school allocation word problem. Return JSON only. " +
            "Use exactly two variants in this order: variant 1 must be kind='capacity-adjustment'; variant 2 must be kind='group-offset'. " +
            "Pick a positive integer solvedValue between 3 and 9 so both variants evaluate to the same positive integer total under solvedValue. " +
            "Keep numbers classroom-friendly. Explain sign direction in Chinese."
        },
        {
          role: "user",
          content:
            `Teacher hint: ${prompt || "请生成一个适合小学课堂的分配问题。"}\n\n` +
            "Return a JSON object with fields: title, story, introLine, unknownLabel, itemLabel, itemUnit, groupLabel, note, solvedValue, variants.\n" +
            "Each variant must include: label, sentence, kind, coefficient, operator, explanation, correctReason, wrongReason.\n" +
            "capacity-adjustment variant also needs adjustment and adjustmentLabel.\n" +
            "group-offset variant also needs offset and offsetLabel.\n" +
            "All text should be Chinese."
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("OpenAI response did not contain JSON content.");
  }

  return normalizeScenario(JSON.parse(content));
}

const server = http.createServer(async (request, response) => {
  if (!request.url) {
    sendJson(response, 400, { message: "Missing request URL." });
    return;
  }

  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.setHeader("access-control-allow-origin", "*");
    response.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
    response.setHeader("access-control-allow-headers", "content-type");
    response.end();
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, {
      status: "ok",
      aiEnabled: Boolean(OPENAI_API_KEY)
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/scenario/generate") {
    if (!OPENAI_API_KEY) {
      sendJson(response, 503, {
        message: "当前环境未配置 AI 服务，请先使用内置场景。"
      });
      return;
    }

    try {
      const body = await readJsonBody(request);
      const prompt =
        body && typeof body === "object" && "prompt" in body ? String(body.prompt ?? "") : "";
      const scenario = await requestScenarioFromOpenAI(prompt);
      sendJson(response, 200, { scenario });
    } catch (error) {
      sendJson(response, 502, {
        message:
          error instanceof Error
            ? `生成失败：${error.message}`
            : "生成失败：模型没有返回可用场景。"
      });
    }
    return;
  }

  sendJson(response, 404, { message: "Not found." });
});

server.listen(PORT, HOST, () => {
  console.log(`allocation-expression-lab api listening on http://${HOST}:${PORT}`);
});
