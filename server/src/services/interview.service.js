import { GoogleGenerativeAI } from '@google/generative-ai';

// Exact models instructed by Google's API migration response
const activeModels = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash'
];

const callWithTimeout = (promise, ms = 25000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Model response timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
};

export const generateInterviewQuestion = async ({
  targetRole,
  difficulty = 'mid',
  focusSkills = [],
  previousQuestions = [],
}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not defined in server/.env');

  const genAI = new GoogleGenerativeAI(apiKey);
  const skillsText =
    focusSkills.length > 0
      ? focusSkills.join(', ')
      : 'core production architecture, concurrency, and runtime internals';
  const prevList =
    previousQuestions.length > 0
      ? previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
      : 'None';

  const prompt = `You are a Principal Engineering Lead conducting a technical interview for a ${difficulty}-level "${targetRole}".

Target Tech Skills to Probe: ${skillsText}

Questions Already Asked:
${prevList}

Instructions:
1. Generate ONE concrete technical scenario, architecture trade-off, or failure-mode question.
2. Target real-world engineering bottlenecks (e.g. database deadlocks, caching invalidation, event loop stalls, race conditions).
3. Return ONLY a single raw JSON object matching this schema:
{
  "question": "A concise, specific technical scenario or internals question",
  "category": "system_design",
  "difficulty": "${difficulty}",
  "evaluationCriteria": "Core engineering trade-offs the candidate should address"
}

Allowed categories: "system_design", "internals", "debugging", "behavioral_technical".`;

  let lastError = null;

  for (const modelName of activeModels) {
    try {
      console.log(`[Interview Service] Connecting to ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const res = await callWithTimeout(model.generateContent(prompt), 25000);
      const text = res.response.text();
      const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      console.log(`[Interview Service] Successfully generated question via ${modelName}!`);
      return parsed;
    } catch (err) {
      console.warn(`[Interview Service] ${modelName} failed (${err.message}). Trying next fallback...`);
      lastError = err;
    }
  }

  throw new Error(`Interview question generation failed across all models: ${lastError?.message}`);
};

export const gradeCandidateAnswer = async ({
  targetRole,
  question,
  userAnswer,
}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not defined in server/.env');

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `You are a strict Staff Technical Hiring Lead evaluating a candidate's answer for a "${targetRole}" role.

Question Asked:
"${question}"

Candidate Answer:
"${userAnswer}"

Grading Rules:
- If the answer is wrong, trivial, or gibberish, award a failing score between 0 and 35.
- If partially correct but vague or lacking failure modes, score between 40 and 65.
- If practical, comprehensive, and accurately accounts for edge cases, score between 70 and 100.

Return ONLY a single valid JSON object:
{
  "score": 75,
  "technicalAccuracy": "Direct, honest breakdown of what was right or wrong in their explanation.",
  "missingEdgeCases": [
    "Specific edge case, concurrency hazard, or trade-off they omitted"
  ],
  "idealResponseSummary": "How a Staff Engineer would solve this scenario concisely."
}`;

  let lastError = null;

  for (const modelName of activeModels) {
    try {
      console.log(`[Evaluation Service] Grading answer via ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const res = await callWithTimeout(model.generateContent(prompt), 25000);
      const text = res.response.text();
      const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      console.log(`[Evaluation Service] Graded successfully via ${modelName}!`);
      return parsed;
    } catch (err) {
      console.warn(`[Evaluation Service] ${modelName} failed (${err.message}). Trying next fallback...`);
      lastError = err;
    }
  }

  throw new Error(`Grading failed across all models: ${lastError?.message}`);
};