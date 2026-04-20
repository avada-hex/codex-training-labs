function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function addPlan(plans, map, id, title, reason, points) {
  if (!reason) {
    return;
  }

  if (!map.has(id)) {
    const plan = {
      carePlanId: id,
      title,
      score: 0,
      reasons: []
    };
    map.set(id, plan);
    plans.push(plan);
  }

  const plan = map.get(id);
  plan.score += points;
  plan.reasons.push(reason);
}

function deduceRiskLevel(latestVital, latestSymptom) {
  if (!latestVital && !latestSymptom) {
    return "unknown";
  }

  const temp = latestVital ? toNumber(latestVital.temperature_f) : null;
  const heartRate = latestVital ? toNumber(latestVital.heart_rate_bpm) : null;
  const systolic = latestVital ? toNumber(latestVital.systolic_bp) : null;
  const oxygen = latestVital ? toNumber(latestVital.oxygen_saturation) : null;
  const painLevel = latestSymptom ? toNumber(latestSymptom.pain_level) : null;
  const severity = latestSymptom ? String(latestSymptom.severity || "").toLowerCase() : "";

  if (
    (temp !== null && temp >= 103) ||
    (oxygen !== null && oxygen <= 91) ||
    (systolic !== null && systolic >= 160) ||
    (heartRate !== null && heartRate >= 120) ||
    severity === "severe" ||
    (painLevel !== null && painLevel >= 8)
  ) {
    return "high";
  }

  if (
    (temp !== null && temp >= 100.4) ||
    (oxygen !== null && oxygen <= 94) ||
    (systolic !== null && systolic >= 140) ||
    (heartRate !== null && heartRate >= 100) ||
    severity === "moderate" ||
    (painLevel !== null && painLevel >= 5)
  ) {
    return "medium";
  }

  return "low";
}

function buildCarePlans(patient, latestVital, latestSymptom, vitalsHistory, symptomsHistory) {
  const plans = [];
  const map = new Map();
  const age = patient ? toNumber(patient.age) : null;
  const diet = patient ? String(patient.diet || "").toLowerCase() : "";
  const habits = patient ? String(patient.habits || "").toLowerCase() : "";
  const temp = latestVital ? toNumber(latestVital.temperature_f) : null;
  const heartRate = latestVital ? toNumber(latestVital.heart_rate_bpm) : null;
  const systolic = latestVital ? toNumber(latestVital.systolic_bp) : null;
  const oxygen = latestVital ? toNumber(latestVital.oxygen_saturation) : null;
  const bmi = latestVital ? toNumber(latestVital.bmi) : null;
  const painLevel = latestSymptom ? toNumber(latestSymptom.pain_level) : null;
  const severity = latestSymptom ? String(latestSymptom.severity || "").toLowerCase() : "";
  const primarySymptom = latestSymptom ? String(latestSymptom.primary_symptom || "").toLowerCase() : "";
  const symptomCount = symptomsHistory.length;
  const vitalCount = vitalsHistory.length;

  addPlan(
    plans,
    map,
    "routine-monitoring",
    "Routine Monitoring",
    vitalCount > 0 ? "Recent vitals are available for continued monitoring." : "Start with routine monitoring until more vitals are recorded.",
    1
  );

  if (
    diet.includes("low sodium") ||
    diet.includes("low carb") ||
    habits.includes("smoker") ||
    habits.includes("high stress") ||
    (bmi !== null && bmi >= 28)
  ) {
    addPlan(
      plans,
      map,
      "diet-lifestyle-improvement",
      "Diet and Lifestyle Improvement",
      "Diet, habits, or BMI suggest benefit from lifestyle coaching.",
      3
    );
  }

  if (
    (temp !== null && temp >= 100.4) ||
    (heartRate !== null && heartRate >= 100) ||
    (painLevel !== null && painLevel >= 5) ||
    severity === "moderate" ||
    primarySymptom.includes("shortness of breath")
  ) {
    addPlan(
      plans,
      map,
      "follow-up-consultation",
      "Follow-up Consultation",
      "Current vitals or symptoms suggest a clinician follow-up is appropriate.",
      4
    );
  }

  if (
    (temp !== null && temp >= 103) ||
    (oxygen !== null && oxygen <= 91) ||
    (systolic !== null && systolic >= 160) ||
    severity === "severe" ||
    (painLevel !== null && painLevel >= 8) ||
    primarySymptom.includes("chest pain")
  ) {
    addPlan(
      plans,
      map,
      "urgent-clinical-review",
      "Urgent Clinical Review",
      "High-risk vitals or severe symptoms indicate urgent review.",
      6
    );
  }

  if (
    symptomCount >= 3 ||
    vitalCount >= 3 ||
    (age !== null && age >= 65) ||
    (systolic !== null && systolic >= 140) ||
    (bmi !== null && bmi >= 30)
  ) {
    addPlan(
      plans,
      map,
      "chronic-condition-management-support",
      "Chronic Condition Management Support",
      "History and risk factors support a longer-term management plan.",
      4
    );
  }

  plans.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  return {
    riskLevel: deduceRiskLevel(latestVital, latestSymptom),
    carePlans: plans.map((plan, index) => ({
      carePlanId: plan.carePlanId,
      title: plan.title,
      score: plan.score,
      rank: index + 1,
      reasons: plan.reasons,
      explanation: plan.reasons.join(" ")
    }))
  };
}

module.exports = {
  buildCarePlans,
  deduceRiskLevel
};
