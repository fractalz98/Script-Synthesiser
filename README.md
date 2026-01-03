# Script-Synthesiser

Web UI for LM Studio that can:

- List loaded models and send prompts directly to LM Studio through an OpenAI-compatible proxy.
- Upload `.txt` samples to synthesise a reusable master style.
- Generate hypnotic scripts with configurable length and intensity based on that style.

## Prerequisites

- Node.js 18+
- A running LM Studio server with the OpenAI-compatible endpoint enabled (default: `http://localhost:1234`).

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. (Optional) Configure environment variables:

   - `LM_STUDIO_BASE_URL` – URL of the LM Studio server (default: `http://localhost:1234`).
   - `LM_STUDIO_API_KEY` – API key (default: `lm-studio`).
   - `PORT` – Port for the UI server (default: `3000`).

3. Start the server:

   ```bash
   npm start
   ```

4. Open the UI at `http://localhost:3000` and choose a loaded model.

### Scripts

- `npm start` – run the production server.
- `npm run dev` – run with auto-reload via nodemon.
- `npm test` – placeholder script (no automated tests yet).
