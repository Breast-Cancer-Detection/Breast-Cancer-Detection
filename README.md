# Breast Cancer AI/ML Project

Academic explainable-AI prototype for breast image analysis (ResNet50 + Grad-CAM), with a React research interface.

## Prerequisites

- [Node.js](https://nodejs.org/) **v18+** (v20 recommended)
- npm (comes with Node.js)

## Start the frontend

From the repo root after cloning:

```bash
cd frontend
npm install
npm run dev
```

Then open the URL Vite prints (usually **http://localhost:5173**).

### Useful commands

| Command | What it does |
|---------|----------------|
| `npm run dev` | Start local development server |
| `npm run build` | Production build → `frontend/dist` |
| `npm run preview` | Preview the production build locally |

All of these run from the `frontend/` folder.

## Project layout

```text
frontend/     React UI (Vite + TypeScript)
Explainable AI breast cancer prototype/   Original HTML mockup (reference)
*.py          Training / data utilities
```

More frontend detail: [frontend/README.md](frontend/README.md)
