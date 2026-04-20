const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { buildCarePlans, deduceRiskLevel } = require("./care-plans");

const DEFAULT_DATASET_DIR = path.resolve(__dirname, "..", "..", "dataset");
const DEFAULT_RUNTIME_PATH = path.resolve(__dirname, "..", "runtime-data.json");
const DEFAULT_SEEDED_PASSWORD = "Password123!";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        field += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value !== "")) {
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0];
  return rows.slice(1).map((cells) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = cells[index] || "";
    });
    return record;
  });
}

function readCsv(datasetDir, fileName) {
  const filePath = path.join(datasetDir, fileName);
  const text = fs.readFileSync(filePath, "utf8");
  return parseCsv(text);
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizePatient(patient) {
  return {
    patient_id: patient.patient_id,
    first_name: patient.first_name,
    last_name: patient.last_name,
    age: toNumber(patient.age),
    sex: patient.sex,
    origin: patient.origin,
    diet: patient.diet,
    habits: patient.habits,
    email: patient.email,
    phone: patient.phone,
    registration_date: patient.registration_date
  };
}

function sanitizeVital(vital) {
  return {
    vital_id: vital.vital_id,
    patient_id: vital.patient_id,
    recorded_at: vital.recorded_at,
    temperature_f: toNumber(vital.temperature_f),
    heart_rate_bpm: toNumber(vital.heart_rate_bpm),
    systolic_bp: toNumber(vital.systolic_bp),
    diastolic_bp: toNumber(vital.diastolic_bp),
    respiratory_rate: toNumber(vital.respiratory_rate),
    oxygen_saturation: toNumber(vital.oxygen_saturation),
    weight_kg: toNumber(vital.weight_kg),
    bmi: toNumber(vital.bmi)
  };
}

function sanitizeSymptom(symptom) {
  return {
    symptom_id: symptom.symptom_id,
    patient_id: symptom.patient_id,
    recorded_at: symptom.recorded_at,
    primary_symptom: symptom.primary_symptom,
    secondary_symptom: symptom.secondary_symptom,
    pain_level: toNumber(symptom.pain_level),
    severity: symptom.severity,
    duration_days: toNumber(symptom.duration_days),
    notes: symptom.notes
  };
}

function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, passwordHash };
}

function verifyPassword(password, record) {
  if (!record || !record.salt || !record.passwordHash) {
    return false;
  }
  const hash = crypto.scryptSync(password, record.salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(record.passwordHash, "hex"));
}

function sortByRecordedAt(items) {
  return [...items].sort((left, right) => new Date(left.recorded_at) - new Date(right.recorded_at));
}

class DataStore {
  constructor(options = {}) {
    this.datasetDir = options.datasetDir || DEFAULT_DATASET_DIR;
    this.runtimePath = options.runtimePath || DEFAULT_RUNTIME_PATH;
    this.seededPatients = readCsv(this.datasetDir, "patient_details.csv").map(sanitizePatient);
    this.seededVitals = readCsv(this.datasetDir, "vitals.csv").map(sanitizeVital);
    this.seededSymptoms = readCsv(this.datasetDir, "symptoms.csv").map(sanitizeSymptom);
    this.seededPatientMap = new Map(this.seededPatients.map((patient) => [patient.patient_id, patient]));
    this.seededPatientByEmail = new Map(this.seededPatients.map((patient) => [patient.email.toLowerCase(), patient]));
    this.runtime = this.loadRuntime();
  }

  loadRuntime() {
    if (!fs.existsSync(this.runtimePath)) {
      return {
        runtimePatients: [],
        credentials: [],
        vitals: [],
        symptoms: [],
        carePlanSelections: [],
        contacts: [],
        updatedVitals: [],
        updatedSymptoms: []
      };
    }

    return JSON.parse(fs.readFileSync(this.runtimePath, "utf8"));
  }

  saveRuntime() {
    fs.writeFileSync(this.runtimePath, `${JSON.stringify(this.runtime, null, 2)}\n`, "utf8");
  }

