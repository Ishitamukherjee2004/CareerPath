import { CareerFramework } from '../models/CareerFramework.js';
import { synthesizeCareerFramework } from '../services/gemini.service.js';

// @route   POST /api/v1/careers/research
export const researchCareer = async (req, res, next) => {
  try {
    const { title, refresh } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A career title is required for research synthesis.',
      });
    }

    const normalized = title.trim().toLowerCase();

    // Check cache ONLY if refresh is not requested
    if (!refresh) {
      const cached = await CareerFramework.findOne({
        normalizedTitle: normalized,
        'metadata.expiresAt': { $gt: new Date() },
      });

      if (cached && cached.competencies?.length > 0) {
        return res.status(200).json({
          success: true,
          source: 'cache',
          data: { framework: cached },
        });
      }
    }

    // Call live Gemini dynamically
    const synthesized = await synthesizeCareerFramework(title.trim());

    // Update / upsert cache with the live Gemini generation
    const framework = await CareerFramework.findOneAndUpdate(
      { normalizedTitle: normalized },
      {
        normalizedTitle: normalized,
        displayTitle: synthesized.displayTitle || title.trim(),
        overview: synthesized.overview,
        competencies: synthesized.competencies,
        metadata: {
          modelVersion: 'gemini-live',
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      source: 'live_synthesis',
      data: { framework },
    });
  } catch (error) {
    next(error);
  }
};