const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { DataStore, DEFAULT_SEEDED_PASSWORD, __private } = require("../src/data-store");

function createRuntimePath() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "capstone-backend-tests-"));
  return path.join(tempDir, "runtime-data.json");
}

function createStore() {
  return new DataStore({
    runtimePath: createRuntimePath()
  });
}

test("parseCsv handles quoting and empty input", () => {
  const csv = "\"id\",\"name\"\r\n\"1\",\"Doe, Jane\"\r\n\"2\",\"Quoted \"\"Value\"\"\"\r\n";
  assert.deepEqual(__private.parseCsv(csv), [
    { id: "1", name: "Doe, Jane" },
    { id: "2", name: "Quoted \"Value\"" }
  ]);
  assert.deepEqual(__private.parseCsv("\"id\",\"name\"\n\"3\",\"No trailing newline\""), [
    { id: "3", name: "No trailing newline" }
  ]);
  assert.deepEqual(__private.parseCsv("\"id\",\"name\"\n\"4\""), [
    { id: "4", name: "" }
  ]);
  assert.deepEqual(__private.parseCsv(""), []);
});

test("helper sanitizers and password helpers normalize values", () => {
  assert.equal(__private.toNumber("12.4"), 12.4);
  assert.equal(__private.toNumber("oops"), null);
  assert.equal(
    __private.sanitizePatient({
      patient_id: "P777",
      first_name: "A",
      last_name: "B",
      age: "45",
      sex: "Female",
      origin: "US",
      diet: "Balanced",
      habits: "None",
      email: "a@test",
      phone: "123",
      registration_date: "2026-01-01"
    }).age,
    45
  );
  assert.equal(
    __private.sanitizeVital({
      vital_id: "V1",
      patient_id: "P1",
      recorded_at: "2026",
      temperature_f: "99.1",
      heart_rate_bpm: "82",
      systolic_bp: "120",
      diastolic_bp: "80",
      respiratory_rate: "18",
      oxygen_saturation: "98",
      weight_kg: "70",
      bmi: "23.2"
    }).bmi,
    23.2
  );
  assert.equal(
    __private.sanitizeSymptom({
      symptom_id: "S1",
      patient_id: "P1",
      recorded_at: "2026",
      primary_symptom: "Cough",
      secondary_symptom: "",
      pain_level: "2",
      severity: "Mild",
      duration_days: "3",
      notes: "ok"
    }).duration_days,
    3
  );

  const passwordRecord = __private.createPasswordRecord("Secret!123");
  assert.equal(__private.verifyPassword("Secret!123", passwordRecord), true);
  assert.equal(__private.verifyPassword("wrong", passwordRecord), false);
  assert.equal(__private.verifyPassword("wrong", null), false);
});

test("store reads seeded data and supports seeded and runtime login", () => {
  const store = createStore();
  const seededPatient = store.getPatientByEmail("patient001@synthetic-health.test");
  assert.equal(seededPatient.patient_id, "P001");
  assert.equal(store.validateLogin("patient001@synthetic-health.test", DEFAULT_SEEDED_PASSWORD).patient_id, "P001");
  assert.equal(store.validateLogin("patient001@synthetic-health.test", "wrong"), null);
  assert.equal(store.validateLogin("missing@example.test", "wrong"), null);
  assert.equal(store.getPatientById("P404"), null);

  const runtimePatient = store.registerPatient({
    first_name: "Test",
    last_name: "Patient",
    age: 38,
    sex: "Female",
    origin: "American",
    diet: "Mediterranean",
    habits: "Regular exercise",
    email: "runtime@example.test",
    phone: "+1-555-0101",
    password: "Password!456"
  });

  assert.match(runtimePatient.patient_id, /^P\d+$/);
  assert.equal(store.validateLogin("runtime@example.test", "Password!456").patient_id, runtimePatient.patient_id);
  assert.equal(store.validateLogin("runtime@example.test", "nope"), null);
  assert.equal(store.getPatientByEmail(""), null);
  assert.equal(store.getPatientById(runtimePatient.patient_id).email, "runtime@example.test");
});