  getPatientByEmail(email) {
    const normalized = String(email || "").trim().toLowerCase();
    if (!normalized) {
      return null;
    }

    const runtimePatient = this.runtime.runtimePatients.find((patient) => patient.email.toLowerCase() === normalized);
    return runtimePatient || this.seededPatientByEmail.get(normalized) || null;
  }

  getPatientById(patientId) {
    return (
      this.runtime.runtimePatients.find((patient) => patient.patient_id === patientId) ||
      this.seededPatientMap.get(patientId) ||
      null
    );
  }

  nextPatientId() {
    const allIds = [...this.seededPatients, ...this.runtime.runtimePatients].map((patient) => Number(String(patient.patient_id).slice(1)));
    const next = Math.max(...allIds, 0) + 1;
    return `P${String(next).padStart(3, "0")}`;
  }

  nextVitalId() {
    const allSeeded = this.seededVitals.map((vital) => Number(String(vital.vital_id).slice(1)));
    const allRuntime = this.runtime.vitals.map((vital) => Number(String(vital.vital_id).slice(1)));
    const next = Math.max(...allSeeded, ...allRuntime, 0) + 1;
    return `V${String(next).padStart(3, "0")}`;
  }

  nextSymptomId() {
    const allSeeded = this.seededSymptoms.map((symptom) => Number(String(symptom.symptom_id).slice(1)));
    const allRuntime = this.runtime.symptoms.map((symptom) => Number(String(symptom.symptom_id).slice(1)));
    const next = Math.max(...allSeeded, ...allRuntime, 0) + 1;
    return `S${String(next).padStart(3, "0")}`;
  }

  registerPatient(payload) {
    const patientId = this.nextPatientId();
    const patient = sanitizePatient({
      patient_id: patientId,
      first_name: payload.first_name,
      last_name: payload.last_name,
      age: payload.age,
      sex: payload.sex,
      origin: payload.origin,
      diet: payload.diet,
      habits: payload.habits,
      email: payload.email,
      phone: payload.phone,
      registration_date: new Date().toISOString().slice(0, 10)
    });
    const credential = {
      patient_id: patientId,
      email: patient.email,
      ...createPasswordRecord(payload.password)
    };

    this.runtime.runtimePatients.push(patient);
    this.runtime.credentials.push(credential);
    this.saveRuntime();
    return patient;
  }

  validateLogin(email, password) {
    const patient = this.getPatientByEmail(email);
    if (!patient) {
      return null;
    }

    const runtimeCredential = this.runtime.credentials.find(
      (credential) => credential.email.toLowerCase() === patient.email.toLowerCase()
    );

    if (runtimeCredential) {
      return verifyPassword(password, runtimeCredential) ? patient : null;
    }

    if (this.seededPatientByEmail.has(patient.email.toLowerCase()) && password === DEFAULT_SEEDED_PASSWORD) {
      return patient;
    }

    return null;
  }

  getVitals(patientId) {
    const updates = new Map(this.runtime.updatedVitals.map((item) => [item.vital_id, sanitizeVital(item)]));
    const seeded = this.seededVitals
      .filter((vital) => vital.patient_id === patientId)
      .map((vital) => updates.get(vital.vital_id) || vital);
    const runtimeVitals = this.runtime.vitals.filter((vital) => vital.patient_id === patientId).map(sanitizeVital);
    return sortByRecordedAt([...seeded, ...runtimeVitals]);
  }

  getSymptoms(patientId) {
    const updates = new Map(this.runtime.updatedSymptoms.map((item) => [item.symptom_id, sanitizeSymptom(item)]));
    const seeded = this.seededSymptoms
      .filter((symptom) => symptom.patient_id === patientId)
      .map((symptom) => updates.get(symptom.symptom_id) || symptom);
    const runtimeSymptoms = this.runtime.symptoms.filter((symptom) => symptom.patient_id === patientId).map(sanitizeSymptom);
    return sortByRecordedAt([...seeded, ...runtimeSymptoms]);
  }

