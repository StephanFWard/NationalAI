'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'docs', 'work-log', 'work-log-data.json');

const RETROSPECTIVE_THEMES = [
  'Set the annual engineering objectives and service-monitoring rhythm; review the public site and define a work backlog.',
  'Inventory public pages, user journeys, navigation, and content obligations; record issues for correction.',
  'Review application ideas and prioritize public-benefit outcomes, feasible milestones, and non-goals.',
  'Draft functional requirements for search, results, analysis, persistence, and deployment boundaries.',
  'Map user stories to current routes and identify failure, empty, loading, and recovery states.',
  'Review data inputs and outputs; identify potentially sensitive records and define data-minimization questions.',
  'Design an initial application architecture and document interfaces between web, services, and storage.',
  'Review runtime, dependency, and local-development assumptions; capture compatibility and maintainability actions.',
  'Define search request validation, result normalization, and traceable source/evidence requirements.',
  'Plan asynchronous work and error handling for upstream service delays, rate limits, and partial results.',
  'Review persistence needs, file-backed data, retention assumptions, and export/restore expectations.',
  'Design UI navigation and separate core user workflows from exploratory demonstration material.',
  'Implement and refine web page structure, accessible content hierarchy, and consistent navigation.',
  'Build or refine service boundaries for search and result presentation; document request and response shapes.',
  'Add input and response checks for common invalid, missing, duplicated, or unavailable data cases.',
  'Improve data normalization and result display so records remain understandable and reviewable.',
  'Review queue and background-job patterns; identify duplicate work and retry handling requirements.',
  'Add or refine user feedback for progress, empty results, service errors, and recoverable failures.',
  'Review analysis workflow boundaries and define how generated interpretations are separated from source facts.',
  'Design report structure with clear citations, timestamps, limitations, and non-authoritative AI output labeling.',
  'Review location and geolocation handling; identify collection, purpose, access, and retention controls.',
  'Improve client-side workflows and verify navigation paths between search, results, and analysis views.',
  'Review responsive layouts and keyboard access across important search and results interactions.',
  'Add/adjust automated checks around routes, build output, core user-facing wording, and regressions.',
  'Inspect errors and logs for actionable diagnostic context while avoiding unnecessary sensitive data.',
  'Review external service resilience, throttling, timeouts, and graceful degradation behavior.',
  'Reduce brittle assumptions in browser automation or external-page parsing; record upstream-change risks.',
  'Improve application documentation for setup, configuration, data flow, and operational recovery.',
  'Review environment configuration and secret-handling boundaries; distinguish local values from public assets.',
  'Assess dependency and license exposure, including bundled examples, before selecting migration candidates.',
  'Review accessibility, content clarity, and privacy implications in user-facing screens and generated reports.',
  'Exercise manual workflows with realistic edge cases; record defects and prioritize fixes.',
  'Review build and deployment configuration; document production settings and service ownership.',
  'Plan backup, restore, and data migration checks for application state and user-generated artifacts.',
  'Review operational monitoring, availability checks, update routines, and incident escalation notes.',
  'Refine acceptance criteria and release checklist; map each key user journey to evidence.',
  'Conduct integration review across UI, routes, services, storage, and external providers.',
  'Close high-priority defects and document known limitations, residual risks, and follow-up items.',
  'Prepare deployment rehearsal, smoke-test steps, rollback conditions, and post-deploy checks.',
  'Review public website migration scope, page/content coverage, build behavior, and deployment readiness.',
  'User-reported migration closeout and stabilization focus; verify availability, links, content, build output, and follow-up notes.',
];

