const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { EventEmitter } = require("events");
const { DataStore } = require("../src/data-store");
const { createApp, startServer, __private } = require("../src/server");

function createRuntimePath() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "capstone-server-tests-"));
  return path.join(tempDir, "runtime-data.json");
}

async function createHarness() {
  const store = new DataStore({ runtimePath: createRuntimePath() });
  const server = await startServer(0, { store });
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  async function request(pathname, options = {}) {
    const response = await fetch(`${baseUrl}${pathname}`, options);
    const text = await response.text();
    return {
      status: response.status,
      body: text ? JSON.parse(text) : {}
    };
  }

  async function rawRequest(pathname, body, headers = {}) {
    return await new Promise((resolve, reject) => {
      const req = http.request(
        `${baseUrl}${pathname}`,
        {
          method: "POST",
          headers
        },
        (res) => {
          let data = "";
          res.setEncoding("utf8");
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            resolve({
              status: res.statusCode,
              body: data ? JSON.parse(data) : {}
            });
          });
        }
      );
      req.on("error", reject);
      req.write(body);
      req.end();
    });
  }

  async function close() {
    await new Promise((resolve) => server.close(resolve));
  }

  return { request, rawRequest, close };
}

test("server helper functions cover token, headers, sendJson, and readBody", async () => {
  const token = __private.createToken("P001");
  assert.equal(__private.verifyToken(token), "P001");
  assert.equal(__private.verifyToken(), null);
  assert.equal(__private.verifyToken("bad.token"), null);
  assert.equal(__private.getAuthPatientId({ headers: { authorization: `Bearer ${token}` } }), "P001");
  assert.equal(__private.getAuthPatientId({ headers: {} }), null);
  assert.deepEqual(__private.validateRequiredFields({ email: "", reason: "ok" }, ["email", "reason", "message"]), [
    "email",
    "message"
  ]);

  const response = {
    writeHead(statusCode, headers) {
      this.statusCode = statusCode;
      this.headers = headers;
    },
    end(body) {
      this.body = body;
    }
  };
  __private.sendJson(response, 201, { ok: true });
  assert.equal(response.statusCode, 201);
  assert.match(response.headers["Content-Type"], /application\/json/);
  assert.match(response.body, /ok/);

  const request = new EventEmitter();
  const readPromise = __private.readBody(request);
  request.emit("data", Buffer.from("{\"message\":\"hi\"}"));
  request.emit("end");
  assert.deepEqual(await readPromise, { message: "hi" });

  const emptyRequest = new EventEmitter();
  const emptyPromise = __private.readBody(emptyRequest);
  emptyRequest.emit("end");
  assert.deepEqual(await emptyPromise, {});
});

test("verifyToken rejects expired tokens", () => {
  const payload = Buffer.from(JSON.stringify({ patientId: "P001", exp: Date.now() - 10 })).toString("base64url");
  const signature = require("crypto").createHmac("sha256", "capstone-team-5-local-secret").update(payload).digest("base64url");
  assert.equal(__private.verifyToken(`${payload}.${signature}`), null);
});

test("readBody rejects invalid json, oversized payloads, and request errors", async () => {
  const invalidRequest = new EventEmitter();
  const invalidPromise = __private.readBody(invalidRequest);
  invalidRequest.emit("data", Buffer.from("{"));
  invalidRequest.emit("end");
  await assert.rejects(invalidPromise, /Invalid JSON body/);

  const largeRequest = new EventEmitter();
  const largePromise = __private.readBody(largeRequest);
  largeRequest.emit("data", Buffer.alloc(1024 * 1024 + 1, "a"));
  await assert.rejects(largePromise, /Payload too large/);

  const errorRequest = new EventEmitter();
  const errorPromise = __private.readBody(errorRequest);
  errorRequest.emit("error", new Error("stream failed"));
  await assert.rejects(errorPromise, /stream failed/);
});

test("createApp returns a server instance", () => {
  const app = createApp({
    store: new DataStore({ runtimePath: createRuntimePath() })
  });
  assert.equal(typeof app.listen, "function");

  const appWithOptions = createApp({
    dataStoreOptions: {
      runtimePath: createRuntimePath()
    }
  });
  assert.equal(typeof appWithOptions.listen, "function");
});

test("server handles missing request urls and internal errors safely", async () => {
  const app = createApp({
    store: {
      getPatientByEmail() {
        throw new Error("boom");
      }
    }
  });

  const missingUrl = await new Promise((resolve) => {
    const response = {
      writeHead(statusCode, headers) {
        this.statusCode = statusCode;
        this.headers = headers;
      },
      end(body) {
        resolve({ statusCode: this.statusCode, body: JSON.parse(body) });
      }
    };
    app.emit("request", { method: "GET", headers: {} }, response);
  });
  assert.equal(missingUrl.statusCode, 404);

  const failedRegister = await new Promise((resolve, reject) => {
    const request = new EventEmitter();
    request.method = "POST";
    request.url = "/api/auth/register";
    request.headers = {};
    request.on = request.addListener.bind(request);

    const response = {
      writeHead(statusCode) {
        this.statusCode = statusCode;
      },
      end(body) {
        resolve({ statusCode: this.statusCode, body: JSON.parse(body) });
      }
    };

    app.emit("request", request, response);
    process.nextTick(() => {
      request.emit("data", Buffer.from(JSON.stringify({
        first_name: "Test",
        last_name: "Patient",
        age: 42,
        sex: "Female",
        origin: "American",
        diet: "Mediterranean",
        habits: "Regular exercise",
        email: "new.user@test.local",
        phone: "+1-555-0100",
        password: "Password!123"
      })));
      request.emit("end");
    });
  });
  assert.equal(failedRegister.statusCode, 500);
  assert.equal(failedRegister.body.error, "Internal server error.");
});

