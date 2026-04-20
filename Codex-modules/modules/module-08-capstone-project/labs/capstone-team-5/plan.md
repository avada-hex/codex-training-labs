Plan

Capstone Team 5 README Plan
Summary
Update README.md into a complete project specification for a Clinical Decision Support System. Scope is README only, with no frontend/backend/database files added in this pass.

Key README Changes
Expand the project overview to clearly describe the patient-facing clinical decision support workflow: register, log in, view records, update vitals/symptoms, receive care plan suggestions, review history, and contact support.
Add a clear technology section:
Frontend: React
Backend: latest Node.js with REST APIs
Database: H2 database
Add functional requirements for:
Patient login and registration
Patient record fetch/display
Add/update vitals and symptoms
Suggested care plan display and patient plan selection
Clinical performance dashboard using historical data
Contact us page
Add data requirements for 100-200 seeded patient records including age, sex, origin, diet, habits, symptoms, vitals, care plan criteria, and historical updates.
Add care plan criteria guidance based on combinations of age, sex, vitals, origin, diet, habits, and symptoms.
Add security and compliance guidance using the correct term HIPAA, while noting this is HIPAA-aware planning rather than a legal compliance certification.
Add a testing plan covering authentication, protected records, data updates, care plan logic, dashboard history, contact page, and privacy/security checks.
Add acceptance criteria so students can verify the project is complete from the README alone.
Suggested README Structure
Project Overview
Goals
Tech Stack
User Roles and Main Workflows
Functional Requirements
Data Storage Requirements
Care Plan Recommendation Criteria
Sample Patient Dataset Requirement
Security and HIPAA-Aware Testing Plan
Suggested Pages
Suggested API Endpoints
Acceptance Criteria
Recommended Folder Structure
Delivery Summary
Test Plan
Verify the README includes every user requirement listed in the prompt.
Verify wording uses HIPAA instead of HIPPA.
Verify the README does not claim full legal HIPAA compliance.
Verify the README remains implementation-ready but does not create or require code files yet.
Verify the final document is readable for students building the capstone lab.
Assumptions
This pass is README-only, based on the selected scope.
The README should be a project specification and implementation guide, not a working app scaffold.
H2 will be documented as the required database choice, even though the exact Node-to-H2 integration can be decided during implementation.
