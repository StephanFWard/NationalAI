'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const { build } = require('../build.js');
const workLog = require('../docs/work-log/work-log-data.json');

function distFiles(extension) {
  const found = [];

  (function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        walk(entryPath);
      } else if (entryPath.endsWith(extension)) {
        found.push(entryPath);
      }
    }
  })(DIST_DIR);

  return found.sort();
}

test('build produces the expected deployable files', () => {
  const result = build();

  assert.equal(result.pages.length, 6);
  assert.deepEqual(
    result.pages.map((page) => page.url).sort(),
    [
      '/',
      '/2024/07/11/articles-of-incorperation-6-29-2024/',
      '/404.html',
      '/about/',
      '/posts/',
      '/work-log/'
    ]
  );

  for (const asset of ['assets/styles.css', 'assets/favicon.svg', 'sitemap.xml', 'robots.txt']) {
    assert.ok(fs.existsSync(path.join(DIST_DIR, asset)), `missing dist/${asset}`);
  }

  for (const document of [
    '2026-retrospective-estimate.docx',
    '2026-2027-production-integration-plan.docx'
  ]) {
    const source = path.join(ROOT_DIR, 'docs', 'work-log', document);
    const published = path.join(DIST_DIR, 'work-log', document);
    assert.ok(fs.existsSync(source), `missing source document ${document}`);
    assert.ok(fs.existsSync(published), `missing published work-log document ${document}`);
    assert.ok(fs.statSync(source).size > 1000, `${document} appears incomplete`);
    assert.equal(fs.readFileSync(source).subarray(0, 2).toString(), 'PK', `${document} is not a ZIP-based Word file`);
    assert.deepEqual(fs.readFileSync(published), fs.readFileSync(source));
  }
});

test('public work log identifies estimates and links the Word documents', () => {
  build();

  const page = fs.readFileSync(path.join(DIST_DIR, 'work-log', 'index.html'), 'utf8');
  assert.ok(page.includes('reconstructed estimates'), 'work log does not identify retrospective estimates');
  assert.ok(page.includes('/work-log/2026-retrospective-estimate.docx'), 'retrospective download link is missing');
  assert.ok(page.includes('/work-log/2026-2027-production-integration-plan.docx'), 'project plan download link is missing');
  assert.ok(page.includes('480 project hours'), 'project-hours scope is missing');
});

test('work-log data has correct retrospective and prospective dates and hour totals', () => {
  const weeks = workLog.retrospective.weeks;
  assert.equal(weeks.length, 41);
  assert.equal(workLog.retrospective.totalHours, 820);
  assert.equal(workLog.retrospective.availabilityCheckHours, 41);
  assert.equal(workLog.retrospective.computerAndSoftwareUpdateHours, 41);
  assert.equal(workLog.retrospective.developmentHours, 738);
  assert.equal(weeks[0].startDate, '2026-01-01');
  assert.equal(weeks[0].endDate, '2026-01-04');
  assert.equal(weeks[0].partialCalendarWeek, true);
  assert.equal(weeks[weeks.length - 1].startDate, '2026-10-05');
  assert.equal(weeks[weeks.length - 1].endDate, '2026-10-11');
  for (const week of weeks) {
    assert.equal(
      week.availabilityCheckHours
        + week.computerAndSoftwareUpdateHours
        + week.developmentBreakdown.designAndPlanningHours
        + week.developmentBreakdown.implementationAndConfigurationHours
        + week.developmentBreakdown.verificationAndDocumentationHours,
      20,
      `week ${week.week} does not total 20 estimated hours`
    );
  }

  const plan = workLog.projectPlan;
  assert.equal(plan.startDate, '2026-10-13');
  assert.equal(plan.endDate, '2027-04-13');
  assert.equal(plan.dailyEntries.length, 79);
  assert.equal(plan.plannedHours, 480);
  assert.equal(plan.dailyEntries.filter((day) => day.hours === 8).length, 3);
  assert.equal(plan.dailyEntries[0].weekday, 'Tuesday');
  assert.equal(plan.dailyEntries[0].date, '2026-10-13');
  assert.equal(plan.dailyEntries[plan.dailyEntries.length - 1].weekday, 'Tuesday');
  assert.equal(plan.dailyEntries[plan.dailyEntries.length - 1].date, '2027-04-13');
  assert.deepEqual(
    plan.phases.map((phase) => phase.estimatedHours),
    [50, 56, 74, 54, 66, 60, 54, 36, 30]
  );
  assert.equal(plan.phases.reduce((total, phase) => total + phase.estimatedHours, 0), 480);
  assert.equal(new Set(plan.dailyEntries.map((day) => day.date)).size, 79);

  for (const day of plan.dailyEntries) {
    const weekday = new Date(`${day.date}T12:00:00Z`).getUTCDay();
    assert.ok([1, 2, 3].includes(weekday), `${day.date} is not a Monday, Tuesday, or Wednesday`);
    assert.ok([6, 8].includes(day.hours), `${day.date} has an unexpected planned day length`);
    assert.equal(
      day.breakdown.reduce((total, task) => total + task.hours, 0),
      day.hours,
      `${day.date} task breakdown does not match scheduled hours`
    );
    assert.ok(
      day.breakdown.every((task) => task.task.trim().length > 0),
      `${day.date} has an empty WBS task`
    );
    assert.ok(day.expectedDeliverable.length > 0, `${day.date} is missing an expected deliverable`);
  }
});

