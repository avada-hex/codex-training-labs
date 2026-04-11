# E-Commerce Documentary Lab

This lab seeds a multi-layer marketplace (React + Express) so you can practise reading and summarizing a larger repo before inviting Codex to write documentation. The goal is to produce a short documentary-style overview of the catalog, API, and UI, plus a README that anyone new to the repo can read.

## Repository layout
- `backend/` contains the catalog API, controllers, services, and helpers that manage apparel and shoes.
- `frontend/` hosts a React dashboard that fetches the catalog, offers filters, and exposes a documentation panel.
- `docs/` stores templates and prompt hints for building the documentary and README sections that Codex will author.

## Activities
1. Scan the folders with Codex and capture summaries. Start with folder-level prompts ("Summarize the backend/src folder...") to describe the high-level architecture, then drill into function-level prompts for key files such as `routes/products.js` or `components/ProductGrid.js`. Log the differences in tone, length, or detail you see between strategies.
2. Use the template in `docs/Documentary-template.md` to ask Codex for a narrative that explains how data travels from the API to the UI and where toggles and filters live. Include callouts to services and helpers so the documentary feels complete.
3. Prompt Codex to generate README sections (Overview, Data Flow, API Endpoints, Running the App) using the repo as source material. Verify that every statement it produces matches the actual code—especially port numbers, endpoint names, and component props.
4. Capture the prompt text (prompt log) and any contextual hints you provided; add them to `docs/prompt-strategies.md` for future cohorts.

## Sample prompt comparisons
| Strategy | Example prompt |
| --- | --- |
| Function-level | "Read `backend/src/services/inventoryService.js` and summarize how product availability and stock alerts are calculated." |
| Folder-level | "Survey `frontend/src/components` and explain how the filters, grid, and CTA bar work together to present catalog items." |

## Documentary deliverables
- A README-style summary that explains the product catalog, how the backend routes are structured, and how the UI renders products.
- A short narrative in `docs/Documentary-template.md` that reads like a mini-documentary about the repo (architecture highlights, key components, and integration points).
- A prompt log describing why you chose each summary strategy and how the responses differed.

## Run the code (optional)
- Backend: `npm install` and `npm start` inside `backend/`. It listens on port `4000`.
- Frontend: `npm install` and `npm run dev` inside `frontend/`. It proxies to the backend (set `VITE_API_URL` in `.env` if you need a different port) and keeps the documentation panel visible for prompt comparisons.

### Backend endpoints
| Route | Description |
| --- | --- |
| `GET /api/products` | List catalog items; optionally filter with `?category=` or `?q=` for keyword search. |
| `GET /api/products/:id` | Retrieve a single product (apparel or footwear) and its metadata. |
| `GET /api/collections` | Returns curated collections for the documentary narrative. |

## Next steps
Use the sibling folder `../ecommerce-documentary-extension` once you finish documentation. That folder reuses the same catalog but unlocks extra Codex-driven tasks (style guides, promotions, and wishlist-style features) so you can practise extending a large repo after you understand it.
