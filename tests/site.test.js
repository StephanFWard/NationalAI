'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const { build } = require('../build.js');

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

  assert.equal(result.pages.length, 5);
  assert.deepEqual(
    result.pages.map((page) => page.url).sort(),
    [
      '/',
      '/2024/07/11/articles-of-incorperation-6-29-2024/',
      '/404.html',
      '/about/',
      '/posts/'
    ]
  );

  for (const asset of ['assets/styles.css', 'assets/favicon.svg', 'sitemap.xml', 'robots.txt']) {
    assert.ok(fs.existsSync(path.join(DIST_DIR, asset)), `missing dist/${asset}`);
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
    articles.includes('AFFIDAVIT') === false,
    'articles page should keep its own Articles of Incorporation wording, not the homepage affidavit'
  );

  const home = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
  assert.ok(
    home.includes('AFFIDAVIT OF ORGANIZATIONAL INTENT AND FINANCIAL COMPLIANCE'),
    'homepage affidavit wording changed'
  );
});

test('stylesheet uses the soft dark theme tokens without hardcoded colors', () => {
  build();

  const css = fs.readFileSync(path.join(DIST_DIR, 'assets', 'styles.css'), 'utf8');
  assert.ok(css.includes('--color-surface: #232937'), 'soft dark surface token is missing');
  assert.ok(css.includes('.document__subheading'), 'document subheading style is missing');
  assert.ok(css.includes('.site-header__skip'), 'skip-link style is missing');

  const componentCss = css.split('/* ===== ')[1] || '';
  assert.ok(!/#[0-9a-fA-F]{3,8}/.test(componentCss.split('src/styles/tokens.css')[0] || ''), 'unexpected leading CSS');
  const afterTokens = css.slice(css.indexOf('/* ===== src/styles/reset.css'));
  assert.ok(!/#000/.test(afterTokens) || afterTokens.includes('--color'), 'avoid pure black surfaces');
});