test("store adds and updates vitals and symptoms", () => {
  const store = createStore();
  const newVital = store.addVital("P001", {
    temperature_f: 99.9,
    heart_rate_bpm: 80,
    systolic_bp: 122,
    diastolic_bp: 81,
    respiratory_rate: 18,
    oxygen_saturation: 97,
    weight_kg: 45,
    bmi: 20
  });
  const updatedNewVital = store.updateVital("P001", newVital.vital_id, { heart_rate_bpm: 84 });
  const updatedSeededVital = store.updateVital("P001", "V001", { oxygen_saturation: 95 });

  const newSymptom = store.addSymptom("P001", {
    primary_symptom: "Fatigue",
    secondary_symptom: "Headache",
    pain_level: 3,
    severity: "Mild",
    duration_days: 2,
    notes: "Added in test"
  });
  const updatedNewSymptom = store.updateSymptom("P001", newSymptom.symptom_id, { severity: "Moderate" });
  const updatedSeededSymptom = store.updateSymptom("P001", "S001", { notes: "Updated seeded" });
  const updatedSeededVitalAgain = store.updateVital("P001", "V001", { oxygen_saturation: 94 });
  const updatedSeededSymptomAgain = store.updateSymptom("P001", "S001", { notes: "Updated again" });

  assert.equal(updatedNewVital.heart_rate_bpm, 84);
  assert.equal(updatedSeededVital.oxygen_saturation, 95);
  assert.equal(updatedSeededVitalAgain.oxygen_saturation, 94);
  assert.equal(updatedNewSymptom.severity, "Moderate");
  assert.equal(updatedSeededSymptom.notes, "Updated seeded");
  assert.equal(updatedSeededSymptomAgain.notes, "Updated again");
  assert.equal(store.updateVital("P999", "V404", { heart_rate_bpm: 70 }), null);
  assert.equal(store.updateSymptom("P999", "S404", { severity: "Mild" }), null);
});

test("store aggregates records, care plans, dashboard, and contact history", () => {
  const store = createStore();
  store.addVital("P001", {
    recorded_at: "2026-04-20T09:00:00Z",
    temperature_f: 102,
    heart_rate_bpm: 110,
    systolic_bp: 148,
    diastolic_bp: 92,
    respiratory_rate: 22,
    oxygen_saturation: 93,
    weight_kg: 44,
    bmi: 21
  });
  store.addSymptom("P001", {
    recorded_at: "2026-04-20T09:00:00Z",
    primary_symptom: "Shortness of breath",
    secondary_symptom: "Chest discomfort",
    pain_level: 6,
    severity: "Moderate",
    duration_days: 3,
    notes: "Escalating"
  });

  const carePlans = store.getCarePlans("P001");
  const selection = store.selectCarePlan("P001", carePlans.carePlans[0].carePlanId);
  const dashboard = store.getDashboard("P001");
  const records = store.getPatientRecords("P001");
  const contact = store.addContactMessage({
    email: "patient001@synthetic-health.test",
    reason: "Support",
    message: "Need help"
  }, "P001");

  assert.ok(carePlans.carePlans.length > 0);
  assert.ok(selection.selected_at);
  assert.equal(store.selectCarePlan("P001", "missing"), null);
  assert.equal(dashboard.patient.patient_id, "P001");
  assert.ok(Array.isArray(dashboard.vitalTrendHistory));
  assert.ok(["stable", "improving", "deteriorating"].includes(dashboard.trend));
  assert.equal(records.patient.patient_id, "P001");
  assert.ok(records.suggested_care_plan_summary);
  assert.equal(contact.patient_id, "P001");
  assert.equal(createStore().getPatientRecords("P001").selected_care_plan, null);
});

