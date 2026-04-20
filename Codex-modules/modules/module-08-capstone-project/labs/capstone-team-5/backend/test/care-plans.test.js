const test = require("node:test");
const assert = require("node:assert/strict");
const { buildCarePlans, deduceRiskLevel } = require("../src/care-plans");

test("deduceRiskLevel returns unknown without data", () => {
  assert.equal(deduceRiskLevel(null, null), "unknown");
});

test("deduceRiskLevel identifies high, medium, and low cases", () => {
  assert.equal(
    deduceRiskLevel(
      {
        temperature_f: 103.2,
        heart_rate_bpm: 121,
        systolic_bp: 161,
        oxygen_saturation: 90
      },
      {
        pain_level: 9,
        severity: "Severe"
      }
    ),
    "high"
  );

  assert.equal(
    deduceRiskLevel(
      {
        temperature_f: 100.9,
        heart_rate_bpm: 101,
        systolic_bp: 143,
        oxygen_saturation: 94
      },
      {
        pain_level: 5,
        severity: "Moderate"
      }
    ),
    "medium"
  );

  assert.equal(
    deduceRiskLevel(
      {
        temperature_f: 98.6,
        heart_rate_bpm: 74,
        systolic_bp: 118,
        oxygen_saturation: 99
      },
      {
        pain_level: 1,
        severity: "Mild"
      }
    ),
    "low"
  );
});

test("buildCarePlans promotes urgent and chronic support for high-risk profiles", () => {
  const result = buildCarePlans(
    {
      age: 68,
      diet: "Low Sodium",
      habits: "Smoker; High stress"
    },
    {
      temperature_f: 103.1,
      heart_rate_bpm: 118,
      systolic_bp: 162,
      oxygen_saturation: 90,
      bmi: 31
    },
    {
      pain_level: 8,
      severity: "Severe",
      primary_symptom: "Chest pain"
    },
    [{ recorded_at: "2026-01-01T00:00:00Z" }, { recorded_at: "2026-01-02T00:00:00Z" }, { recorded_at: "2026-01-03T00:00:00Z" }],
    [{ recorded_at: "2026-01-01T00:00:00Z" }, { recorded_at: "2026-01-02T00:00:00Z" }, { recorded_at: "2026-01-03T00:00:00Z" }]
  );

  assert.equal(result.riskLevel, "high");
  assert.equal(result.carePlans[0].carePlanId, "urgent-clinical-review");
  assert.ok(result.carePlans.some((plan) => plan.carePlanId === "diet-lifestyle-improvement"));
  assert.ok(result.carePlans.some((plan) => plan.carePlanId === "chronic-condition-management-support"));
  assert.ok(result.carePlans.every((plan) => typeof plan.explanation === "string" && plan.explanation.length > 0));
});

test("buildCarePlans keeps routine monitoring and adds follow-up without history", () => {
  const result = buildCarePlans(
    {
      age: 30,
      diet: "Balanced",
      habits: "Regular exercise"
    },
    {
      temperature_f: 100.4,
      heart_rate_bpm: 88,
      systolic_bp: 120,
      oxygen_saturation: 97,
      bmi: 24
    },
    {
      pain_level: 5,
      severity: "Moderate",
      primary_symptom: "Shortness of breath"
    },
    [],
    []
  );

  assert.equal(result.riskLevel, "medium");
  assert.ok(result.carePlans.some((plan) => plan.carePlanId === "routine-monitoring"));
  assert.equal(result.carePlans[0].carePlanId, "follow-up-consultation");
});

test("buildCarePlans handles null patient data and late-or branches in recommendation rules", () => {
  const routineOnly = buildCarePlans(null, null, null, [], []);
  assert.equal(routineOnly.riskLevel, "unknown");
  assert.deepEqual(routineOnly.carePlans.map((plan) => plan.carePlanId), ["routine-monitoring"]);

  const lifestyleByBmi = buildCarePlans(
    {
      age: 40,
      diet: "Balanced",
      habits: "Regular exercise"
    },
    {
      temperature_f: 98.8,
      heart_rate_bpm: 78,
      systolic_bp: 118,
      oxygen_saturation: 98,
      bmi: 28
    },
    {
      pain_level: 1,
      severity: "Mild",
      primary_symptom: "Cough"
    },
    [{ recorded_at: "2026-01-01T00:00:00Z" }],
    [{ recorded_at: "2026-01-01T00:00:00Z" }]
  );
  assert.ok(lifestyleByBmi.carePlans.some((plan) => plan.carePlanId === "diet-lifestyle-improvement"));

  const urgentByChestPain = buildCarePlans(
    {
      age: 40,
      diet: "Balanced",
      habits: "Regular exercise"
    },
    {
      temperature_f: 98.8,
      heart_rate_bpm: 78,
      systolic_bp: 118,
      oxygen_saturation: 98,
      bmi: 24
    },
    {
      pain_level: 2,
      severity: "Mild",
      primary_symptom: "Chest pain"
    },
    [{ recorded_at: "2026-01-01T00:00:00Z" }],
    [{ recorded_at: "2026-01-01T00:00:00Z" }]
  );
  assert.ok(urgentByChestPain.carePlans.some((plan) => plan.carePlanId === "urgent-clinical-review"));

  const chronicByHistory = buildCarePlans(
    {
      age: 40,
      diet: "Balanced",
      habits: "Regular exercise"
    },
    {
      temperature_f: 98.8,
      heart_rate_bpm: 78,
      systolic_bp: 118,
      oxygen_saturation: 98,
      bmi: 24
    },
    {
      pain_level: 1,
      severity: "Mild",
      primary_symptom: "Cough"
    },
    [{ recorded_at: "2026-01-01T00:00:00Z" }],
    [{ recorded_at: "2026-01-01T00:00:00Z" }, { recorded_at: "2026-01-02T00:00:00Z" }, { recorded_at: "2026-01-03T00:00:00Z" }]
  );
  assert.ok(chronicByHistory.carePlans.some((plan) => plan.carePlanId === "chronic-condition-management-support"));
});

