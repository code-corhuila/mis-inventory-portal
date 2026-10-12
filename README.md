# mis-inventory-portal

> inventory bounded context: web UI (remote)

Part of the **Medicine Inventory System** distributed system — team `medicine-inventory-system`, Grupo 1.
Governance and documentation live in [`mis-docs`](https://github.com/code-corhuila/mis-docs).

## Angular inventory reader

Node 24+, `npm ci --ignore-scripts`, `npm test`. mis-front mounts src/portal.js
with an authenticated read capability and teardown. Angular 21.2.25 is shared
with Catalog through the shell's local import map, avoiding duplicate runtimes.
Stock shows physical, available and pending quantities separately; expiry comes
from the API. Movements are limited to ADMIN/INVENTORY/SUPERVISOR; CONSULTATION
only sees stock. Filters use lot UUID, expiry or movement date range; dates are
displayed in America/Bogota. Names use the first 100 Catalog/Suppliers API records
per mount; missing names fall back to IDs. No cross-domain database reads occur.
Pagination derives pages from meta.total, not a nonexistent totalPages field.
CI runs eleven model tests, not browser/backend acceptance. See
[operator evidence](docs/WEB-001-inventory-acceptance.md).
ADMIN/INVENTORY can register a stock exit with quantity and reason. An uncertain
response retains the immutable body/key across navigation within the login;
replay does not optimistically subtract stock. Only an acknowledged result refreshes
owner reads. Logout/reload loses this local intent; cross-session recovery is absent.
See [exit acceptance](docs/WEB-001-exits-acceptance.md). Reception lives in Suppliers
and uses Workflow. Alert screens, production packaging and QA remain pending.
This increment does not close WEB-001.

## Demo-inspired portal styling

The existing isolated styles now align headings, tabs, primary commands, filter
fields and contained tables with the shell. Exit forms stack on mobile; labels
and real quantities retain their meanings. Models, roles and replay semantics are
unchanged. See [visual acceptance](docs/WEB-001-visual-acceptance.md).

## Branching Policy

Three permanent branches. **None of them accepts a direct commit** — you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Full policy: `00-governance/branching-policy.md` in `mis-docs`.
