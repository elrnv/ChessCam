# Self-Hosted Deployment

CameraChessWeb is already shaped like a mobile web app: it is a Vite React PWA that runs the camera and TensorFlow.js detection pipeline in the browser. The server does not run chess recognition or Stockfish; it serves static files, the service worker, and the two model folders in `public/`.

## Architecture

- `src/utils/loadModels.tsx` loads `480M_pieces_float16/model.json` and `480L_xcorners_float16/model.json`.
- `src/utils/findCorners.tsx` detects the board geometry.
- `src/utils/findPieces.tsx` runs piece detection each animation frame, converts detections into legal moves with `chessops`, and updates the in-browser game state.
- `src/slices/gameSlice.tsx` converts the tracked game to FEN/PGN.
- `src/utils/lichess.tsx` handles Lichess OAuth, PGN imports, study imports, broadcast pushes, and Board API moves.

## GPU Requirement

You do not need a dedicated server GPU for the app in this repository. The models are TensorFlow.js graph models and are loaded by the browser; `App.tsx` imports the WebGL backend and `loadModels.tsx` compiles both models on the client. A modern phone can run this through browser WebGL, although FPS depends heavily on the phone, browser, lighting, and camera resolution.

Use a server-side GPU only if you intentionally redesign the app so video frames are uploaded to your server for inference. That is a different architecture with higher latency, privacy concerns, and much larger server cost. For the current app, a small VPS is enough because it only serves about an 11 MB production build, including the two model directories.

## Lichess Analysis Path

The current app can produce Lichess-compatible PGN in real time, and it already has three Lichess paths:

- `Export` imports the final PGN into Lichess and embeds the imported game.
- `Broadcast` pushes the current PGN to a Lichess broadcast round after each move.
- `Play` can send detected moves to an active Lichess game through the Board API.

For real-time analysis, the cleanest self-hosted workflow is to use `Broadcast` mode: create a Lichess broadcast round without a source URL, select it in the app, and keep the Lichess broadcast or analysis board open on another screen. Do not use engine analysis while playing a normal Lichess game; Lichess explicitly forbids outside help for normal Board API play.

Lichess also exposes cached cloud evaluations at `/api/cloud-eval`, but that endpoint returns only positions already in the cache. It is useful as a future in-app enhancement, not a guaranteed live Stockfish replacement.

## Required Downloads

No extra model download is required for the current app. These files are already in the repository and are copied into the production image:

- `public/480M_pieces_float16/model.json`
- `public/480M_pieces_float16/group1-shard1of1.bin`
- `public/480L_xcorners_float16/model.json`
- `public/480L_xcorners_float16/group1-shard1of1.bin`

For deployment you need Docker with the Compose plugin on the server. The Docker build downloads npm dependencies from the public npm registry.

## Lichess OAuth

Lichess supports public PKCE clients, so you do not need a client secret. Set a unique client id for your deployment:

```bash
export VITE_LICHESS_CLIENT_ID="your-domain-camera-chess"
```

The default Lichess host is `https://lichess.org`. You normally do not need to change it.

## Local Server Test

```bash
docker compose up -d --build
```

Open:

```text
http://localhost:8080
```

This is enough for desktop testing. Phone camera access requires a secure context, so use HTTPS for real mobile use.

## HTTPS Deployment

Point a domain at your server, then run:

```bash
cp .env.example .env
# Edit .env so CHESSCAM_SITE_ADDRESS and VITE_LICHESS_CLIENT_ID match your domain.
docker compose --profile tls up -d --build
```

Caddy will request and renew the TLS certificate automatically. The app will be available at:

```text
https://chesscam.example.com
```

## Updating

```bash
git pull
docker compose --profile tls up -d --build
```

If you are not using the Caddy profile, use:

```bash
docker compose up -d --build
```

## Operational Notes

- Host the app at the domain root. The router and PWA manifest currently assume root hosting.
- Keep HTTPS enabled for mobile camera access and Lichess OAuth redirects.
- The app stores the OAuth token in browser storage through the existing client-side OAuth flow. Do not put personal access tokens into the frontend bundle.
- The production build was verified locally with `npm_config_cache=.npm-cache npm run build`; the local machine warned that Node 20.10 is older than Vite's preferred 20.19+, so the Docker image uses Node 22.
