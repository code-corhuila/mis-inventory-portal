# WEB-001 inventory reader acceptance

Operator-run 2026-10-12, America/Bogota, using Playwright/Edge through the paired
mis-front reader increment and existing dev gateway/Security/Inventory APIs.
Docker Desktop was initially stopped. It was restarted; existing containers and
port bindings recovered without Compose recreation, migration or volume deletion.
No backend source, credential or identity changes and no business writes were made.

Real checks at 1366x900, 390x844 and 320x900: ADMIN login, stock, expiry filters,
movement date filters, detail, Catalog/React Suppliers coexistence and logout.
CONSULTATION could read stock and had no movement tab. A direct real movement
request with that role returned 403. Real stock next/previous pagination passed.
Date-range inversion was rejected locally. Error503/empty listing used browser
mocks; retry subsequently reached the real API. Screenshots were inspected with
no page errors or document overflow; the narrow table scrolls within its container.

Reproduce: npm ci/test in this repository; npm start in the paired mis-front.
Install Catalog's locked runtime and build Suppliers for the complete navigation.
Use configured dev accounts, never publish env, tokens or passwords.
Five model tests cover query validation, meta.total pagination, API names, role
gating, error/retry, stale/disposed replies and fallback/recovery of references.
CI is unit-only. Descriptive references are bounded to the first 100 records;
missing references show IDs, not invented names. Native ESM/JIT development is
not AOT production packaging, full role acceptance, release QA or WEB-001 closure.
