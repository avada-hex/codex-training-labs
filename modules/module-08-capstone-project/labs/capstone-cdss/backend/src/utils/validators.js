const REQUIRED_NUMERIC_FIELDS = [
  'heartRate',
  'respiratoryRate',
  'temperature',
  'systolicBP',
  'diastolicBP',
  'oxygenSaturation'
];

function normalizeVitals(payload = {}) {
  const normalized = {};
  REQUIRED_NUMERIC_FIELDS.forEach((key) => {
    const raw = payload[key];
    const value = typeof raw === 'string' ? Number(raw) : raw;
    normalized[key] = Number.isFinite(value) ? value : NaN;
  });

  return normalized;
}

function validateVitals(vitals = {}) {
  const missing = [];

  REQUIRED_NUMERIC_FIELDS.forEach((key) => {
    const value = vitals[key];
    if (!Number.isFinite(value)) {
      missing.push(key);
    }
  });

  if (missing.length) {
    return `Missing or invalid vitals: ${missing.join(', ')}.`;
  }

  return null;
}

module.exports = {
  normalizeVitals,
  validateVitals
};
