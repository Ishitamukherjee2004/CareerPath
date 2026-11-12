import { GoogleGenerativeAI } from '@google/generative-ai';
const activeModels = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash'
];
export const generateAdaptiveRoadmap = async ({
  targetRole,
  missingGaps = [],
  reinforcementNeeded = [],
  hoursPerDay = 2,
}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Active models matching API version
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];

  const prompt = `You are a Principal Technical Architect and Engineering Mentor.
Build a personalized, non-generic, week-by-week technical learning roadmap for an engineer aiming to become a "${targetRole}".

Candidate Constraints & Context:
- Available study commitment: ${hoursPerDay} hours per day (5 days/week).
- Target missing skills that must be learned: ${
    missingGaps.map((g) => g.name).join(', ') || 'Modern production architecture and testing'
  }.
- Skills the user knows but needs practical portfolio proof for: ${
    reinforcementNeeded.map((r) => r.name).join(', ') || 'Core API design and data handling'
  }.

Rules:
1. Do not use generic tutorial placeholders. Provide exact libraries, debugging scenarios, and architecture concepts.
2. Determine schedule length dynamically based on the volume of gaps (between 4 and 10 weeks).
3. Every milestone must culminate in an incremental, real-world GitHub project deliverable.

Return ONLY a single valid JSON object (no markdown code fences, no backticks, no outer commentary) matching this schema:
{
  "totalWeeks": 6,
  "milestones": [
    {
      "weekNumber": 1,
      "title": "Specific focus title",
      "focusArea": "Primary domain",
      "weeklyGoal": "Direct practical explanation of what the engineer can build by the end of the week.",
      "tasks": [
        {
          "title": "Exact engineering task",
          "description": "Implementation or architectural instruction.",
          "estimatedHours": 2,
          "resourceQuery": "Search query for documentation"
        }
      ],
      "deliverableProject": {
        "title": "GitHub project milestone title",
        "description": "What this codebase implements and tests."
      }
    }
  ]
}`;

  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      console.log(`[Roadmap Engine] Requesting live synthesis for "${targetRole}" via ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const response = await model.generateContent(prompt);
      const rawText = response.response.text();

      if (rawText) {
        const cleaned = rawText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```$/i, '')
          .trim();

        const roadmapData = JSON.parse(cleaned);
        console.log(`[Roadmap Engine] Successfully synthesized ${roadmapData.milestones?.length} weeks for "${targetRole}" via ${modelName}!`);
        return roadmapData;
      }
    } catch (err) {
      console.warn(`[Roadmap Engine] ${modelName} call failed: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(`Roadmap generation failed across all models: ${lastError?.message}`);
};