test("deduceRiskLevel evaluates each high-risk trigger path", () => {
  const cases = [
    [{ temperature_f: 98.6, heart_rate_bpm: 80, systolic_bp: 120, oxygen_saturation: 91 }, { pain_level: 1, severity: "Mild" }],
    [{ temperature_f: 98.6, heart_rate_bpm: 120, systolic_bp: 120, oxygen_saturation: 98 }, { pain_level: 1, severity: "Mild" }],
    [{ temperature_f: 98.6, heart_rate_bpm: 80, systolic_bp: 160, oxygen_saturation: 98 }, { pain_level: 1, severity: "Mild" }],
    [{ temperature_f: 98.6, heart_rate_bpm: 80, systolic_bp: 120, oxygen_saturation: 98 }, { pain_level: 8, severity: "Mild" }],
    [{ temperature_f: 98.6, heart_rate_bpm: 80, systolic_bp: 120, oxygen_saturation: 98 }, { pain_level: 1, severity: "Severe" }]
  ];

  for (const [vital, symptom] of cases) {
    assert.equal(deduceRiskLevel(vital, symptom), "high");
  }
});

test("deduceRiskLevel evaluates each medium-risk trigger path", () => {
  const cases = [
    [{ temperature_f: 98.6, heart_rate_bpm: 80, systolic_bp: 120, oxygen_saturation: 94 }, { pain_level: 1, severity: "Mild" }],
    [{ temperature_f: 98.6, heart_rate_bpm: 100, systolic_bp: 120, oxygen_saturation: 98 }, { pain_level: 1, severity: "Mild" }],
    [{ temperature_f: 98.6, heart_rate_bpm: 80, systolic_bp: 140, oxygen_saturation: 98 }, { pain_level: 1, severity: "Mild" }],
    [{ temperature_f: 98.6, heart_rate_bpm: 80, systolic_bp: 120, oxygen_saturation: 98 }, { pain_level: 5, severity: "Mild" }],
    [{ temperature_f: 98.6, heart_rate_bpm: 80, systolic_bp: 120, oxygen_saturation: 98 }, { pain_level: 1, severity: "Moderate" }]
  ];

  for (const [vital, symptom] of cases) {
    assert.equal(deduceRiskLevel(vital, symptom), "medium");
  }
});

test("care plan logic handles partial clinical inputs", () => {
  assert.equal(
    deduceRiskLevel(null, {
      pain_level: 6,
      severity: "Moderate"
    }),
    "medium"
  );

  assert.equal(
    deduceRiskLevel(
      {
        temperature_f: 98.6,
        heart_rate_bpm: 76,
        systolic_bp: 118,
        oxygen_saturation: 98
      },
      null
    ),
    "low"
  );

  const fromVitalOnly = buildCarePlans(
    null,
    {
      temperature_f: 98.8,
      heart_rate_bpm: 78,
      systolic_bp: 118,
      oxygen_saturation: 98,
      bmi: 29
    },
    null,
    [{ recorded_at: "2026-01-01T00:00:00Z" }],
    []
  );
  assert.ok(fromVitalOnly.carePlans.some((plan) => plan.carePlanId === "diet-lifestyle-improvement"));

  const fromSymptomOnly = buildCarePlans(
    {
      age: 40,
      diet: "Balanced",
      habits: "Regular exercise"
    },
    null,
    {
      pain_level: 5,
      severity: "Moderate",
      primary_symptom: "Shortness of breath"
    },
    [],
    [{ recorded_at: "2026-01-01T00:00:00Z" }]
  );
  assert.ok(fromSymptomOnly.carePlans.some((plan) => plan.carePlanId === "follow-up-consultation"));
});
