# WEB-001 - Stock exit acceptance

Operator-run acceptance, 2026-10-12. Partial frontend increment, not HU closure.

## Real development checks

Edge/Playwright exercised ADMIN at 1366x900 and INVENTORY at 390x844 through
mis-front and the real gateway/Inventory API. Each run selected an existing
synthetic WEB-* reception lot with a future expiry and sufficient stock.

- Submit quantity 2 with a synthetic reason. The owner committed and returned 201;
  the browser interception replaced that response with 503, simulating a lost reply.
- Navigate to account and back, then explicitly retry. The owner returned 200 with
  the same exit ID, Idempotency-Key and body. Stock decreased by exactly 2 and
  the movement count increased by exactly 1 per intention, not per attempt.
- A direct request exceeding the remaining available stock returned 422;
  owner stock and movement counts stayed unchanged.
- SUPERVISOR saw no exit command and a direct POST returned 403.
- No page exceptions or document horizontal overflow were observed. Desktop/mobile
  form and confirmed-result screenshots were inspected locally.

The two runs may use the same lot; each is a distinct legitimate intention.
Two synthetic exits remain in dev as evidence. No production stock, migrations,
identity keys or credentials were changed or committed. Screenshots and the
operator browser driver are local artifacts, not a CI suite shipped by this PR.

## Automated model checks and limits

`npm test`: 11 passing tests (5 reader, 6 exit). Exit coverage includes validation,
unknown-response remount/replay against a lower stock snapshot, duplicate clicks,
immutable pending bodies, definitive rejection, malformed acknowledgements,
read-refresh failure after a known commit and disposed requests.

CI runs these model tests only. Expiry is covered by model validation, not a live
expired-lot scenario in this acceptance. The shell owns pending intent only during
one login; logout/reload has no recovery guarantee. No compensation, automatic
retry, optimistic debit, production packaging or complete role matrix is claimed.