const PHASES = [
  {
    id: '1',
    name: 'Discovery, inventory, and acceptance baseline',
    dayCount: 8,
    activities: [
      ['Confirm production scope and non-goals', 'Record the user-facing workflows that belong in NationalAI and explicitly separate unrelated bundled examples.', 'Compare the scope boundary against both repositories and the deployment target.', 'Approved scope matrix and exclusions.'],
      ['Inventory NationalAI site routes and build', 'Map static pages, shared components, build outputs, hosting settings, and existing regression checks.', 'Rebuild from a clean output directory and capture current behavior as the destination baseline.', 'Destination baseline and route inventory.'],
      ['Inventory patent-search application entry points', 'Map Express routes, controllers, services, UI assets, external providers, and startup behavior.', 'Trace each core workflow to its source modules without copying bundled dependency trees.', 'Application component and route inventory.'],
      ['Trace data flows and storage', 'Document search inputs, USPTO/browser fetches, Kafka messages, local files, geolocation, and generated reports.', 'Mark trust boundaries, data owners, retention assumptions, and recovery dependencies.', 'Data-flow diagram and unresolved privacy questions.'],
      ['Audit dependencies, assets, and licenses', 'Classify first-party code, node_modules, example collections, binary datasets, and licensing obligations.', 'Create an allowlist for migration candidates; quarantine uncertain assets from the integration plan.', 'Dependency/asset/license register.'],
      ['Define user stories and acceptance criteria', 'Write measurable success and failure criteria for search, results, analysis, persistence, and operations.', 'Review criteria for testability, accessibility, privacy, and observable evidence.', 'Prioritized acceptance checklist.'],
      ['Assess runtime and deployment constraints', 'Compare Node versions, environment variables, Render service types, browser automation, and Kafka requirements.', 'Run a deployment feasibility review and document infrastructure decisions still requiring approval.', 'Runtime/deployment constraint register.'],
      ['Approve baseline and migration decision record', 'Consolidate scope, risks, constraints, acceptance criteria, and candidate sequence into a review package.', 'Record decisions, open questions, owners, and go/no-go conditions for architecture work.', 'Discovery sign-off package and decision log.'],
    ],
  },
  {
    id: '2',
    name: 'Target architecture and integration foundation',
    dayCount: 9,
    activities: [
      ['Select integration boundary', 'Compare a unified Node service, separately deployed API, and staged integration options against existing Render hosting.', 'Choose a reversible boundary that preserves the static site while documenting backend hosting needs.', 'Architecture decision record.'],
      ['Design repository and module layout', 'Specify where shared site content, API routes, UI assets, configuration, tests, and operational docs will live.', 'Validate module ownership and build inputs against the current static builder.', 'Target repository layout and ownership map.'],
      ['Define API contracts', 'Specify versioned request, response, pagination, status, and error contracts for search, results, analysis, and health.', 'Add contract examples for valid inputs and stable error cases.', 'API contract specification.'],
      ['Design persistence schema and migration policy', 'Identify entities, stable identifiers, timestamps, relationships, retention needs, and migration safeguards.', 'Review schema changes for idempotence, reversibility, and privacy minimization.', 'Initial data model and migration policy.'],
      ['Design job/queue boundary', 'Define which tasks are synchronous and which require background processing, retries, deduplication, or dead-letter handling.', 'Compare Kafka dependency against a simpler deployment-compatible alternative without assuming infrastructure.', 'Queue decision and job lifecycle.'],
      ['Establish environment and secret model', 'Separate public client configuration from server credentials, provider keys, and deployment-only settings.', 'Verify no secret is emitted to static assets or checked-in example configuration.', 'Environment variable inventory and handling rules.'],
      ['Add integrated developer workflow', 'Define install, build, lint/test, local run, and service dependency commands with deterministic behavior.', 'Run clean setup and document prerequisites and expected checks.', 'Repeatable local developer instructions.'],
      ['Create observability and test scaffolding', 'Define structured event fields, correlation identifiers, health checks, and test seams for external providers.', 'Add conventions for redaction and deterministic provider stubs.', 'Logging, health, and test design baseline.'],
      ['Review and baseline target architecture', 'Walk through architecture, data flow, hosting, operational cost, and failure recovery with acceptance owners.', 'Resolve blocking decisions or record explicit deferrals before feature migration.', 'Reviewed architecture baseline and decision log.'],
    ],
  },
  {
    id: '3',
    name: 'Patent search and core service integration',
    dayCount: 12,
    activities: [
      ['Port and isolate search request validation', 'Define allowed query fields, lengths, normalization, invalid-input responses, and safe logging rules.', 'Add focused tests for valid, empty, oversized, malformed, and Unicode queries.', 'Validated search request boundary.'],
      ['Implement USPTO client adapter', 'Wrap current USPTO API access behind a provider interface with explicit timeout and response handling.', 'Use deterministic fixtures to verify status, schema, and provider-error mapping.', 'Testable USPTO adapter.'],
      ['Review browser automation fallback', 'Trace Puppeteer navigation, selectors, rate limiting, browser binary, and current upstream assumptions.', 'Fence automation behind the same provider contract and establish an explicit fallback policy.', 'Documented browser-provider adapter and risks.'],
      ['Normalize patent result identifiers', 'Map application/publication/patent identifiers and core metadata into a canonical internal record.', 'Test representative identifiers and missing/variant provider field names.', 'Canonical patent record mapper.'],
      ['Integrate search route and service boundary', 'Connect the UI-facing search endpoint to the provider adapter and normalized service response.', 'Exercise route-level status codes, serialization, and provider error propagation.', 'Integrated search API route.'],
      ['Implement pagination and bounded result handling', 'Define maximum page size, continuation behavior, provider limits, and partial-result indicators.', 'Verify bounds, duplicate pages, no-results, and continuation exhaustion.', 'Bounded and predictable result pagination.'],
      ['Implement throttling and upstream timeout behavior', 'Set explicit request deadlines, concurrency controls, and rate-limit responses for external search calls.', 'Test timeout, throttling, retry eligibility, and cancellation behavior.', 'Resilient provider request policy.'],
      ['Connect results view to normalized records', 'Replace fixed/demo assumptions in the production path with the integrated search response contract.', 'Verify loading, empty, successful, partial, and error result states.', 'Integrated search-to-results user journey.'],
      ['Preserve source links and retrieval metadata', 'Attach stable provider identifiers, source URLs, retrieval time, and available provenance to result records.', 'Verify reports and result details can distinguish source fields from derived content.', 'Traceable source metadata.'],
      ['Test provider contract and route regression', 'Expand unit and route tests with fixtures for normal responses, malformed responses, and upstream failures.', 'Run targeted tests and record coverage gaps and external dependencies.', 'Search integration regression evidence.'],
      ['Harden service error boundaries', 'Ensure expected provider failures produce useful, non-sensitive errors and unexpected faults reach standard logging.', 'Verify no success-shaped fallback or swallowed failure hides missing patent data.', 'Explicit search failure behavior.'],
      ['Review search integration acceptance', 'Walk through search entry, provider call, normalized response, results display, and failure recovery.', 'Compare observed results with the acceptance checklist and log unresolved defects.', 'Search feature acceptance record.'],
    ],
  },
  {
    id: '4',
    name: 'Ingestion, background jobs, and persistence',
    dayCount: 9,
    activities: [
      ['Inventory existing data files safely', 'Identify file-backed records and large datasets by purpose, ownership, sensitivity, and format without publishing their contents.', 'Decide which data must migrate, remain local, be regenerated, or be excluded.', 'Data disposition and migration inventory.'],
      ['Define persistence interface', 'Specify repository operations, transaction expectations, serialization boundaries, and test doubles.', 'Verify the interface keeps routes independent from the selected persistence engine.', 'Persistence adapter contract.'],
      ['Implement schema/version migration path', 'Add versioned schema evolution with validation and a documented rollback or restore approach.', 'Test fresh initialization and sequential upgrade from a representative prior version.', 'Repeatable data migration.'],
      ['Build idempotent ingestion workflow', 'Define stable job keys and duplicate handling for repeated patent-result ingestion.', 'Replay the same fixture twice and verify the second run does not corrupt or duplicate state.', 'Idempotent ingestion behavior.'],
      ['Implement bounded job state transitions', 'Represent queued, running, completed, retryable-failure, and terminal-failure states with timestamps.', 'Test legal transitions and reject invalid state changes.', 'Explicit job lifecycle model.'],
      ['Add retry and dead-letter policy', 'Specify capped retry/backoff rules and operator-visible handling for exhausted jobs.', 'Simulate provider outage and confirm bounded retries and actionable terminal status.', 'Recoverable background processing policy.'],
      ['Connect persistence to results and analysis', 'Persist only required records and link each record to its provenance and job status.', 'Verify reads are authorization-safe and stale/incomplete records are surfaced accurately.', 'Integrated stored-result workflow.'],
      ['Implement retention and export/restore controls', 'Document retention defaults, delete/export requirements, backup scope, and restore validation.', 'Test a representative backup/restore round trip without exposing real user data.', 'Retention and recovery runbook.'],
      ['Validate ingestion and persistence acceptance', 'Run failure, duplicate, restart, and migration scenarios against the agreed data model.', 'Capture test evidence and unresolved data integrity risks.', 'Ingestion/persistence acceptance evidence.'],
    ],
  },
  {
    id: '5',
    name: 'AI analysis and report workflow',
    dayCount: 11,
    activities: [
      ['Define analysis inputs and evidence contract', 'Separate original patent fields, retrieved source material, model instructions, and derived interpretations.', 'Reject or flag analysis requests with missing provenance or invalid source records.', 'Evidence-aware analysis input contract.'],
      ['Isolate model/provider configuration', 'Define server-side provider selection, timeout, error, and key boundaries without exposing credentials to clients.', 'Test provider unavailability and configuration errors explicitly.', 'Model provider adapter and configuration policy.'],
      ['Implement analysis job orchestration', 'Connect eligible persisted records to bounded analysis steps and explicit per-stage status.', 'Verify stage order, cancellation, partial failure, and replay handling.', 'Traceable analysis job flow.'],
      ['Add source-grounded output structure', 'Require output sections to identify source facts, inferred analysis, confidence/limitations, and citations where supported.', 'Test that missing evidence is reported rather than filled with fabricated patent facts.', 'Structured source-grounded report format.'],
      ['Implement report generation and retrieval', 'Generate a stable report artifact linked to its input record, model/provider metadata, and creation time.', 'Verify report retrieval and invalid/missing report error behavior.', 'Versioned report artifact flow.'],
      ['Add safeguards for unsupported advice', 'Ensure report wording does not present experimental AI output as legal, medical, or investment advice.', 'Review representative outputs for unsupported certainty and escalation language.', 'Output-safety review checklist and tests.'],
      ['Handle analysis limits and provider failures', 'Add explicit token/size bounds, timeout handling, and retry policy for model requests.', 'Test oversized inputs and upstream failures without losing source records.', 'Bounded analysis request behavior.'],
      ['Build review and correction workflow', 'Allow users to inspect cited source material and distinguish, correct, or reject generated interpretations.', 'Test that corrected/rejected outputs do not overwrite immutable source data.', 'Human review and correction path.'],
      ['Add audit metadata and reproducibility cues', 'Record safe model/version, prompt template version, source IDs, run time, and non-sensitive status data.', 'Check logs/reports for unnecessary secrets or personal data.', 'Auditable analysis metadata.'],
      ['Test analysis behavior with fixtures', 'Use deterministic fixtures for complete evidence, conflicting sources, empty records, and model failure.', 'Assert truthful uncertainty and stable serialization in each case.', 'Analysis regression suite.'],
      ['Review report acceptance and safeguards', 'Demonstrate the end-to-end search-to-report journey against product criteria and safety expectations.', 'Capture acceptance evidence and any release-blocking limitations.', 'Analysis/report acceptance record.'],
    ],
  },
  {
    id: '6',
    name: 'Integrated user experience and accessibility',
    dayCount: 10,
    activities: [
      ['Design unified navigation and page hierarchy', 'Map site pages and application workflows into a consistent route and navigation structure.', 'Review page labels, active states, and direct-link behavior.', 'Unified navigation specification.'],
      ['Implement search workflow interface', 'Build accessible query inputs, clear actions, validation feedback, and keyboard-operable submission.', 'Test keyboard-only use and screen-reader labels for the search form.', 'Accessible search interface.'],
      ['Integrate result list and detail presentation', 'Show normalized identifiers, source links, retrieval state, and key result fields with clear grouping.', 'Check responsive display and long identifier/content wrapping.', 'Responsive result list/detail view.'],
      ['Implement status, error, empty, and partial states', 'Provide consistent feedback for loading, zero results, provider errors, partial results, and retryable failures.', 'Verify status announcements and recovery actions are keyboard reachable.', 'Complete asynchronous state handling.'],
      ['Build analysis/report review screens', 'Expose source evidence beside derived report sections and provide clear review/correction affordances.', 'Confirm users can distinguish retrieved facts from generated interpretation.', 'Reviewable analysis/report UI.'],
      ['Integrate public site styling and components', 'Reuse compatible NationalAI components and tokens without breaking the existing nonprofit content pages.', 'Run visual/content regressions over every current destination route.', 'Consistent integrated design system.'],
      ['Add responsive layout and touch behavior', 'Review narrow, medium, and wide layouts for search, result, report, and navigation pages.', 'Verify no horizontal overflow and controls remain usable at supported viewport sizes.', 'Responsive layout checks.'],
      ['Audit accessibility semantics and focus', 'Review heading order, landmarks, labels, contrast tokens, skip links, focus visibility, and reduced-motion behavior.', 'Run automated accessibility checks and manual keyboard walkthrough.', 'Accessibility findings and remediations.'],
      ['Review content clarity and privacy notices', 'Clarify search scope, data handling, generated content limitations, and user expectations at relevant points.', 'Verify notice wording is readable and does not imply unsupported capabilities.', 'Reviewed user-facing explanatory copy.'],
      ['Run end-to-end UX acceptance', 'Walk through first visit, search, result review, analysis, failure recovery, and returning navigation.', 'Log defects by severity and identify any usability release blockers.', 'UX acceptance notes and defect list.'],
    ],
  },
  {
    id: '7',
    name: 'Security, privacy, reliability, and performance',
    dayCount: 9,
    activities: [
      ['Review credentials and deployment secrets', 'Inspect configuration flows for provider keys and ensure sensitive values remain server-side.', 'Verify clean builds contain no secret values and startup fails clearly for required missing configuration.', 'Secret-handling verification.'],
      ['Review HTTP boundaries and browser protections', 'Assess CORS, security headers, content policy, static asset exposure, and cross-origin requirements.', 'Test allowed/disallowed origins and validate deployed header configuration.', 'HTTP/browser security configuration.'],
      ['Validate input, output, and file boundaries', 'Review route schemas, output encoding, file names/paths, and untrusted provider/model content.', 'Add negative tests for malformed values and unsafe output contexts.', 'Input/output boundary test evidence.'],
      ['Review personal and geolocation data handling', 'Inventory collection and access paths, minimize fields, set purpose/retention rules, and prevent accidental publication.', 'Test that public/client output and routine logs exclude restricted data.', 'Data minimization and access review.'],
      ['Assess dependency and license risk', 'Scan the selected application dependency set and review direct/transitive licenses and known vulnerabilities.', 'Document actionable updates, compatibility tests, and any accepted temporary risk.', 'Dependency risk register.'],
      ['Add rate limits and abuse protections', 'Define practical limits for search and analysis workloads and protect external provider quotas.', 'Exercise boundary behavior and verify rejected requests are observable.', 'Abuse-control test results.'],
      ['Strengthen health checks and diagnostic signals', 'Define liveness/readiness semantics, correlation IDs, useful error context, and redaction rules.', 'Simulate provider/storage outage and confirm accurate health and operator diagnostics.', 'Operational diagnostics and health checks.'],
      ['Run performance and resilience probes', 'Set baseline response and resource expectations for normal, slow-provider, and bounded-load scenarios.', 'Measure the agreed test set and document bottlenecks and evidence.', 'Performance/resilience baseline.'],
      ['Complete security/privacy remediation review', 'Recheck resolved findings, residual risks, data retention, access, and release dependencies.', 'Record explicit owners and block release for unresolved critical risks.', 'Security/privacy readiness record.'],
    ],
  },
  {
    id: '8',
    name: 'Integrated quality assurance and deployment rehearsal',
    dayCount: 6,
    activities: [
      ['Build integrated automated test matrix', 'Map unit, route/contract, persistence, UI, accessibility, and build checks to acceptance criteria.', 'Run clean-install tests and identify untested critical paths.', 'Requirements-to-test traceability matrix.'],
      ['Run cross-module integration and regression', 'Exercise site pages, API, search providers, jobs, data, reports, and deployed asset paths together.', 'Fix regressions and preserve existing nonprofit site behavior.', 'Integrated regression results.'],
      ['Complete user acceptance walkthrough', 'Conduct realistic user-journey review using safe fixtures and record expected versus observed behavior.', 'Resolve or formally defer all blocking acceptance defects.', 'User acceptance record.'],
      ['Rehearse backup, restore, and rollback', 'Exercise release backup, data restore, rollback triggers, and recovery ownership.', 'Measure recovery steps and confirm no untested destructive migration remains.', 'Recovery rehearsal evidence.'],
      ['Rehearse production deployment and smoke checks', 'Deploy a release candidate to the intended hosting configuration and check health, routes, assets, and provider setup.', 'Capture deployment outputs and confirm rollback path is viable.', 'Release-candidate rehearsal report.'],
      ['Review readiness criteria and open risks', 'Review automated tests, acceptance, security/privacy, performance, operational ownership, and known limitations.', 'Issue a go/no-go recommendation with unresolved conditions clearly identified.', 'Release readiness decision package.'],
    ],
  },
  {
    id: '9',
    name: 'Production cutover, stabilization, and handoff',
    dayCount: 5,
    activities: [
      ['Finalize operator and contributor documentation', 'Publish setup, architecture, environment, support, recovery, and change-management instructions.', 'Validate documentation against a clean environment and named operational contacts.', 'Production operations and contributor guide.'],
      ['Hold final release review', 'Confirm acceptance evidence, approved scope, security/privacy disposition, backups, support, and rollback readiness.', 'Record a dated go/no-go decision; defer cutover if a release gate is unmet.', 'Signed-off release decision and checklist.'],
      ['Execute controlled production cutover', 'Apply the approved deploy/data migration sequence and monitor health, core routes, and provider integrations.', 'Validate key journeys and trigger documented rollback if exit criteria fail.', 'Production cutover record.'],
      ['Stabilize and resolve launch defects', 'Review production signals and user feedback; triage defects, service errors, and performance regressions.', 'Confirm critical issues are resolved or the system is rolled back.', 'Stabilization log and resolved defect evidence.'],
      ['Complete handoff and closeout', 'Summarize delivered scope, known limitations, operational actions, deferred backlog, and maintenance cadence.', 'Confirm owners can deploy, verify, restore, and support the integrated application.', 'Handoff package and project closeout.'],
    ],
  },
];

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function makeRetrospective() {
  const periods = [];
  periods.push({
    start: new Date(Date.UTC(2026, 0, 1)),
    end: new Date(Date.UTC(2026, 0, 4)),
    partial: true,
  });

  for (
    let start = new Date(Date.UTC(2026, 0, 5));
    start <= new Date(Date.UTC(2026, 9, 5));
    start = addDays(start, 7)
  ) {
    periods.push({ start, end: addDays(start, 6), partial: false });
  }

  return periods.map((period, index) => ({
    week: index + 1,
    startDate: isoDate(period.start),
    endDate: isoDate(period.end),
    partialCalendarWeek: period.partial,
    totalHours: 20,
    availabilityCheckHours: 1,
    computerAndSoftwareUpdateHours: 1,
    developmentHours: 18,
    developmentBreakdown: {
      designAndPlanningHours: 5,
      implementationAndConfigurationHours: 10,
      verificationAndDocumentationHours: 3,
    },
    estimatedWorkFocus: RETROSPECTIVE_THEMES[index],
    recordStatus: 'Reconstructed estimate; verify against contemporaneous records.',
  }));
}

