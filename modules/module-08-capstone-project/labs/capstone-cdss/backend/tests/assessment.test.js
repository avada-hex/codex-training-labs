const request = require('supertest');
const app = require('../src/app');
const { evaluateRisk } = require('../src/utils/risk');
const { buildStages, STAGE_SEQUENCE } = require('../src/utils/stages');

describe('Risk evaluator', () => {
  it('computes moderate risk with expected contributors', () => {
    const result = evaluateRisk(
      {
        heartRate: 105,
        respiratoryRate: 22,
        temperature: 37.8,
        systolicBP: 145,
        diastolicBP: 92,
        oxygenSaturation: 94
      },
      ['mild fever']
    );

    expect(result.riskLevel).toBe('Moderate');
    expect(result.score).toBeGreaterThanOrEqual(45);
    expect(result.contributors.length).toBeGreaterThan(0);
  });

  it('flags high risk for severe vitals and symptoms', () => {
    const result = evaluateRisk(
      {
        heartRate: 140,
        respiratoryRate: 28,
        temperature: 39.5,
        systolicBP: 190,
        diastolicBP: 115,
        oxygenSaturation: 88
      },
      ['chest pain', 'shortness of breath']
    );

    expect(result.riskLevel).toBe('High');
    expect(result.score).toBeGreaterThanOrEqual(70);
  });
});

describe('Stage builder', () => {
  it('returns the canonical six stages in order', () => {
    const evaluation = {
      score: 72,
      riskLevel: 'High',
      carePlan: 'plan',
      summary: 'summary'
    };

    const stages = buildStages({
      vitals: { heartRate: 120, respiratoryRate: 20 },
      symptoms: ['dizziness'],
      evaluation
    });

    expect(stages.map((stage) => stage.stage)).toEqual(STAGE_SEQUENCE);
    expect(stages.find((stage) => stage.stage === 'Checking').status).toBe('warning');
  });
});

describe('POST /api/assess', () => {
  it('rejects when required vitals are missing', async () => {
    const response = await request(app).post('/api/assess').send({ heartRate: 90 });
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Missing or invalid vitals/);
  });

  it('returns assessment payload for valid vitals', async () => {
    const payload = {
      heartRate: 130,
      respiratoryRate: 25,
      temperature: 39,
      systolicBP: 185,
      diastolicBP: 110,
      oxygenSaturation: 90,
      symptoms: ['chest pain']
    };

    const response = await request(app).post('/api/assess').send(payload);
    expect(response.status).toBe(200);
    expect(response.body.assessment.riskLevel).toBe('High');
    expect(response.body.stages).toHaveLength(6);
  });
});
