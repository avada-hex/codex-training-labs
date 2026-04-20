# Capstone Team 5 Agent Guide

This file is the authoritative instruction guide for work in `capstone-team-5/`.

Use the lab [README.md](README.md) as the product specification and use this file to route work to the correct subagent area.

## Project Overview

This capstone implements a patient-facing Clinical Decision Support System with:

- secure registration and login
- patient record access
- vitals and symptom create and update flows
- care plan recommendation and selection flows
- dashboard views based on historical records
- patient support contact submissions
- synthetic dataset support for development and testing

## Shared Rules

Apply these rules across backend, frontend, and dataset work unless a task explicitly changes the scope:

- Keep the lab `README.md` as the source of truth for product requirements and expected workflows.
- Keep backend, frontend, and dataset behavior aligned when requirements change.
- Use synthetic data only. Never introduce real patient data in code, fixtures, tests, demos, or generated CSV files.
- Use HIPAA-aware language when relevant, but do not claim legal HIPAA certification or compliance.
- Keep secrets and environment-specific configuration outside source code.
- Avoid logging sensitive patient details, secrets, or credential state.
- Preserve stable naming and folder conventions unless a task explicitly requires a structural change.
- If route contracts, dataset schema, or cross-team assumptions change, update this file and the lab `README.md` together.

## Backend Subagent

Use this section for backend API, service, validation, authentication, authorization, and persistence tasks.

### Purpose

Build and maintain a secure Node.js REST backend that supports:

- patient registration and login
- protected patient record access
- vital and symptom create and update flows
- care plan recommendation and selection flows
- dashboard data based on historical records
- patient support contact submissions

### Required API Coverage

Keep these backend responsibilities present unless the task explicitly changes the product scope:

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

### Backend Rules

- Use REST APIs and keep route behavior consistent with the endpoint list above unless a task explicitly changes the contract.
- Restrict patient-scoped APIs to the authenticated patient only. A patient must never read or update another patient's data.
- Hash passwords before storage. Never store or return plain text passwords.
- Protect private APIs with authentication and return safe errors for unauthenticated or unauthorized access.
- Validate and sanitize all incoming request data before processing or persistence.
- Patient profile and record APIs should support demographics, symptoms, vitals, history, and care plan summary views.
- Refer to the CSV files in `/dataset`.
- Vital and symptom create or update flows must persist timestamps so dashboard and audit-style history remain accurate.
- Historical records should be preserved when needed for trend analysis instead of overwriting all prior clinical context.
- Care plan recommendations should begin as rule-based decision support using demographics, vitals, symptoms, habits, diet, origin, and historical signals.
- Care plan responses should include a high-level explanation of why a plan was suggested.
- Care plan selection should be tracked so the dashboard and records can reflect current and prior choices.
- Contact submissions should support a reason or category, message body, and a safe confirmation response.

### Security and Privacy Rules

- Ensure protected endpoints reject unauthenticated requests.
- Ensure authorization checks are applied on every patient-owned read and write path.
- Keep API errors generic enough to avoid exposing sensitive patient details, internal queries, or credential state.
- Make patient updates traceable by timestamp and audit-friendly metadata where appropriate.

### Quality Checks

Before finishing a backend task, verify:

- protected routes reject unauthenticated requests
- one patient cannot read another patient's records
- one patient cannot update another patient's vitals, symptoms, or care plan selections
- password storage uses hashing and password fields are never returned in API responses
- validation rejects malformed or incomplete payloads with safe error responses
- vitals and symptoms create and update flows persist timestamps correctly
- dashboard responses reflect historical patient data rather than only the latest write
- care plan recommendations change when relevant vitals, symptoms, or risk factors change
- contact submissions validate required fields and return a confirmation without leaking sensitive internals

### Update Guidance

- Prefer extending backend behavior over changing public API shapes without a clear requirement.
- If backend changes require dataset or schema changes, update the relevant section of this root guide and the lab `README.md`.

## Frontend Subagent

Use this section for React UI, routing, screen state, and client-side workflow tasks.

### Scope

The frontend team is responsible for the React patient experience for the Clinical Decision Support System.

### Frontend Tasks

- Build the login page
- Build the register page
- Protect patient pages behind authentication
- Build the patient records page
- Build the add and update vitals page
- Build the add and update symptoms page
- Build the suggested care plans page
- Build the care plan selection flow
- Build the clinical performance dashboard
- Build the contact us page
- Show loading, empty, error, and unauthorized states
- Keep patient data views readable and easy to scan
- Keep the UI aligned with the project spec and backend API responses

### Deliverables

- React app shell for patient workflows
- Authentication screens
- Protected patient routes
- Patient records display
- Vitals and symptoms forms
- Suggested care plan display and selection
- Dashboard trend and history views
- Contact us form with confirmation feedback

### Working Order

1. Set up the app shell and authentication flow
2. Build patient records and update forms
3. Add care plan and dashboard views
4. Finish the contact us page and shared UI states

## Dataset Subagent

Use this section for synthetic data generation, schema updates, and CSV refresh tasks.

### Purpose

Generate realistic but fully synthetic CSV datasets that support:

- patient profile views
- vitals and symptom entry flows
- dashboard trend visualizations
- care plan recommendation testing

### Required Files

Keep these files present unless the task explicitly changes the dataset shape:

- `patient_details.csv`
- `vitals.csv`
- `symptoms.csv`

### Record Expectations

- Target 100 to 200 patient records unless the task specifies another count.
- Keep the same number of rows across all three CSV files.
- Use a stable shared key: `patient_id`.
- Use unique row identifiers per file such as `vital_id` and `symptom_id`.
- Include timestamps in vitals and symptoms for dashboard and history testing.

### Data Rules

- Keep age ranges mixed across pediatric, adult, and senior patients.
- Include a balanced spread of sexes, origins, diets, and habit patterns.
- Include healthy, mild, moderate, and severe clinical cases.
- Keep vitals medically plausible for the scenario represented.
- Keep symptoms aligned with severity and vital signs.
- Avoid empty files, duplicate IDs, and broken patient references.

### Suggested Schema

`patient_details.csv`

- `patient_id`
- `first_name`
- `last_name`
- `age`
- `sex`
- `origin`
- `diet`
- `habits`
- `email`
- `phone`
- `registration_date`

`vitals.csv`

- `vital_id`
- `patient_id`
- `recorded_at`
- `temperature_f`
- `heart_rate_bpm`
- `systolic_bp`
- `diastolic_bp`
- `respiratory_rate`
- `oxygen_saturation`
- `weight_kg`
- `bmi`

`symptoms.csv`

- `symptom_id`
- `patient_id`
- `recorded_at`
- `primary_symptom`
- `secondary_symptom`
- `pain_level`
- `severity`
- `duration_days`
- `notes`

### Quality Checks

Before finishing a dataset generation task, verify:

- every CSV loads successfully
- row counts match expected totals
- `patient_id` values align across files
- IDs are unique within each file
- timestamps are valid
- severe symptom rows are paired with elevated-risk vitals often enough to be useful for testing

### Update Guidance

- Prefer extending the current schema over replacing it.
- If columns change, update this file and the lab `README.md`.
- Keep file names stable so downstream student solutions do not break.
