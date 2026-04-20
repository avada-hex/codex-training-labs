const crypto = require("crypto");
const http = require("http");
const { DataStore } = require("./data-store");

const TOKEN_SECRET = process.env.API_TOKEN_SECRET || "capstone-team-5-local-secret";

function createToken(patientId) {
  const payload = Buffer.from(
    JSON.stringify({
      patientId,
      exp: Date.now() + 1000 * 60 * 60 * 8
    })
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [payload, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");

  if (signature !== expected) {
    return null;
  }

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (!decoded.exp || decoded.exp < Date.now()) {
    return null;
  }

  return decoded.patientId;
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS"
  });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString("utf8");
      if (body.length > 1024 * 1024) {
        reject(new Error("Payload too large"));
      }
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });
    request.on("error", reject);
  });
}

function validateRequiredFields(payload, fields) {
  return fields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || value === "";
  });
}

function getAuthPatientId(request) {
  const header = request.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return null;
  }
  return verifyToken(header.slice("Bearer ".length));
}

function createApp(options = {}) {
  const store = options.store || new DataStore(options.dataStoreOptions);

  return http.createServer(async (request, response) => {
    if (!request.url) {
      sendJson(response, 404, { error: "Route not found" });
      return;
    }

    if (request.method === "OPTIONS") {
      sendJson(response, 204, {});
      return;
    }

    const url = new URL(request.url, "http://127.0.0.1");
    const patientId = getAuthPatientId(request);

    try {
      if (request.method === "POST" && url.pathname === "/api/auth/register") {
        const payload = await readBody(request);
        const missing = validateRequiredFields(payload, [
          "first_name",
          "last_name",
          "age",
          "sex",
          "origin",
          "diet",
          "habits",
          "email",
          "phone",
          "password"
        ]);
        if (missing.length > 0) {
          sendJson(response, 400, { error: `Missing required fields: ${missing.join(", ")}` });
          return;
        }

        if (store.getPatientByEmail(payload.email)) {
          sendJson(response, 409, { error: "An account with this email already exists." });
          return;
        }

        const patient = store.registerPatient(payload);
        sendJson(response, 201, {
          patient,
          token: createToken(patient.patient_id)
        });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/auth/login") {
        const payload = await readBody(request);
        const missing = validateRequiredFields(payload, ["email", "password"]);
        if (missing.length > 0) {
          sendJson(response, 400, { error: `Missing required fields: ${missing.join(", ")}` });
          return;
        }

        const patient = store.validateLogin(payload.email, payload.password);
        if (!patient) {
          sendJson(response, 401, { error: "Invalid credentials." });
          return;
        }

        sendJson(response, 200, {
          token: createToken(patient.patient_id),
          patient
        });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/contact") {
        const payload = await readBody(request);
        const missing = validateRequiredFields(payload, ["email", "reason", "message"]);
        if (missing.length > 0) {
          sendJson(response, 400, { error: `Missing required fields: ${missing.join(", ")}` });
          return;
        }

        const message = store.addContactMessage(payload, patientId);
        sendJson(response, 201, {
          confirmation: "Support request received.",
          contactId: message.contact_id,
          submittedAt: message.submitted_at
        });
        return;
      }

      if (url.pathname.startsWith("/api/patients/me")) {
        if (!patientId) {
          sendJson(response, 401, { error: "Authentication required." });
          return;
        }
      }

      if (request.method === "GET" && url.pathname === "/api/patients/me") {
        const patient = store.getPatientById(patientId);
        sendJson(response, 200, { patient });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/patients/me/records") {
        sendJson(response, 200, store.getPatientRecords(patientId));
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/patients/me/vitals") {
        const payload = await readBody(request);
        const missing = validateRequiredFields(payload, [
          "temperature_f",
          "heart_rate_bpm",
          "systolic_bp",
          "diastolic_bp",
          "respiratory_rate",
          "oxygen_saturation",
          "weight_kg",
          "bmi"
        ]);
        if (missing.length > 0) {
          sendJson(response, 400, { error: `Missing required fields: ${missing.join(", ")}` });
          return;
        }

        const vital = store.addVital(patientId, payload);
        sendJson(response, 201, { vital });
        return;
      }

      if (request.method === "PUT" && /^\/api\/patients\/me\/vitals\/[^/]+$/.test(url.pathname)) {
        const payload = await readBody(request);
        const vitalId = url.pathname.split("/").pop();
        const vital = store.updateVital(patientId, vitalId, payload);
        if (!vital) {
          sendJson(response, 404, { error: "Vital record not found." });
          return;
        }
        sendJson(response, 200, { vital });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/patients/me/symptoms") {
        const payload = await readBody(request);
        const missing = validateRequiredFields(payload, ["primary_symptom", "pain_level", "severity", "duration_days"]);
        if (missing.length > 0) {
          sendJson(response, 400, { error: `Missing required fields: ${missing.join(", ")}` });
          return;
        }

        const symptom = store.addSymptom(patientId, payload);
        sendJson(response, 201, { symptom });
        return;
      }

      if (request.method === "PUT" && /^\/api\/patients\/me\/symptoms\/[^/]+$/.test(url.pathname)) {
        const payload = await readBody(request);
        const symptomId = url.pathname.split("/").pop();
        const symptom = store.updateSymptom(patientId, symptomId, payload);
        if (!symptom) {
          sendJson(response, 404, { error: "Symptom record not found." });
          return;
        }
        sendJson(response, 200, { symptom });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/patients/me/care-plans") {
        sendJson(response, 200, store.getCarePlans(patientId));
        return;
      }

      if (request.method === "POST" && /^\/api\/patients\/me\/care-plans\/[^/]+\/select$/.test(url.pathname)) {
        const carePlanId = url.pathname.split("/").slice(-2)[0];
        const selection = store.selectCarePlan(patientId, carePlanId);
        if (!selection) {
          sendJson(response, 404, { error: "Care plan not found." });
          return;
        }
        sendJson(response, 200, { selection });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/patients/me/dashboard") {
        sendJson(response, 200, store.getDashboard(patientId));
        return;
      }

      sendJson(response, 404, { error: "Route not found." });
    } catch (error) {
      const statusCode = error.message === "Invalid JSON body" || error.message === "Payload too large" ? 400 : 500;
      sendJson(response, statusCode, {
        error: statusCode === 500 ? "Internal server error." : error.message
      });
    }
  });
}

function startServer(port = Number(process.env.PORT || 3000), options = {}) {
  const server = createApp(options);
  return new Promise((resolve) => {
    server.listen(port, () => {
      resolve(server);
    });
  });
}

/* c8 ignore next 6 */
if (require.main === module) {
  startServer().then((server) => {
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : process.env.PORT || 3000;
    console.log(`Backend API listening on http://127.0.0.1:${port}`);
  });
}

module.exports = {
  createApp,
  startServer,
  __private: {
    createToken,
    getAuthPatientId,
    readBody,
    sendJson,
    validateRequiredFields,
    verifyToken
  }
};