  addVital(patientId, payload) {
    const vital = sanitizeVital({
      vital_id: this.nextVitalId(),
      patient_id: patientId,
      recorded_at: payload.recorded_at || new Date().toISOString(),
      temperature_f: payload.temperature_f,
      heart_rate_bpm: payload.heart_rate_bpm,
      systolic_bp: payload.systolic_bp,
      diastolic_bp: payload.diastolic_bp,
      respiratory_rate: payload.respiratory_rate,
      oxygen_saturation: payload.oxygen_saturation,
      weight_kg: payload.weight_kg,
      bmi: payload.bmi
    });
    this.runtime.vitals.push(vital);
    this.saveRuntime();
    return vital;
  }

  updateVital(patientId, vitalId, payload) {
    const existingRuntimeIndex = this.runtime.vitals.findIndex(
      (vital) => vital.vital_id === vitalId && vital.patient_id === patientId
    );

    if (existingRuntimeIndex >= 0) {
      const current = this.runtime.vitals[existingRuntimeIndex];
      const updated = sanitizeVital({
        ...current,
        ...payload,
        vital_id: vitalId,
        patient_id: patientId,
        recorded_at: payload.recorded_at || current.recorded_at || new Date().toISOString()
      });
      this.runtime.vitals[existingRuntimeIndex] = updated;
      this.saveRuntime();
      return updated;
    }

    const seeded = this.seededVitals.find((vital) => vital.vital_id === vitalId && vital.patient_id === patientId);
    if (!seeded) {
      return null;
    }

    const updated = sanitizeVital({
      ...seeded,
      ...payload,
      vital_id: vitalId,
      patient_id: patientId,
      recorded_at: payload.recorded_at || seeded.recorded_at
    });
    const existingUpdatedIndex = this.runtime.updatedVitals.findIndex((vital) => vital.vital_id === vitalId);
    if (existingUpdatedIndex >= 0) {
      this.runtime.updatedVitals[existingUpdatedIndex] = updated;
    } else {
      this.runtime.updatedVitals.push(updated);
    }
    this.saveRuntime();
    return updated;
  }

  addSymptom(patientId, payload) {
    const symptom = sanitizeSymptom({
      symptom_id: this.nextSymptomId(),
      patient_id: patientId,
      recorded_at: payload.recorded_at || new Date().toISOString(),
      primary_symptom: payload.primary_symptom,
      secondary_symptom: payload.secondary_symptom || "",
      pain_level: payload.pain_level,
      severity: payload.severity,
      duration_days: payload.duration_days,
      notes: payload.notes || ""
    });
    this.runtime.symptoms.push(symptom);
    this.saveRuntime();
    return symptom;
  }

  updateSymptom(patientId, symptomId, payload) {
    const existingRuntimeIndex = this.runtime.symptoms.findIndex(
      (symptom) => symptom.symptom_id === symptomId && symptom.patient_id === patientId
    );

    if (existingRuntimeIndex >= 0) {
      const current = this.runtime.symptoms[existingRuntimeIndex];
      const updated = sanitizeSymptom({
        ...current,
        ...payload,
        symptom_id: symptomId,
        patient_id: patientId,
        recorded_at: payload.recorded_at || current.recorded_at || new Date().toISOString()
      });
      this.runtime.symptoms[existingRuntimeIndex] = updated;
      this.saveRuntime();
      return updated;
    }

    const seeded = this.seededSymptoms.find(
      (symptom) => symptom.symptom_id === symptomId && symptom.patient_id === patientId
    );
    if (!seeded) {
      return null;
    }

    const updated = sanitizeSymptom({
      ...seeded,
      ...payload,
      symptom_id: symptomId,
      patient_id: patientId,
      recorded_at: payload.recorded_at || seeded.recorded_at
    });
    const existingUpdatedIndex = this.runtime.updatedSymptoms.findIndex((symptom) => symptom.symptom_id === symptomId);
    if (existingUpdatedIndex >= 0) {
      this.runtime.updatedSymptoms[existingUpdatedIndex] = updated;
    } else {
      this.runtime.updatedSymptoms.push(updated);
    }
    this.saveRuntime();
    return updated;
  }

  getCarePlans(patientId) {
    const patient = this.getPatientById(patientId);
    const vitals = this.getVitals(patientId);
    const symptoms = this.getSymptoms(patientId);
    const latestVital = vitals[vitals.length - 1] || null;
    const latestSymptom = symptoms[symptoms.length - 1] || null;
    return buildCarePlans(patient, latestVital, latestSymptom, vitals, symptoms);
  }

