PROJECT RULES — "Selaras" (employee health & focus analytics, privacy-by-design)

1. PRIVACY INVARIANTS (never violate, never "optimize away"):
   - Webcam frames, images, and face/pose landmarks NEVER leave the user's device and are NEVER stored. Only aggregated per-minute numeric features are sent.
   - Never record keystroke content, typed text, URLs, or page titles. Only COUNTS of input events. Optional coarse tab category is opt-in and off by default.
   - Camera/monitoring starts only after explicit in-extension consent by the employee. A manager/admin can never enable it remotely.
   - No per-person ranking, leaderboards, or "worst performer" views anywhere.
   - Managers see team-level aggregates only, and only when team size >= 5 (k-anonymity). Individual-level data is visible to a manager only if that employee opted in.
   - All database access goes through Supabase Row Level Security. Never expose the service-role key to any client.
   - Every collected field must be documented in DATA_DICTIONARY.md and visible to the employee in the extension's "What is sent" screen.

2. COST: free tiers and open-source only. No paid APIs. No secrets in git; provide .env.example. Do not add a dependency without a one-line justification in the plan.

3. QUALITY: TypeScript strict (no `any`), ESLint + Prettier, small focused commits, unit tests for all signal math (EAR, PERCLOS, posture angle, focus score), tests for RLS policies.

4. MANIFEST V3: no remotely hosted code; bundle WASM and model files locally; request the minimum permissions; document why each permission is needed.

5. UX COPY: Indonesian by default (English toggle), supportive and non-punitive tone. Never use words like "surveillance", "slacking", "lazy". Describe states as "tanda kelelahan", "perlu jeda", "fokus".

6. DOCS: keep README.md, ARCHITECTURE.md, PRIVACY.md, DATA_DICTIONARY.md, and /docs/adr/ updated as the code changes.

7. WORKFLOW: always produce an implementation plan first and wait for approval. After each phase, produce a walkthrough artifact with screenshots (for UI) and test results.
