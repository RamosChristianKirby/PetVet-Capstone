# Validation and operational notes

Changes are on `codex/system-improvements`. No existing database has been migrated or modified.

Verified results: 17 API/integration tests, 12 desktop/mobile browser tests, web lint and production build, all three scanner exports (web/Android/iOS), and 20/20 Expo Doctor checks. Scanner login, RFID lookup, reset, and sign-out were also exercised in a phone-sized browser. Browser tests exercise staff and owner accounts, RFID lookup, pet registration, refreshed detail URLs, vaccination edits, appointment booking, inaccessible owner pages, service errors, and navigation. Axe checks target WCAG A/AA on the main workspace pages; automated checks do not replace assistive-technology testing.

The scanner uses Expo SDK 58 with its matching React and React Native versions. JavaScript export checks cover web, Android, and iOS; physical devices, native signing, and an actual RFID reader still need acceptance testing.

Dependency audit results should be refreshed with `npm audit` in each package directory. The API and root tooling have no reported advisories at this validation run. The current web lint stack and Expo tooling retain moderate transitive `minimatch`/`glob` advisories. Their supported upstream dependency ranges still include these versions. No forced major overrides were applied solely to silence the audit. These tools process project files and are not exposed as public API endpoints; keep development servers local and review untrusted projects before building them.

Production needs a working MongoDB connection and a fresh JWT secret. Use the disposable demo to review behavior without those services. Run the documented legacy migration only after a backup and during a maintenance window with application writes stopped. Its check mode is read-only; `--apply` is explicit and does not delete records.

Known scope limits: no email delivery or reminders, no native RFID/NFC/Bluetooth driver, no scheduling-capacity rules, no multi-instance shared rate-limit store, and no administrative archive restore screen. Archiving retains data and keeps RFID numbers reserved. Production-scale registries may need API pagination beyond the current client-side registry pagination.

## Previews

- [Desktop workspace](previews/dashboard-desktop.png)
- [Mobile workspace](previews/dashboard-mobile.png)
- [Mobile scanner](previews/scanner-mobile.png)