test('pages keep exact wording, contact details, and no WordPress or PayPal traces', () => {
  build();

  const forbidden = ['wordpress', 'paypal', 'fundraiser', 'uncategorized', 'hello world', 'wp-'];
  for (const file of distFiles('.html')) {
    const markup = fs.readFileSync(file, 'utf8').toLowerCase();
    for (const word of forbidden) {
      assert.ok(!markup.includes(word), `${path.relative(ROOT_DIR, file)} contains "${word}"`);
    }
    assert.ok(!/ style=/.test(fs.readFileSync(file, 'utf8')), `${file} has inline styles`);
    assert.ok(!/<script(?![^>]*src=)/.test(fs.readFileSync(file, 'utf8')), `${file} has inline scripts`);
    assert.equal((fs.readFileSync(file, 'utf8').match(/<h1[\s>]/g) || []).length, 1, `${file} must have one h1`);
    assert.ok(
      !/<!--\s*@(include|endinclude)\b/.test(fs.readFileSync(file, 'utf8')),
      `${file} has unresolved includes`
    );
  }

  const about = fs.readFileSync(path.join(DIST_DIR, 'about', 'index.html'), 'utf8');
  assert.ok(about.includes('stephan.ward5@icloud.com'), 'about page is missing the updated email');
  assert.ok(about.includes('910.727.9500'), 'about page is missing the updated phone number');

  const articles = fs.readFileSync(
    path.join(DIST_DIR, '2024', '07', '11', 'articles-of-incorperation-6-29-2024', 'index.html'),
    'utf8'
  );
  assert.ok(articles.includes('910.727.9500'), 'articles page is missing the updated phone number');
  assert.ok(articles.includes('stephan.ward5@icloud.com'), 'articles page is missing the contact email');
  assert.ok(
    articles.includes('578 Arn Ward Road, Whiteville, NC 28472'),
    'articles page is missing the updated Whiteville address'
  );
  assert.ok(
    !articles.includes('839 Banner Elk Rd'),
    'articles page still contains the old Benson address'
  );
  assert.ok(
    articles.includes('I have a next-generation AI trade secrete concept.'),
    'articles page lost the original project wording'
  );
  assert.ok(
    articles.includes('we use different models to attempt to find cures for diseases and cancers'),
    'articles page is missing the disease/cancer cure scope wording'
  );
  assert.ok(
    articles.includes('AFFIDAVIT') === false,
    'articles page should keep its own Articles of Incorporation wording, not the homepage affidavit'
  );

  const home = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
  assert.ok(
    home.includes('AFFIDAVIT OF ORGANIZATIONAL INTENT AND FINANCIAL COMPLIANCE'),
    'homepage affidavit wording changed'
  );

  for (const file of distFiles('.html')) {
    assert.ok(
      fs.readFileSync(file, 'utf8').includes('Updated Website: 10/03/2026'),
      `${path.relative(ROOT_DIR, file)} is missing the footer update stamp`
    );
  }
});

test('stylesheet uses the soft dark theme tokens without hardcoded colors', () => {
  build();

  const css = fs.readFileSync(path.join(DIST_DIR, 'assets', 'styles.css'), 'utf8');
  assert.ok(css.includes('--color-surface: #232937'), 'soft dark surface token is missing');
  assert.ok(css.includes('.document__subheading'), 'document subheading style is missing');
  assert.ok(css.includes('.site-header__skip'), 'skip-link style is missing');
  assert.ok(css.includes('justify-content: center'), 'nav links are not center-justified');

  const componentCss = css.split('/* ===== ')[1] || '';
  assert.ok(!/#[0-9a-fA-F]{3,8}/.test(componentCss.split('src/styles/tokens.css')[0] || ''), 'unexpected leading CSS');
  const afterTokens = css.slice(css.indexOf('/* ===== src/styles/reset.css'));
  assert.ok(!/#000/.test(afterTokens) || afterTokens.includes('--color'), 'avoid pure black surfaces');
});
