# Volunteer IT work log

- `2026-retrospective-estimate.docx` is a reconstructed, unverified estimate
  covering January 1 through October 11, 2026.
- `2026-2027-production-integration-plan.docx` is prospective work for
  October 13, 2026 through April 13, 2027. Its scheduled daily entries are
  plans, not completed-work claims.
- `work-log-data.json` is the structured source for the dates, hours, weekly
  themes, work breakdown, daily tasks, and deliverables.

The public-facing page is <https://nationalai.onrender.com/work-log/>. The site
build publishes the two Word documents under `/work-log/`.

To regenerate the schedule data and Word documents on Windows with Node.js and
PowerShell available, run:

```sh
npm run work-log:docs
npm test
```

The retrospective follows the founder's stated 20-hour weekly allocation but
is not a contemporaneous timecard or independently verified record. Correct
the estimates against source records before using them for official reporting.
