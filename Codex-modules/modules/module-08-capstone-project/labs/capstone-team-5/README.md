# Capstone Team 5 - Clinical Decision Support System

## Project Overview

This capstone defines a patient-facing Clinical Decision Support System that helps patients manage health records, track symptoms and vitals, and review suggested care plans based on their clinical profile and historical data.

The application workflow starts when a new patient registers and logs in. After authentication, the patient can view stored records, add or update symptoms and vital signs, review suggested care plans, inspect dashboard trends, and contact the care team for support.

This README is the project specification for the capstone. It is intended to guide implementation, testing, and demonstration without adding frontend, backend, or database files in this pass.

## Goals

- Provide a secure patient login and registration experience.
- Fetch and display patient records with symptoms, vitals, and care plan recommendations.
- Let patients add and update vital sign and symptom information.
- Suggest care plans based on patient demographics, vitals, lifestyle factors, and historical records.
- Show a clinical performance dashboard using historical patient data.
- Include a contact us page for support and patient communication.
- Prepare a realistic seeded dataset with at least 100 to 200 patient records.

## Tech Stack

- Frontend: React
- Backend: latest Node.js with REST APIs
- Database: H2 database

## User Roles and Main Workflows

### Patient

Patients are the primary users of the application. They should be able to register, log in, view their profile and clinical records, update their own vitals and symptoms, review suggested care plans, select a care plan, and use the contact us page.

### Care Team or Admin

The initial capstone can document care team or admin access as a future extension. Patient data access should still be designed so it can support role-based permissions later.

## Functional Requirements

### 1. Login and Register

The application must allow new patients to register and existing patients to log in securely.

Expected behavior:

- New patients can create an account with basic identity and contact details.
- Passwords are never stored as plain text.
- Login returns an authenticated session or token.
- Protected pages and APIs are unavailable to unauthenticated users.

### 2. Read and Show Patient Records

The UI must fetch and display patient records after login.

Patient record details should include:

- Patient identifier
- Age
- Sex
- Origin
- Diet
- Habits
- Symptoms
- Vitals
- Historical updates
- Suggested care plan summary

### 3. Add and Update Vitals and Symptoms

Patients must be able to add new entries and update their latest health information.

Vitals can include:

- Temperature
- Heart rate
- Blood pressure
- Respiratory rate
- Oxygen saturation
- Weight or BMI

Symptoms can include:

- Fever
- Cough
- Fatigue
- Shortness of breath
- Chest pain
- Headache
- Dizziness
- Pain level

Each update should be timestamped so the dashboard can show historical trends.

### 4. Suggested Care Plans

The application must display suggested care plans based on the patient record.

The patient should be able to:

- View recommended care plans.
- Compare care plan options.
- Select the care plan they want to follow.
- See why the plan was suggested at a high level.

Care plan suggestions should be treated as decision support, not a replacement for professional medical advice.

### 5. Clinical Performance Dashboard

The dashboard must summarize the patient's historical data.

Dashboard views should include:

- Latest vitals snapshot
- Vital trend history
- Symptom frequency
- Risk indicators
- Selected care plan history
- Improvement or deterioration indicators based on prior records

### 6. Contact Us Page

The application must include a contact us page for patient support.

The page should include:

- Support message form
- Contact email or phone placeholder
- Reason or category selection
- Confirmation message after submission

## Data Storage Requirements

The H2 database should store structured patient data for development and testing.

Recommended entities:

- Patients
- Authentication credentials
- Patient demographics
- Symptoms
- Vitals
- Care plan criteria
- Care plan recommendations
- Selected care plans
- Contact messages
- Audit-style update history

Stored patient data should include:

- Age
- Sex
- Origin
- Diet
- Habits
- Symptoms
- Vital signs
- Care plan recommendation results
- Historical changes over time

## Care Plan Recommendation Criteria

Care plan logic should evaluate combinations of patient attributes and clinical signals.

Decision inputs should include:

