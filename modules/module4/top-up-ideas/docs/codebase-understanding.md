# Codebase Understanding Prompts

Use these prompts to create a technical summary of the Myntra-style stack, even when the repository grows larger.

1. **Entry point architecture**: Map out the front-end entry (rontend/src/main.jsx, rontend/src/App.jsx) and the back-end entry (ackend/index.js). Describe how Vite bootstraps React and how Express initializes its catalog endpoint.
2. **Data flow & API contract**: Trace the journey from the etch call in App.jsx to the Express /api/products response. What data is annotated server-side (price formatting, delivery text), and how does the client populate its state and UI? Include how status indicators signal readiness.
3. **Layer separation**: Identify the dependency boundaries in rontend/package.json and ackend/package.json. Which packages belong to rendering, which to API, and how would you extend them when the project grows (for example, adding a database or feature flags)?
4. **Operational notes**: What logging, error handling, or CORS policies exist in the backend? How would you describe these for an engineer onboarding to a repository three times larger than this folder?
5. **Summarization habit**: When you read a large repo, how do you record the key directories, scripts, and runtime commands? Document one process you follow to keep summaries technical and actionable.
