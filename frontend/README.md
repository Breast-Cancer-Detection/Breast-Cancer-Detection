# AI for Breast Health — Frontend

React conversion of the explainable breast-cancer AI prototype mockup.

## Stack

- Vite + React 19 + TypeScript
- React Router
- CSS Modules + design tokens

## Run

```bash
cd frontend
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Demo flow

1. Open `/` (landing)
2. **Analyze an Image** → `/workspace`
3. Upload a JPG/PNG/BMP (or use Sign In → continue as demo)
4. Pick a demo scenario → **Analyze Image**
5. Watch `/processing` → land on `/results`
6. Inspect Grad-CAM, scores, and model details at `/model`

## Structure

```text
src/
  app/           # App shell, routes, route effects
  components/    # layout, ui, explainability
  pages/         # one folder per screen
  hooks/         # useMediaQuery, useReducedMotion
  data/          # constants, scenarios, analysis session
  styles/        # tokens, global, animations
  types/         # shared TypeScript types
public/
  assets/        # sample images from the mockup
  evaluation_results/
```

## Routes

| Path | Screen |
|------|--------|
| `/` | Landing |
| `/signin` | Sign In |
| `/workspace` | Upload workspace |
| `/processing` | Analysis progress |
| `/results` | Prediction + Grad-CAM |
| `/model` | Model details |

## Phases

- **Phase 1:** scaffold, tokens, shared layout, routes
- **Phase 2:** full UI parity for all six screens + demo flow
- **Phase 3:** accessibility, reduced-motion, session hardening, cleanup
