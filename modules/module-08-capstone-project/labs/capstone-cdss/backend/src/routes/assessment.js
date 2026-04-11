const express = require('express');
const { evaluateRisk } = require('../utils/risk');
const { buildStages } = require('../utils/stages');
const { normalizeVitals, validateVitals } = require('../utils/validators');

const router = express.Router();

router.post('/assess', (req, res) => {
  const normalizedVitals = normalizeVitals(req.body);
  const validationError = validateVitals(normalizedVitals);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const symptoms = Array.isArray(req.body.symptoms)
    ? req.body.symptoms
    : typeof req.body.symptoms === 'string' && req.body.symptoms.trim()
      ? req.body.symptoms.split(',').map((item) => item.trim()).filter(Boolean)
      : [];

  const evaluation = evaluateRisk(normalizedVitals, symptoms);
  const stages = buildStages({
    vitals: normalizedVitals,
    symptoms,
    evaluation
  });

  return res.json({
    assessment: {
      riskScore: evaluation.score,
      riskLevel: evaluation.riskLevel,
      carePlan: evaluation.carePlan,
      summary: evaluation.summary,
      contributors: evaluation.contributors
    },
    stages
  });
});

module.exports = router;
