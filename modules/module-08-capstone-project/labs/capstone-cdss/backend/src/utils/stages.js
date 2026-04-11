const STAGE_SEQUENCE = [
  'Understanding',
  'Decomposing',
  'Executing',
  'Checking',
  'Adjusting',
  'Completed'
];

const createStage = (stage, status, details, metrics = {}) => ({
  stage,
  status,
  details,
  metrics,
  timestamp: new Date().toISOString()
});

function buildStages({ vitals = {}, symptoms = [], evaluation = {} }) {
  const stageList = [];

  const vitalCount = Object.keys(vitals).length;
  const symptomCount = symptoms.length;

  stageList.push(
    createStage(
      'Understanding',
      'done',
      `Captured ${vitalCount} vitals and ${symptomCount} reported symptoms.`,
      { vitalCount, symptomCount }
    )
  );

  stageList.push(
    createStage(
      'Decomposing',
      'done',
      `Planned heuristic thresholds and symptom weights to shape the risk score.`,
      { targetRiskLevel: evaluation.riskLevel }
    )
  );

  stageList.push(
    createStage(
      'Executing',
      'done',
      `Applied scoring logic resulting in ${evaluation.score} points.`,
      { score: evaluation.score }
    )
  );

  const checkingWarnings = evaluation.riskLevel === 'High';
  stageList.push(
    createStage(
      'Checking',
      checkingWarnings ? 'warning' : 'done',
      checkingWarnings
        ? 'Score exceeds the safe threshold; verifying for escalation.'
        : 'Score meets expected thresholds.',
      { riskLevel: evaluation.riskLevel }
    )
  );

  if (checkingWarnings) {
    stageList.push(
      createStage(
        'Adjusting',
        'done',
        'Raised an alerting care plan and flagged immediate clinician review.',
        { carePlan: evaluation.carePlan }
      )
    );
  } else {
    stageList.push(
      createStage(
        'Adjusting',
        'skipped',
        'No iterative adjustments required; continuing with standard monitoring.'
      )
    );
  }

  stageList.push(
    createStage(
      'Completed',
      'done',
      `Final risk level: ${evaluation.riskLevel}. Care plan ready.`,
      {
        riskScore: evaluation.score,
        riskLevel: evaluation.riskLevel,
        carePlan: evaluation.carePlan
      }
    )
  );

  return stageList.filter((stage) => STAGE_SEQUENCE.includes(stage.stage));
}

module.exports = {
  buildStages,
  STAGE_SEQUENCE
};
