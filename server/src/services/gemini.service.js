import { GoogleGenerativeAI } from '@google/generative-ai';

export const synthesizeCareerFramework = async (careerTitle) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-3.5-flash-lite',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.3,
  },
});

  const prompt = `You are a Principal Engineering Architect and hiring lead.
Analyze the career path: "${careerTitle}".

Provide a technical industry breakdown with real-world expectations.
Return ONLY a single valid JSON object matching this schema:
{
  "displayTitle": "${careerTitle}",
  "overview": "2-3 practical sentences on what this engineer solves in production daily.",
  "competencies": [
    {
      "name": "Practical domain name",
      "description": "Why this domain is critical in production.",
      "importance": "critical" | "important" | "nice_to_have",
      "category": "foundational" | "core_technical" | "advanced" | "tools_ecosystem",
      "skillsRequired": [
        { "name": "Exact technology, tool, or library name", "level": "intermediate" | "advanced" }
      ],
      "recommendedProject": {
        "title": "A project solving a real engineering bottleneck",
        "summary": "1-2 sentences on what this system accomplishes."
      }
    }
  ]
}

Provide 4 to 6 competencies strictly tailored to "${careerTitle}".`;

  console.log(`[Career Engine] Live synthesizing competencies for: "${careerTitle}"...`);
  const result = await model.generateContent(prompt);
  const rawText = result.response.text();

  if (!rawText) {
    throw new Error('LLM returned an empty framework response.');
  }

  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  return JSON.parse(cleaned);
};