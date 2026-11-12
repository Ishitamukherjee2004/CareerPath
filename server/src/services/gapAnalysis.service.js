/**
 * Cross-references extracted candidate resume skills with industry framework competencies.
 */
export const computeSkillGapAnalysis = (userSkills = [], frameworkCompetencies = []) => {
  // Normalize candidate skills for fast fuzzy/case-insensitive lookup
  const candidateSkillMap = new Map();

  for (const s of userSkills) {
    const key = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    candidateSkillMap.set(key, s);
  }

  const importanceWeights = {
    critical: 3,
    important: 2,
    nice_to_have: 1,
  };

  let totalPossibleWeight = 0;
  let earnedWeight = 0;

  const strengths = [];
  const reinforcementNeeded = [];
  const missingGaps = [];

  const analyzedCompetencies = frameworkCompetencies.map((comp) => {
    const weight = importanceWeights[comp.importance] || 2;
    let compEarnedWeight = 0;
    let compMaxWeight = 0;

    const evaluatedSkills = comp.skillsRequired.map((reqSkill) => {
      const cleanReq = reqSkill.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      compMaxWeight += weight;
      totalPossibleWeight += weight;

      // Check for exact or partial token match
      let match = candidateSkillMap.get(cleanReq);
      if (!match) {
        for (const [candKey, candVal] of candidateSkillMap.entries()) {
          if (candKey.includes(cleanReq) || cleanReq.includes(candKey)) {
            match = candVal;
            break;
          }
        }
      }

      if (match) {
        if (match.evidenceLevel === 'demonstrated') {
          earnedWeight += weight;
          compEarnedWeight += weight;
          strengths.push({
            name: reqSkill.name,
            competency: comp.name,
            evidenceLevel: 'demonstrated',
            importance: comp.importance,
          });
          return {
            name: reqSkill.name,
            status: 'demonstrated',
            score: 1.0,
          };
        } else {
          // Mentioned only: gives 50% partial credit
          earnedWeight += weight * 0.5;
          compEarnedWeight += weight * 0.5;
          reinforcementNeeded.push({
            name: reqSkill.name,
            competency: comp.name,
            evidenceLevel: 'mentioned',
            importance: comp.importance,
            recommendation: 'Mentioned on resume, but lacks project/code proof.',
          });
          return {
            name: reqSkill.name,
            status: 'mentioned',
            score: 0.5,
          };
        }
      } else {
        missingGaps.push({
          name: reqSkill.name,
          competency: comp.name,
          importance: comp.importance,
          recommendedProject: comp.recommendedProject?.title || 'Hands-on practical build',
        });
        return {
          name: reqSkill.name,
          status: 'missing',
          score: 0.0,
        };
      }
    });

    const compPercentage =
      compMaxWeight > 0 ? Math.round((compEarnedWeight / compMaxWeight) * 100) : 0;

    return {
      name: comp.name,
      category: comp.category,
      importance: comp.importance,
      readinessPercentage: compPercentage,
      skills: evaluatedSkills,
      recommendedProject: comp.recommendedProject,
    };
  });

  const overallScore =
    totalPossibleWeight > 0
      ? Math.min(100, Math.round((earnedWeight / totalPossibleWeight) * 100))
      : 0;

  // Prioritize gaps: critical missing first, then important missing
  missingGaps.sort((a, b) => {
    const weightA = importanceWeights[a.importance] || 1;
    const weightB = importanceWeights[b.importance] || 1;
    return weightB - weightA;
  });

  return {
    overallReadinessScore: overallScore,
    totalBenchmarksEvaluated: totalPossibleWeight,
    summary: {
      verifiedStrengthsCount: strengths.length,
      reinforcementCount: reinforcementNeeded.length,
      missingGapsCount: missingGaps.length,
    },
    strengths,
    reinforcementNeeded,
    missingGaps,
    competencyBreakdown: analyzedCompetencies,
  };
};