- Age
- Sex
- Temperature
- Heart rate
- Blood pressure
- Respiratory rate
- Oxygen saturation
- Origin
- Diet
- Habits
- Current symptoms
- Historical vitals
- Historical symptoms

Example recommendation categories:

- Routine monitoring
- Diet and lifestyle improvement
- Follow-up consultation
- Urgent clinical review
- Chronic condition management support

The recommendation engine can begin as rule-based logic and later evolve into a scoring model.

## Sample Patient Dataset Requirement

The project must include a development dataset with at least 100 to 200 patient records.

The seeded records should represent a realistic mix of:

- Pediatric, adult, and senior patients
- Different sexes
- Different origins
- Healthy and elevated vital ranges
- Multiple diet patterns
- Multiple habit patterns
- Mild, moderate, and severe symptom combinations
- Repeated historical updates for dashboard testing

No real patient data should be used. All sample records must be synthetic.

## Security and HIPAA-Aware Testing Plan

This project should be designed with healthcare privacy expectations in mind. The capstone should be described as HIPAA-aware, not as legally certified HIPAA compliant.

Security expectations:

- Hash patient passwords.
- Protect patient APIs with authentication.
- Restrict each patient to their own records.
- Validate and sanitize all incoming data.
- Avoid logging sensitive patient details.
- Keep configuration secrets outside source code.
- Track record updates in an audit-friendly way.
- Protect local and database storage according to the deployment environment.

HIPAA-aware testing should verify:

- Unauthenticated users cannot access patient records.
- One patient cannot read or update another patient's records.
- Passwords are not stored or returned in plain text.
- Sensitive data is not exposed in API errors.
- Patient data updates are traceable by timestamp.
- Synthetic test data is used instead of real patient data.

## Suggested Pages

- Login
- Register
- Patient Records
- Add or Update Vitals and Symptoms
- Suggested Care Plans
- Clinical Performance Dashboard
- Contact Us

## Suggested API Endpoints

The backend can expose REST APIs such as:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/patients/me`
- `GET /api/patients/me/records`
- `POST /api/patients/me/vitals`
- `PUT /api/patients/me/vitals/:vitalId`
- `POST /api/patients/me/symptoms`
- `PUT /api/patients/me/symptoms/:symptomId`
- `GET /api/patients/me/care-plans`
- `POST /api/patients/me/care-plans/:carePlanId/select`
- `GET /api/patients/me/dashboard`
- `POST /api/contact`

## Testing Plan

Recommended test coverage:

- Registration succeeds for valid new patients.
- Registration rejects invalid or duplicate accounts.
- Login succeeds with valid credentials.
- Login fails with invalid credentials.
- Protected APIs reject unauthenticated requests.
- Patient records load only for the logged-in patient.
- Patients can add and update vitals.
- Patients can add and update symptoms.
- Care plan suggestions change when vitals, symptoms, or risk factors change.
- Dashboard metrics reflect historical patient data.
- Contact us form accepts valid requests and rejects invalid requests.
- API errors avoid exposing sensitive patient data.

## Acceptance Criteria

The project specification is complete when:

- The README describes the React, Node.js, and H2 architecture.
- The README includes login and registration requirements.
- The README includes patient record fetch and display requirements.
- The README includes add and update flows for vitals and symptoms.
- The README includes suggested care plan behavior and patient selection.
- The README includes a clinical performance dashboard based on historical data.
- The README includes a contact us page requirement.
- The README requires at least 100 to 200 synthetic patient records.
- The README uses `HIPAA` correctly and avoids claiming legal compliance.
- The README provides enough detail for a student team to begin implementation.

## Recommended Folder Structure

```text
capstone-team-5/
  README.md
  frontend/
  backend/
  database/
  docs/
  tests/
```

## Delivery Summary

This capstone should demonstrate a complete patient-centered clinical decision support workflow: secure access, patient record review, symptom and vital tracking, care plan recommendation, historical dashboard analysis, and patient support communication.