  selectCarePlan(patientId, carePlanId) {
    const { carePlans } = this.getCarePlans(patientId);
    const selected = carePlans.find((plan) => plan.carePlanId === carePlanId);
    if (!selected) {
      return null;
    }

    const selection = {
      patient_id: patientId,
      care_plan_id: selected.carePlanId,
      title: selected.title,
      selected_at: new Date().toISOString(),
      explanation: selected.explanation
    };
    this.runtime.carePlanSelections.push(selection);
    this.saveRuntime();
    return selection;
  }

  getCarePlanHistory(patientId) {
    return this.runtime.carePlanSelections
      .filter((item) => item.patient_id === patientId)
      .sort((left, right) => new Date(left.selected_at) - new Date(right.selected_at));
  }

  addContactMessage(payload, patientId) {
    const message = {
      contact_id: `C${Date.now()}`,
      patient_id: patientId || null,
      name: payload.name || null,
      email: payload.email,
      reason: payload.reason,
      message: payload.message,
      submitted_at: new Date().toISOString()
    };
    this.runtime.contacts.push(message);
    this.saveRuntime();
    return message;
  }

  getDashboard(patientId) {
    const patient = this.getPatientById(patientId);
    const vitals = this.getVitals(patientId);
    const symptoms = this.getSymptoms(patientId);
    const latestVital = vitals[vitals.length - 1] || null;
    const latestSymptom = symptoms[symptoms.length - 1] || null;
    const priorVital = vitals.length > 1 ? vitals[vitals.length - 2] : null;
    const carePlans = this.getCarePlanHistory(patientId);
    const symptomFrequency = {};

    for (const symptom of symptoms) {
      for (const key of ["primary_symptom", "secondary_symptom"]) {
        const name = symptom[key];
        if (!name) {
          continue;
        }
        symptomFrequency[name] = (symptomFrequency[name] || 0) + 1;
      }
    }

    let trend = "stable";
    if (priorVital && latestVital) {
      const latestRisk = deduceRiskLevel(latestVital, latestSymptom);
      const priorRisk = deduceRiskLevel(priorVital, symptoms.length > 1 ? symptoms[symptoms.length - 2] : latestSymptom);
      if (priorRisk === "high" && (latestRisk === "medium" || latestRisk === "low")) {
        trend = "improving";
      } else if ((priorRisk === "low" || priorRisk === "medium") && latestRisk === "high") {
        trend = "deteriorating";
      }
    }

    return {
      patient: patient ? sanitizePatient(patient) : null,
      latestVitalsSnapshot: latestVital,
      vitalTrendHistory: vitals,
      symptomFrequency,
      riskIndicators: {
        currentRiskLevel: deduceRiskLevel(latestVital, latestSymptom),
        latestSymptomSeverity: latestSymptom ? latestSymptom.severity : null
      },
      selectedCarePlanHistory: carePlans,
      trend
    };
  }

  getPatientRecords(patientId) {
    const patient = this.getPatientById(patientId);
    const vitals = this.getVitals(patientId);
    const symptoms = this.getSymptoms(patientId);
    const carePlanResult = this.getCarePlans(patientId);
    const carePlanHistory = this.getCarePlanHistory(patientId);

    return {
      patient,
      vitals,
      symptoms,
      historical_updates: {
        vitals_count: vitals.length,
        symptoms_count: symptoms.length
      },
      /* c8 ignore next */
      suggested_care_plan_summary: carePlanResult.carePlans[0] || null,
      selected_care_plan: carePlanHistory[carePlanHistory.length - 1] || null
    };
  }
}

module.exports = {
  DataStore,
  DEFAULT_SEEDED_PASSWORD,
  __private: {
    DEFAULT_DATASET_DIR,
    DEFAULT_RUNTIME_PATH,
    createPasswordRecord,
    parseCsv,
    readCsv,
    sanitizePatient,
    sanitizeSymptom,
    sanitizeVital,
    sortByRecordedAt,
    toNumber,
    verifyPassword
  }
};
