const assert = require("assert");
const { startServer } = require("./src/server");
const { DEFAULT_SEEDED_PASSWORD } = require("./src/data-store");

async function requestJson(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  return { status: response.status, body };
}

async function run() {
  const server = await startServer(0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const timestamp = Date.now();
  const email = `new.patient.${timestamp}@synthetic-health.test`;

  try {
    const unauthenticated = await requestJson(baseUrl, "/api/patients/me");
    assert.strictEqual(unauthenticated.status, 401);

    const login = await requestJson(baseUrl, "/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "patient001@synthetic-health.test",
        password: DEFAULT_SEEDED_PASSWORD
      })
    });
    assert.strictEqual(login.status, 200);
    const seededToken = login.body.token;
    assert.ok(seededToken);

    const me = await requestJson(baseUrl, "/api/patients/me", {
      headers: { Authorization: `Bearer ${seededToken}` }
    });
    assert.strictEqual(me.status, 200);
    assert.strictEqual(me.body.patient.patient_id, "P001");

    const records = await requestJson(baseUrl, "/api/patients/me/records", {
      headers: { Authorization: `Bearer ${seededToken}` }
    });
    assert.strictEqual(records.status, 200);
    assert.ok(Array.isArray(records.body.vitals));
    assert.ok(Array.isArray(records.body.symptoms));

    const carePlans = await requestJson(baseUrl, "/api/patients/me/care-plans", {
      headers: { Authorization: `Bearer ${seededToken}` }
    });
    assert.strictEqual(carePlans.status, 200);
    assert.ok(carePlans.body.carePlans.length > 0);

    const selectedPlanId = carePlans.body.carePlans[0].carePlanId;
    const selectPlan = await requestJson(baseUrl, `/api/patients/me/care-plans/${selectedPlanId}/select`, {
      method: "POST",
      headers: { Authorization: `Bearer ${seededToken}` }
    });
    assert.strictEqual(selectPlan.status, 200);

    const createVital = await requestJson(baseUrl, "/api/patients/me/vitals", {
      method: "POST",
      headers: { Authorization: `Bearer ${seededToken}` },
      body: JSON.stringify({
        temperature_f: 100.9,
        heart_rate_bpm: 95,
        systolic_bp: 132,
        diastolic_bp: 84,
        respiratory_rate: 18,
        oxygen_saturation: 95,
        weight_kg: 44.1,
        bmi: 20.3
      })
    });
    assert.strictEqual(createVital.status, 201);
    const vitalId = createVital.body.vital.vital_id;

    const updateVital = await requestJson(baseUrl, `/api/patients/me/vitals/${vitalId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${seededToken}` },
      body: JSON.stringify({
        temperature_f: 99.4
      })
    });
    assert.strictEqual(updateVital.status, 200);
    assert.strictEqual(updateVital.body.vital.temperature_f, 99.4);

    const createSymptom = await requestJson(baseUrl, "/api/patients/me/symptoms", {
      method: "POST",
      headers: { Authorization: `Bearer ${seededToken}` },
      body: JSON.stringify({
        primary_symptom: "Fatigue",
        secondary_symptom: "Headache",
        pain_level: 4,
        severity: "Moderate",
        duration_days: 2,
        notes: "Verification flow"
      })
    });
    assert.strictEqual(createSymptom.status, 201);
    const symptomId = createSymptom.body.symptom.symptom_id;

    const updateSymptom = await requestJson(baseUrl, `/api/patients/me/symptoms/${symptomId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${seededToken}` },
      body: JSON.stringify({
        severity: "Mild",
        pain_level: 2
      })
    });
    assert.strictEqual(updateSymptom.status, 200);
    assert.strictEqual(updateSymptom.body.symptom.severity, "Mild");

    const dashboard = await requestJson(baseUrl, "/api/patients/me/dashboard", {
      headers: { Authorization: `Bearer ${seededToken}` }
    });
    assert.strictEqual(dashboard.status, 200);
    assert.ok(dashboard.body.latestVitalsSnapshot);
    assert.ok(dashboard.body.selectedCarePlanHistory.length >= 1);

    const contact = await requestJson(baseUrl, "/api/contact", {
      method: "POST",
      headers: { Authorization: `Bearer ${seededToken}` },
      body: JSON.stringify({
        name: "P001 Support",
        email: "patient001@synthetic-health.test",
        reason: "General Question",
        message: "Need help understanding my care plan."
      })
    });
    assert.strictEqual(contact.status, 201);

    const register = await requestJson(baseUrl, "/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        first_name: "Test",
        last_name: "Patient",
        age: 34,
        sex: "Female",
        origin: "American",
        diet: "Mediterranean",
        habits: "Regular exercise",
        email,
        phone: "+1-555-000-0000",
        password: "SecurePass!123"
      })
    });
    assert.strictEqual(register.status, 201);

    const secondToken = register.body.token;
    const forbiddenUpdate = await requestJson(baseUrl, `/api/patients/me/vitals/${vitalId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${secondToken}` },
      body: JSON.stringify({
        heart_rate_bpm: 120
      })
    });
    assert.strictEqual(forbiddenUpdate.status, 404);

    console.log("Verified endpoints:");
    console.log("POST /api/auth/register");
    console.log("POST /api/auth/login");
    console.log("GET /api/patients/me");
    console.log("GET /api/patients/me/records");
    console.log("POST /api/patients/me/vitals");
    console.log("PUT /api/patients/me/vitals/:vitalId");
    console.log("POST /api/patients/me/symptoms");
    console.log("PUT /api/patients/me/symptoms/:symptomId");
    console.log("GET /api/patients/me/care-plans");
    console.log("POST /api/patients/me/care-plans/:carePlanId/select");
    console.log("GET /api/patients/me/dashboard");
    console.log("POST /api/contact");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