test("server endpoints support auth, protected routes, validation, and CRUD flows", async () => {
  const harness = await createHarness();

  try {
    const unauthenticated = await harness.request("/api/patients/me");
    assert.equal(unauthenticated.status, 401);

    const missingRegister = await harness.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "missing@test.local" })
    });
    assert.equal(missingRegister.status, 400);

    const register = await harness.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: "Test",
        last_name: "Patient",
        age: 42,
        sex: "Female",
        origin: "American",
        diet: "Mediterranean",
        habits: "Regular exercise",
        email: "new.user@test.local",
        phone: "+1-555-0100",
        password: "Password!123"
      })
    });
    assert.equal(register.status, 201);
    assert.ok(register.body.token);

    const duplicateRegister = await harness.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: "Test",
        last_name: "Patient",
        age: 42,
        sex: "Female",
        origin: "American",
        diet: "Mediterranean",
        habits: "Regular exercise",
        email: "new.user@test.local",
        phone: "+1-555-0100",
        password: "Password!123"
      })
    });
    assert.equal(duplicateRegister.status, 409);

    const missingLogin = await harness.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "patient001@synthetic-health.test" })
    });
    assert.equal(missingLogin.status, 400);

    const invalidLogin = await harness.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "patient001@synthetic-health.test", password: "wrong" })
    });
    assert.equal(invalidLogin.status, 401);

    const seededLogin = await harness.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "patient001@synthetic-health.test", password: "Password123!" })
    });
    assert.equal(seededLogin.status, 200);
    const authHeaders = {
      Authorization: `Bearer ${seededLogin.body.token}`,
      "Content-Type": "application/json"
    };

    const me = await harness.request("/api/patients/me", { headers: authHeaders });
    assert.equal(me.status, 200);
    assert.equal(me.body.patient.patient_id, "P001");

    const records = await harness.request("/api/patients/me/records", { headers: authHeaders });
    assert.equal(records.status, 200);
    assert.ok(Array.isArray(records.body.vitals));

    const invalidVitals = await harness.request("/api/patients/me/vitals", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ heart_rate_bpm: 80 })
    });
    assert.equal(invalidVitals.status, 400);

    const createVital = await harness.request("/api/patients/me/vitals", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        temperature_f: 99.1,
        heart_rate_bpm: 81,
        systolic_bp: 120,
        diastolic_bp: 79,
        respiratory_rate: 18,
        oxygen_saturation: 97,
        weight_kg: 45,
        bmi: 20.2
      })
    });
    assert.equal(createVital.status, 201);

    const updateVital = await harness.request(`/api/patients/me/vitals/${createVital.body.vital.vital_id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ heart_rate_bpm: 85 })
    });
    assert.equal(updateVital.status, 200);

    const missingVital = await harness.request("/api/patients/me/vitals/V404", {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ heart_rate_bpm: 85 })
    });
    assert.equal(missingVital.status, 404);

    const invalidSymptoms = await harness.request("/api/patients/me/symptoms", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ primary_symptom: "Cough" })
    });
    assert.equal(invalidSymptoms.status, 400);

    const createSymptom = await harness.request("/api/patients/me/symptoms", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        primary_symptom: "Cough",
        pain_level: 2,
        severity: "Mild",
        duration_days: 1
      })
    });
    assert.equal(createSymptom.status, 201);

    const updateSymptom = await harness.request(`/api/patients/me/symptoms/${createSymptom.body.symptom.symptom_id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ severity: "Moderate" })
    });
    assert.equal(updateSymptom.status, 200);

    const missingSymptom = await harness.request("/api/patients/me/symptoms/S404", {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ severity: "Moderate" })
    });
    assert.equal(missingSymptom.status, 404);

    const carePlans = await harness.request("/api/patients/me/care-plans", { headers: authHeaders });
    assert.equal(carePlans.status, 200);
    assert.ok(carePlans.body.carePlans.length > 0);

    const selectedPlan = await harness.request(`/api/patients/me/care-plans/${carePlans.body.carePlans[0].carePlanId}/select`, {
      method: "POST",
      headers: authHeaders
    });
    assert.equal(selectedPlan.status, 200);

    const missingCarePlan = await harness.request("/api/patients/me/care-plans/not-real/select", {
      method: "POST",
      headers: authHeaders
    });
    assert.equal(missingCarePlan.status, 404);

    const dashboard = await harness.request("/api/patients/me/dashboard", { headers: authHeaders });
    assert.equal(dashboard.status, 200);

    const invalidContact = await harness.request("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "patient@test.local" })
    });
    assert.equal(invalidContact.status, 400);

    const contact = await harness.request("/api/contact", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        email: "patient@test.local",
        reason: "Support",
        message: "Need help"
      })
    });
    assert.equal(contact.status, 201);

    const options = await harness.request("/api/patients/me", {
      method: "OPTIONS",
      headers: authHeaders
    });
    assert.equal(options.status, 204);

    const rawInvalid = await harness.rawRequest("/api/auth/login", "{", {
      "Content-Type": "application/json"
    });
    assert.equal(rawInvalid.status, 400);

    const oversized = await harness.rawRequest("/api/auth/login", "a".repeat(1024 * 1024 + 1), {
      "Content-Type": "application/json"
    });
    assert.equal(oversized.status, 400);

    const unknown = await harness.request("/unknown");
    assert.equal(unknown.status, 404);
  } finally {
    await harness.close();
  }
});
