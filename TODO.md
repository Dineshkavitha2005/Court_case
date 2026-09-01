# TODO - LandGuard Map Fix

- [x] Inspect current Leaflet map initialization code paths in `app.js` for resize/visibility issues
- [x] Update `renderMap()` to harden Leaflet rendering by invalidating size after visibility changes
- [x] Ensure legend + fallback behavior is consistent
- [x] Re-run `node server.js`, test multiple searches, confirm map shows without errors

TO RUN SERVER : node server.js