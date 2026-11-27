# Meeting Poll implementation delivery

Implements the scope approved at `452314ca5bc7e73132496362cf7c2ab19b540e11` in PR #179. The approved proposal file is unchanged. Public runtime 1.6.0 / Core API 1.2.0 / contribution contract 0.4.0; independent base is `25d559778696dff849bb88fcca03f325185f2599`. The App package digest for **all current reports** is `177b0df3300446bed7637ba156715f675585e541301d6155e0f4efe6ce2d5a9a`. Reports belong to the implementation commit containing this index; evidence-only updates do not alter the package digest.

## Reproduce

Use Node 22.16.0 (also verified under Node 18.20.8), then from repository root:

```sh
node apps/meeting-poll/scripts/contracts.cjs --check
node apps/meeting-poll/scripts/fixtures.cjs --check
node apps/meeting-poll/scripts/evaluation.cjs --check
node --test apps/meeting-poll/tests/business.test.cjs
node apps/meeting-poll/tests/evaluation.cjs
node apps/meeting-poll/tests/integration.cjs
node apps/meeting-poll/tests/reference-controls.cjs
node runtime/cli.cjs verify --app apps/meeting-poll --output .artifacts/meeting-poll/common.json
npm ci
npx playwright install chromium
node apps/meeting-poll/tests/browser.cjs
```

For independent compatibility, extract/check out the base revision separately and invoke its unchanged `runtime/cli.cjs verify --app <absolute-candidate-app> --output <report>`. Set `PALE_REPORT_DIR` to retain results separately. Actual commands use no private runtime. App startup is documented in [README](../../../apps/meeting-poll/README.md). Model trials additionally need the configured API credential in the environment, never an artifact.

## Results

| Requirement | Result | Evidence |
| --- | --- | --- |
| Standalone business and data reproducibility | 14/14 passed | TAP retained in [common report](reports/common.json) |
| Public runtime, Node 22 | 38/38 passed | [Report](reports/common.json) |
| Public runtime, Node 18 | 38/38 passed | [Report](reports/node18.json) |
| Untouched current base validator | 38/38 passed | [Report](reports/base-validator.json) |
| App-specific real MCP | 32/32 passed | [Report](reports/integration.json) |
| Real Chromium GUI | 27/27 passed | [Ordered demonstration](GUI.md), [raw state/assertions](reports/browser.json) |
| Full-window evaluation data | 24/24 partitions loaded, queried and reset | [Report](reports/evaluation-load.json), [dataset](../../../apps/meeting-poll/evaluation/README.md) |
| Positive/no-op/wrong/partial controls | Passed | [Log](reports/reference-controls.log) |
| Frozen model smoke | 4/4 passed | [Batch](reports/model/agent-smoke.json), traces [0](reports/model/smoke-0.json), [1](reports/model/smoke-1.json), [2](reports/model/smoke-2.json), [3](reports/model/smoke-3.json) |
| Human realism/workflow reproduction and acceptance | Pending reviewer | Automated checks do not supply this decision |

The 192 synthetic polls cover every month in 2025–2026. The actual report contains 4272 dated records and 600 globally distinct UTC dates, spanning 2025-01-01 through 2026-12-31; zero invalid/out-of-window records. The [coverage report](../../../apps/meeting-poll/evaluation/coverage.json) retains per-source/month/date counts and every gap. Candidate dates denote proposed occurrences, not confirmed historical attendance. Real-record count is zero, as disclosed in the approved synthetic-only plan.

The two frozen model configurations are `gpt-4.1-mini-2025-04-14` and `gpt-4.1-2025-04-14`, temperature 0, maximum 10 rounds and 1,200 completion tokens per round. Each ran ordinary and changed-response scenarios through Agent tools only. All four confirmed the required slot without changing the other poll. Total usage: 31269 prompt tokens and 535 completion tokens. Conservative reservation was US$2.31309 of a US$30 cap; this is not invoice pricing. These are Environment usability checks, not Task qualification.

## Retained history and remaining review

[Preapproval evidence](historical-preapproval/NOTICE.md) retains previous model transport failures and the older package's results; none substitutes for the current reports. Current deterministic and model batches passed without a failed trial being discarded. Reference captures are dated separately and never presented as private product data. Runtime code, global reference registry and CI workflows are unchanged. Existing public/base CI verifies the package's standalone tests; the browser and full dataset loading commands above are separately reproducible evidence.

No cross-App delivery, remote authentication, real calendar/email, media or recurring meeting integration is claimed. Human review of usability, data realism, the intentional reference-product differences and final commit-bound acceptance remains pending. This submission does not self-approve or merge the contribution.
