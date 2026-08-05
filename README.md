# Breast Cancer Detection

Academic explainable-AI prototype for breast image analysis, with a FastAPI backend and React research interface.

## Prerequisites

- [Python](https://www.python.org/downloads/) 3.11+
- [Node.js](https://nodejs.org/) 18+ (20 recommended)
- npm (comes with Node.js)

## First-Time Backend Setup

Run this once after cloning the repo:

```powershell
cd server
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
cd ..
```

This creates a local backend virtual environment at `server/.venv`. Do not reinstall dependencies every time.

## Start The Backend

From the repo root:

```powershell
.\server\start-backend.ps1
```

The API runs at:

```text
http://127.0.0.1:8000
```

## Start The Frontend

From the repo root:

```powershell
cd frontend
npm install
npm run dev
```

Then open the URL Vite prints, usually:

```text
http://localhost:5173
```

## Daily Development

Use two terminals:

```powershell
.\server\start-backend.ps1
```

```powershell
cd frontend
npm run dev
```

## Useful Frontend Commands

Run these from `frontend/`:

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start local development server |
| `npm run build` | Create production build in `frontend/dist` |
| `npm run preview` | Preview the production build locally |

## Project Layout

```text
frontend/   React UI (Vite + TypeScript)
server/     FastAPI backend and model inference code
```

More frontend detail: [frontend/README.md](frontend/README.md)
