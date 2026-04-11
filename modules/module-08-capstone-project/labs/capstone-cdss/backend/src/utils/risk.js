const SYMPTOM_WEIGHTS = {
  'chest pain': 20,
  'shortness of breath': 18,
  dizziness: 10,
  confusion: 15,
  'altered mental status': 15,
  vomiting: 5,
  fever: 4
};

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function evaluateSymptomScore(symptoms = []) {
  const normalized = symptoms.map((symptom) => symptom.toLowerCase().trim());
  let score = 0;
  const contributors = [];

  normalized.forEach((symptom) => {
    const weight = SYMPTOM_WEIGHTS[symptom] || 4;
    score += weight;
    contributors.push(`Symptom "${symptom}" added ${weight} points`);
  });

  return { score, contributors };
}

function mapRiskLevel(score) {
  if (score >= 70) {
    return 'High';
  }
  if (score >= 45) {
    return 'Moderate';
  }
  return 'Low';
}

function buildCarePlan(riskLevel) {
  if (riskLevel === 'High') {
    return 'Activate urgent alert, route to rapid response/clinician team.';
  }
  if (riskLevel === 'Moderate') {
    return 'Notify the care team, schedule follow-up vitals in 1 hour, and consider supplemental oxygen.';
  }
  return 'Continue routine monitoring and re-check vitals on next bedside rounding.';
}

function evaluateRisk(vitals = {}, symptoms = []) {
  let score = 0;
  const contributors = [];

  const {
    heartRate = 0,
    respiratoryRate = 0,
    temperature = 0,
    systolicBP = 0,
    diastolicBP = 0,
    oxygenSaturation = 100
  } = vitals;

  if (heartRate >= 130) {
    score += 15;
    contributors.push('Heart rate ≥130 bpm (tachycardia, +15).');
  } else if (heartRate >= 110) {
    score += 10;
    contributors.push('Heart rate ≥110 bpm (+10).');
  } else if (heartRate >= 100) {
    score += 5;
    contributors.push('Heart rate ≥100 bpm (+5).');
  }

  if (respiratoryRate >= 24) {
    score += 12;
    contributors.push('Respiratory rate ≥24 (+12).');
  } else if (respiratoryRate >= 20) {
    score += 6;
    contributors.push('Respiratory rate ≥20 (+6).');
  }

  if (temperature >= 39) {
    score += 15;
    contributors.push('Temperature ≥39°C (+15).');
  } else if (temperature >= 38) {
    score += 10;
    contributors.push('Temperature ≥38°C (+10).');
  } else if (temperature <= 35) {
    score += 8;
    contributors.push('Temperature ≤35°C (hypothermia, +8).');
  }

  if (systolicBP >= 180 || diastolicBP >= 110) {
    score += 15;
    contributors.push('Blood pressure severe elevation (+15).');
  } else if (systolicBP >= 160 || diastolicBP >= 100) {
    score += 10;
    contributors.push('Blood pressure elevated (+10).');
  } else if (systolicBP < 90 || diastolicBP < 60) {
    score += 12;
    contributors.push('Blood pressure low (hypotension, +12).');
  }

  if (oxygenSaturation < 92) {
    score += 20;
    contributors.push('Oxygen saturation <92% (+20).');
  } else if (oxygenSaturation < 95) {
    score += 10;
    contributors.push('Oxygen saturation 92-95% (+10).');
  }

  const { score: symptomScore, contributors: symptomContributors } = evaluateSymptomScore(symptoms);
  score += symptomScore;
  contributors.push(...symptomContributors);

  score = clamp(score, 0, 100);
  const riskLevel = mapRiskLevel(score);
  const carePlan = buildCarePlan(riskLevel);
  const summary = `Computed a ${riskLevel} risk (#${Math.round(score)}).`;

  return {
    score: Math.round(score),
    riskLevel,
    carePlan,
    summary,
    contributors
  };
}

module.exports = {
  evaluateRisk
};
