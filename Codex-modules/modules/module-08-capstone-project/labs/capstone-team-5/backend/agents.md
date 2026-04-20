# Backend Agent Guide

This folder contains the backend API implementation guidance for the capstone project.

Use these instructions for any future backend API, service, validation, or persistence tasks in this directory.

## Purpose

Build and maintain a secure Node.js REST backend that supports:

- patient registration and login
- protected patient record access
- vital and symptom create and update flows
- care plan recommendation and selection flows
- dashboard data based on historical records
- patient support contact submissions

## Required API Coverage

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

## Backend Rules

- Keep the backend aligned with the lab `README.md` as the source of truth for product requirements.
- Use REST APIs and keep route behavior consistent with the endpoint list above unless a task explicitly changes the contract.
- Restrict patient-scoped APIs to the authenticated patient only. A patient must never read or update another patient's data.
- Hash passwords before storage. Never store or return plain text passwords.
- Protect private APIs with authentication and return safe errors for unauthenticated or unauthorized access.
- Validate and sanitize all incoming request data before processing or persistence.
- Keep secrets and environment-specific configuration outside source code.
- Avoid logging sensitive patient details or secret values.
- Use synthetic data only. Never introduce real patient data in development, testing, or seed flows.

## Data and Behavior Expectations

- Patient profile and record APIs should support demographics, symptoms, vitals, history, and care plan summary views.
- Refer to the csv files in /dataset folder
- Vital and symptom create or update flows must persist timestamps so dashboard and audit-style history remain accurate.
- Historical records should be preserved when needed for trend analysis instead of overwriting all prior clinical context.
- Care plan recommendations should begin as rule-based decision support using demographics, vitals, symptoms, habits, diet, origin, and historical signals.
- Care plan responses should include a high-level explanation of why a plan was suggested.
- Care plan selection should be tracked so the dashboard and records can reflect current and prior choices.
- Contact submissions should support a reason or category, message body, and a safe confirmation response.

## Security and Privacy Rules

- Use HIPAA-aware language in docs and code comments when needed, but do not claim legal HIPAA certification or compliance.
- Ensure protected endpoints reject unauthenticated requests.
- Ensure authorization checks are applied on every patient-owned read and write path.
- Keep API errors generic enough to avoid exposing sensitive patient details, internal queries, or credential state.
- Make patient updates traceable by timestamp and audit-friendly metadata where appropriate.

## Quality Checks

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

## Update Guidance

- Prefer extending backend behavior over changing public API shapes without a clear requirement.
- If a task changes route contracts, request or response fields, or persistence assumptions, update this file and the lab `README.md`.
- If backend changes require dataset or schema updates, also update related guidance such as `dataset/agents.md`.
- Keep naming and folder conventions stable so downstream student work does not break unnecessarily.