function makeProjectPlan() {
  const workdays = [];
  const start = new Date(Date.UTC(2026, 9, 13));
  const end = new Date(Date.UTC(2027, 3, 13));
  for (let date = start; date <= end; date = addDays(date, 1)) {
    if ([1, 2, 3].includes(date.getUTCDay())) {
      workdays.push(date);
    }
  }

  const longSessionIndexes = new Set();
  let dayOffset = 0;
  const phases = PHASES.map((phase) => {
    const phaseStartOffset = dayOffset;
    for (let offset = 0; offset < phase.dayCount; offset += 1) {
      if (offset === 0 && longSessionIndexes.size < 3) {
        longSessionIndexes.add(dayOffset + offset);
      }
    }
    dayOffset += phase.dayCount;
    return { ...phase, phaseStartOffset };
  });

  let phaseIndex = 0;
  let withinPhase = 0;
  const days = workdays.map((date, index) => {
    while (withinPhase >= phases[phaseIndex].dayCount) {
      phaseIndex += 1;
      withinPhase = 0;
    }
    const phase = phases[phaseIndex];
    const activity = phase.activities[withinPhase];
    const hours = longSessionIndexes.has(index) ? 8 : 6;
    const verificationTask = `Verify "${activity[0]}" against acceptance evidence: ${activity[3]}`;
    const documentationTask = `Record decisions, verification evidence, and next steps for "${activity[0]}".`;
    const breakdown = hours === 8
      ? [
          { wbs: `${phase.id}.${String(withinPhase + 1).padStart(2, '0')}.1`, hours: 2, task: activity[1] },
          { wbs: `${phase.id}.${String(withinPhase + 1).padStart(2, '0')}.2`, hours: 4, task: activity[2] },
          { wbs: `${phase.id}.${String(withinPhase + 1).padStart(2, '0')}.3`, hours: 1, task: verificationTask },
          { wbs: `${phase.id}.${String(withinPhase + 1).padStart(2, '0')}.4`, hours: 1, task: documentationTask },
        ]
      : [
          { wbs: `${phase.id}.${String(withinPhase + 1).padStart(2, '0')}.1`, hours: 1, task: activity[1] },
          { wbs: `${phase.id}.${String(withinPhase + 1).padStart(2, '0')}.2`, hours: 3, task: activity[2] },
          { wbs: `${phase.id}.${String(withinPhase + 1).padStart(2, '0')}.3`, hours: 1, task: verificationTask },
          { wbs: `${phase.id}.${String(withinPhase + 1).padStart(2, '0')}.4`, hours: 1, task: documentationTask },
        ];
    const day = {
      date: isoDate(date),
      weekday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getUTCDay()],
      hours,
      phaseId: phase.id,
      phaseName: phase.name,
      wbs: `${phase.id}.${String(withinPhase + 1).padStart(2, '0')}`,
      task: activity[0],
      expectedDeliverable: activity[3],
      status: 'Planned; work not yet performed.',
      breakdown,
    };
    withinPhase += 1;
    return day;
  });

  const schedulePhases = phases.map((phase) => {
    const phaseDays = days.filter((day) => day.phaseId === phase.id);
    return {
      id: phase.id,
      name: phase.name,
      estimatedHours: phaseDays.reduce((total, day) => total + day.hours, 0),
      startDate: phaseDays[0].date,
      endDate: phaseDays[phaseDays.length - 1].date,
      plannedWorkdays: phaseDays.length,
      activities: phaseDays.map((day) => ({
        wbs: day.wbs,
        task: day.task,
        expectedDeliverable: day.expectedDeliverable,
      })),
    };
  });

  return {
    startDate: '2026-10-13',
    endDate: '2027-04-13',
    plannedHours: days.reduce((total, day) => total + day.hours, 0),
    plannedWorkdays: days.length,
    scheduledWeekdays: ['Monday', 'Tuesday', 'Wednesday'],
    operationalOverheadExcluded: [
      'Weekly website availability check (1 hour/week)',
      'Weekly computer/software updates (1 hour/week)',
    ],
    dailyEntries: days,
    phases: schedulePhases,
  };
}

