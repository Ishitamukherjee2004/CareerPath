import { GoogleGenerativeAI } from '@google/generative-ai';

const activeModels = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash'
];
const callWithTimeout = (promise, ms = 20000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Model response timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
};

export const synthesizeAtsResumeBullets = async ({
  targetRole,
  completedProjects = [],
  demonstratedSkills = [],
}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not defined.');

  const genAI = new GoogleGenerativeAI(apiKey);
  const projectsText = completedProjects.length > 0
    ? completedProjects.map((p) => `- ${p.title}: ${p.description}`).join('\n')
    : `- Production Architecture Showcase: Implemented resilient caching, batching, and schema validation.`;
  const skillsText = demonstratedSkills.join(', ') || 'Modern Full Stack Technologies';

  const prompt = `You are an Executive Technical Recruiter and Staff Resume Reviewer.
Create 4 high-impact, ATS-optimized resume bullet points for a candidate targeting a "${targetRole}".

Candidate Completed Work & Projects:
${projectsText}

Demonstrated Tech Stack:
${skillsText}

Rules:
1. Follow the Google X-Y-Z formula: "Accomplished [X], as measured by [Y], by doing [Z]".
2. Include realistic engineering metrics (e.g. latency reduction, IOPS optimization, throughput scaling, test coverage).
3. Strictly focus on production-grade architectural impact.
4. Return ONLY a single raw JSON object matching this schema:
{
  "bullets": [
    {
      "headline": "Short project or architecture focus",
      "bullet": "The complete bullet point starting with a strong active verb.",
      "highlightedKeywords": ["Keyword1", "Keyword2"]
    }
  ]
}`;

  for (const modelName of activeModels) {
    try {
      console.log(`[Analytics Service] Synthesizing ATS bullets via ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const res = await callWithTimeout(model.generateContent(prompt), 20000);
      const text = res.response.text();
      const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      return parsed.bullets || [];
    } catch (err) {
      console.warn(`[Analytics Service] ${modelName} failed (${err.message}). Trying fallback...`);
    }
  }

  throw new Error('Failed to synthesize ATS resume bullets across all models.');
};