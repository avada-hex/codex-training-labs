# Module 4 — Myntra-style Store + Learning Prompts

This folder now contains two related areas:

- myntra-style-store/frontend: A React/Vite single-page application that renders the Myntra-inspired hero, categories, tech summary, and the product grid. It fetches catalog data from the Express API.
- myntra-style-store/backend: A Node/Express catalog service that supplies curated product data, formatted prices, and delivery commitments.
- 	op-up-ideas: Documentation for the three learning passes, agent guidance, prompt collections, and enhancement ideas for the codebase.

## Quick start
1. Open a terminal at modules/module4/myntra-style-store/backend.
   - Run 
pm install (first run only).
   - Then 
pm start to launch the catalog API on port 5174.
2. In a second terminal, go to modules/module4/myntra-style-store/frontend.
   - Run 
pm install (first time).
   - Run 
pm run dev to start the Vite dev server (defaults to port 5173).
3. Open http://localhost:5173 in a browser. The front-end will fetch the catalog from http://localhost:5174/api/products.

## Notes
- The front-end focuses on typography, responsive grids, and status messaging so learners can explore the React component tree and styling.
- The backend is intentionally minimal to highlight how to keep the API surface narrow while still packaging curated product objects for documentation and reporting exercises.

Follow the prompts under 	op-up-ideas/docs to describe how the React components, Express API, and documentation stories connect.
