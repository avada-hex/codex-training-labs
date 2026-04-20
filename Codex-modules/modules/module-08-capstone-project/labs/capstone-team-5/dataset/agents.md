# Dataset Agent Guide

This folder contains synthetic healthcare seed data for the capstone project.

Use these instructions for any future data generation or refresh tasks in this directory.

## Purpose

Generate realistic but fully synthetic CSV datasets that support:

- patient profile views
- vitals and symptom entry flows
- dashboard trend visualizations
- care plan recommendation testing

## Required Files

Keep these files present unless the task explicitly changes the dataset shape:

- `patient_details.csv`
- `vitals.csv`
- `symptoms.csv`

## Record Expectations

- Target 100 to 200 patient records unless the task specifies another count.
- Keep the same number of rows across all three CSV files.
- Use a stable shared key: `patient_id`.
- Use unique row identifiers per file such as `vital_id` and `symptom_id`.
- Include timestamps in vitals and symptoms for dashboard and history testing.

## Data Rules

- Use synthetic data only. Never use real patient data.
- Keep age ranges mixed across pediatric, adult, and senior patients.
- Include a balanced spread of sexes, origins, diets, and habit patterns.
- Include healthy, mild, moderate, and severe clinical cases.
- Keep vitals medically plausible for the scenario represented.
- Keep symptoms aligned with severity and vital signs.
- Avoid empty files, duplicate IDs, and broken patient references.

## Suggested Schema

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

## Quality Checks

Before finishing a generation task, verify:

- every CSV loads successfully
- row counts match expected totals
- `patient_id` values align across files
- IDs are unique within each file
- timestamps are valid
- severe symptom rows are paired with elevated-risk vitals often enough to be useful for testing

## Update Guidance

- Prefer extending the current schema over replacing it.
- If columns change, update this file and the lab `README.md`.
- Keep file names stable so downstream student solutions do not break.
