---
description: Run lint and production build to verify changes
agent: build
---

Verify the current changes in this repo.

1. Run `npm run lint` from inside `adventure-travel/`.
2. Fix any errors or warnings it reports.
3. Then run `npm run build` from inside `adventure-travel/` and fix anything it fails on.
4. Report a one-line summary of what was fixed, or confirm both pass clean.

Never assume a test framework — there is none in this project; lint + build are the only checks.