test("store handles existing runtime files and dashboard trend branches", () => {
  const runtimePath = createRuntimePath();
  fs.writeFileSync(
    runtimePath,
    `${JSON.stringify({
      runtimePatients: [
        {
          patient_id: "P999",
          first_name: "Stored",
          last_name: "Patient",
          age: 50,
          sex: "Male",
          origin: "US",
          diet: "Balanced",
          habits: "None",
          email: "stored@example.test",
          phone: "123",
          registration_date: "2026-01-01"
        }
      ],
      credentials: [],
      vitals: [],
      symptoms: [],
      carePlanSelections: [],
      contacts: [],
      updatedVitals: [],
      updatedSymptoms: []
    })}\n`
  );
  const store = new DataStore({ runtimePath });

  assert.equal(store.getPatientByEmail("stored@example.test").patient_id, "P999");
  assert.equal(new DataStore({ datasetDir: __private.DEFAULT_DATASET_DIR }).getPatientByEmail("patient001@synthetic-health.test").patient_id, "P001");

  store.addVital("P001", {
    recorded_at: "2026-04-20T08:00:00Z",
    temperature_f: 103,
    heart_rate_bpm: 120,
    systolic_bp: 160,
    diastolic_bp: 100,
    respiratory_rate: 24,
    oxygen_saturation: 91,
    weight_kg: 44,
    bmi: 21
  });
  store.addSymptom("P001", {
    recorded_at: "2026-04-20T08:00:00Z",
    primary_symptom: "Chest pain",
    secondary_symptom: "",
    pain_level: 8,
    severity: "Severe",
    duration_days: 3,
    notes: "High risk"
  });
  store.addVital("P001", {
    recorded_at: "2026-04-20T09:00:00Z",
    temperature_f: 98.8,
    heart_rate_bpm: 78,
    systolic_bp: 118,
    diastolic_bp: 76,
    respiratory_rate: 18,
    oxygen_saturation: 98,
    weight_kg: 44,
    bmi: 21
  });
  store.addSymptom("P001", {
    recorded_at: "2026-04-20T09:00:00Z",
    primary_symptom: "Fatigue",
    secondary_symptom: "",
    pain_level: 1,
    severity: "Mild",
    duration_days: 1,
    notes: "Improving"
  });
  assert.equal(store.getDashboard("P001").trend, "improving");

  const worseningStore = createStore();
  worseningStore.addVital("P001", {
    recorded_at: "2026-04-20T08:00:00Z",
    temperature_f: 98.8,
    heart_rate_bpm: 78,
    systolic_bp: 118,
    diastolic_bp: 76,
    respiratory_rate: 18,
    oxygen_saturation: 98,
    weight_kg: 44,
    bmi: 21
  });
  worseningStore.addSymptom("P001", {
    recorded_at: "2026-04-20T08:00:00Z",
    primary_symptom: "Fatigue",
    secondary_symptom: "",
    pain_level: 1,
    severity: "Mild",
    duration_days: 1,
    notes: "Low risk"
  });
  worseningStore.addVital("P001", {
    recorded_at: "2026-04-20T09:00:00Z",
    temperature_f: 103,
    heart_rate_bpm: 121,
    systolic_bp: 160,
    diastolic_bp: 100,
    respiratory_rate: 24,
    oxygen_saturation: 91,
    weight_kg: 44,
    bmi: 21
  });
  worseningStore.addSymptom("P001", {
    recorded_at: "2026-04-20T09:00:00Z",
    primary_symptom: "Chest pain",
    secondary_symptom: "",
    pain_level: 8,
    severity: "Severe",
    duration_days: 1,
    notes: "High risk"
  });
  assert.equal(worseningStore.getDashboard("P001").trend, "deteriorating");
  assert.equal(worseningStore.addContactMessage({ email: "nobody@test", reason: "Support", message: "Hi" }).patient_id, null);
  assert.equal(worseningStore.getDashboard("P404").patient, null);
  assert.equal(worseningStore.getDashboard("P404").riskIndicators.latestSymptomSeverity, null);
  assert.equal(worseningStore.getCarePlans("P404").riskLevel, "unknown");

  worseningStore.runtime.vitals.push({
    vital_id: "V999",
    patient_id: "P001",
    recorded_at: "",
    temperature_f: 98.6,
    heart_rate_bpm: 78,
    systolic_bp: 118,
    diastolic_bp: 76,
    respiratory_rate: 18,
    oxygen_saturation: 98,
    weight_kg: 44,
    bmi: 21
  });
  worseningStore.runtime.symptoms.push({
    symptom_id: "S999",
    patient_id: "P001",
    recorded_at: "",
    primary_symptom: "Fatigue",
    secondary_symptom: "",
    pain_level: 1,
    severity: "Mild",
    duration_days: 1,
    notes: ""
  });
  assert.ok(worseningStore.updateVital("P001", "V999", {}).recorded_at);
  assert.ok(worseningStore.updateSymptom("P001", "S999", {}).recorded_at);
});

test("readCsv and sortByRecordedAt work against the dataset", () => {
  const patients = __private.readCsv(__private.DEFAULT_DATASET_DIR, "patient_details.csv");
  assert.ok(patients.length >= 100);

  const sorted = __private.sortByRecordedAt([
    { recorded_at: "2026-01-03T00:00:00Z" },
    { recorded_at: "2026-01-01T00:00:00Z" },
    { recorded_at: "2026-01-02T00:00:00Z" }
  ]);

  assert.deepEqual(sorted.map((item) => item.recorded_at), [
    "2026-01-01T00:00:00Z",
    "2026-01-02T00:00:00Z",
    "2026-01-03T00:00:00Z"
  ]);
});