function generateWorkLogData() {
  const retrospective = makeRetrospective();
  const projectPlan = makeProjectPlan();
  const sourceHistoryNote = 'The NationalAI history inspected for this reconstruction includes the static-site rebuild commit dated 2026-10-02 and a footer update dated 2026-10-03. These entries do not substantiate the earlier weekly activity or hours. The 2026-10-05 through 2026-10-11 migration completion is founder-reported.';

  if (RETROSPECTIVE_THEMES.length !== 41 || retrospective.length !== 41) {
    throw new Error('Work-log generator must contain exactly 41 retrospective periods.');
  }
  if (projectPlan.dailyEntries.length !== 79 || projectPlan.plannedHours !== 480) {
    throw new Error('Work-log generator must schedule exactly 79 workdays and 480 hours.');
  }

  return {
    generatedAt: '2026-10-13',
    retrospective: {
      periodStartDate: '2026-01-01',
      periodEndDate: '2026-10-11',
      totalWeeks: retrospective.length,
      totalHours: retrospective.reduce((total, week) => total + week.totalHours, 0),
      availabilityCheckHours: retrospective.reduce((total, week) => total + week.availabilityCheckHours, 0),
      computerAndSoftwareUpdateHours: retrospective.reduce((total, week) => total + week.computerAndSoftwareUpdateHours, 0),
      developmentHours: retrospective.reduce((total, week) => total + week.developmentHours, 0),
      sourceHistoryNote,
      openingPartialWeekNote: 'January 1-4, 2026 is a partial Monday-Sunday calendar week but is assigned the stated 20-hour weekly estimate; validate or revise this assumption.',
      weeks: retrospective,
    },
    projectPlan,
  };
}

function main() {
  const data = generateWorkLogData();
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Wrote ${path.relative(ROOT_DIR, OUTPUT_FILE)}: ${data.retrospective.totalWeeks} estimated weeks and ${data.projectPlan.plannedWorkdays} planned days / ${data.projectPlan.plannedHours} hours.`);
}

if (require.main === module) {
  main();
}

module.exports = { generateWorkLogData };
