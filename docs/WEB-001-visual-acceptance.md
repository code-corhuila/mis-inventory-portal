# WEB-001 - Inventory visual acceptance

Operator-run Edge acceptance, 2026-10-12; partial visual alignment, not HU closure.
Headings/tabs/filter fields/primary commands and table boundaries align with the
shell; exit forms stack on mobile. Available/pending/physical quantities remain distinct.

- All 11 existing reader/exit model tests passed; CI does not render Angular.
- Real login/stock/movement reads and filter/exit form rendering passed at
  1366, 801, 800, 390 and 320 px. An available lot's exit form opened/canceled.
- Mobile CONSULTATION had neither movement tab nor exit command.
- Non-table controls fit their host; no document horizontal overflow/page exceptions.
  Tables intentionally scroll internally. Desktop/mobile screenshots were inspected.
- No stock exit was submitted; this is visual regression acceptance, not another
  debit/idempotency or expired-lot backend scenario. Prior native evidence is separate.

The browser driver/screenshots remain local-only. Non-local host injection was
blocked in the test browser without changing system antivirus settings. Models,
API paths, immutable pending body/key, credentials and data are unchanged.
Real summary/alert screens, production packaging and integrated QA remain pending.
