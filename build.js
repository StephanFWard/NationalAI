#!/usr/bin/env node
/**
 * National AI Advancement for Human Innovation - static site builder.
 *
 * Reads src/pages/**, expands the component include syntax documented below,
 * bundles the stylesheets and writes a deployable site to dist/.
 *
 * Include syntax (used inside src/pages and src/components only):
 *   <!-- @include ComponentName -->
 *                              -> replaced by the component's markup
 *   <!-- @include ComponentName key="value" -->
 *                              -> same, with {{key}} placeholders substituted
 *   <!-- @include ComponentName --> ...content... <!-- @endinclude ComponentName -->
 *                              -> "block" include; the component's
 *                                 <!-- @content --> marker receives the content.
 *                                 The closing tag must repeat the component name
 *                                 so nested includes resolve unambiguously.
 *                                 Standalone includes (no matching end tag)
 *                                 are treated as self-closing.
 *
 * Component lookup: src/components/<Name>/<Name>.html
 *
 * Usage:
 *   node build.js               # build into ./dist
 *   node build.js --out <dir>   # build into a custom directory
 *
 * Zero runtime dependencies (Node built-ins only).
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = __dirname;
const SRC_DIR = path.join(ROOT_DIR, 'src');
const PAGES_DIR = path.join(SRC_DIR, 'pages');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const STYLES_DIR = path.join(SRC_DIR, 'styles');

/**
 * Canonical origin used for sitemap.xml and robots.txt.
 * Override with the SITE_URL environment variable once the Render URL is known,
 * e.g. SITE_URL=https://your-service.onrender.com npm run build
 */
const SITE_URL = (process.env.SITE_URL || 'https://nationalai.onrender.com').replace(/\/+$/, '');

const ATTRIBUTE_PATTERN = '(?:\\s+[A-Za-z][\\w-]*="[^"]*")*';
const TOKEN_RE = /<!--\s*@(include|endinclude)\b([\s\S]*?)-->/g;
const PLACEHOLDER_RE = /\{\{([\w-]+)\}\}/;
const PLACEHOLDER_ALL_RE = /\{\{([\w-]+)\}\}/g;
const CONTENT_MARKER = '<!-- @content -->';

const FAVICON_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="National AI Advancement for Human Innovation">',
  '  <rect width="32" height="32" rx="8" fill="#232937"/>',
  '  <path d="M8 24V8h5.6l4.8 9.2L23.1 8H28v16h-4.4v-9.1L19.2 24h-3.1L8 14.9V24z" fill="#7ec8ba"/>',
  '</svg>',
  ''
].join('\n');

function parseArguments(argv) {
  const options = { out: path.join(ROOT_DIR, 'dist') };

  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--out') {
      const value = argv[index + 1];
      if (value === undefined) {
        throw new Error('build.js: --out requires a directory argument');
      }
      options.out = path.resolve(ROOT_DIR, value);
      index += 1;
    }
  }

  return options;
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
}

function listFilesRecursive(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(entryPath));
    } else {
      files.push(entryPath);
    }
  }

  return files;
}

function listComponentNames() {
  if (!fs.existsSync(COMPONENTS_DIR)) {
    throw new Error(`build.js: missing component directory ${COMPONENTS_DIR}`);
  }

  return fs
    .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function parseAttributes(rawAttributes) {
  const attributes = {};
  const attributeRe = /([A-Za-z][\w-]*)="([^"]*)"/g;
  let match = attributeRe.exec(rawAttributes);

  while (match !== null) {
    attributes[match[1]] = match[2];
    match = attributeRe.exec(rawAttributes);
  }

  return attributes;
}
function componentTemplate(name, rawAttributes, pageLabel) {
  const componentFile = path.join(COMPONENTS_DIR, name, `${name}.html`);

  if (!fs.existsSync(componentFile)) {
    throw new Error(`build.js: unknown component "${name}" included by ${pageLabel}`);
  }

  return {
    file: componentFile,
    attributes: parseAttributes(rawAttributes),
    template: readText(componentFile)
  };
}

function fillPlaceholders(template, attributes, name, pageLabel) {
  return template.replace(PLACEHOLDER_ALL_RE, (placeholder, key) => {
    if (!Object.prototype.hasOwnProperty.call(attributes, key)) {
      throw new Error(
        `build.js: component "${name}" needs ${placeholder} but ${pageLabel} did not supply a "${key}" value`
      );
    }

    return attributes[key];
  });
}

function resolveComponent(name, rawAttributes, pageLabel) {
  const component = componentTemplate(name, rawAttributes, pageLabel);

  if (!PLACEHOLDER_RE.test(component.template)) {
    return component.template;
  }

  return fillPlaceholders(component.template, component.attributes, name, pageLabel);
}

/**
 * Expands includes with a stack-based parse so nested block includes resolve
 * innermost-first while standalone includes are treated as self-closing.
 */
function expandIncludes(source, pageLabel) {
  const tokenRe = new RegExp(TOKEN_RE.source, 'g');
  const output = [];
  const stack = [];
  let cursor = 0;
  let token = tokenRe.exec(source);

  function appendText(text) {
    if (text === '') {
      return;
    }

    if (stack.length > 0) {
      stack[stack.length - 1].slot += text;
    } else {
      output.push(text);
    }
  }

  function emitSelfClosing(name, rawAttributes) {
    const template = resolveComponent(name, rawAttributes, pageLabel);

    if (template.includes(CONTENT_MARKER)) {
      throw new Error(
        `build.js: component "${name}" expects body content but ${pageLabel} did not wrap it in an include block`
      );
    }

    appendText(template);
  }

  while (token !== null) {
    const [whole, kind, payload] = token;
    const tokenStart = token.index;

    appendText(source.slice(cursor, tokenStart));
    cursor = tokenStart + whole.length;

    if (kind === 'include') {
      const open = payload.match(/^\s*([A-Za-z][\w]*)((?:\s+[A-Za-z][\w-]*="[^"]*")*)\s*\/?$/);

      if (open === null) {
        throw new Error(`build.js: malformed include directive "${whole}" in ${pageLabel}`);
      }

      const template = componentTemplate(open[1], open[2], pageLabel).template;

      if (!template.includes(CONTENT_MARKER)) {
        emitSelfClosing(open[1], open[2]);
      } else {
        stack.push({ name: open[1], rawAttributes: open[2], slot: '' });
      }
    } else {
      const close = payload.match(/^\s*([A-Za-z][\w]*)?\s*$/);

      if (close === null) {
        throw new Error(`build.js: malformed endinclude directive "${whole}" in ${pageLabel}`);
      }

      if (stack.length === 0) {
        throw new Error(`build.js: stray "${whole}" without a matching include in ${pageLabel}`);
      }

      const frame = stack.pop();

      if (close[1] !== undefined && close[1] !== frame.name) {
        throw new Error(
          `build.js: mismatched include: "${frame.name}" was closed by "${close[1]}" in ${pageLabel}`
        );
      }

      const template = resolveComponent(frame.name, frame.rawAttributes, pageLabel);

      if (!template.includes(CONTENT_MARKER)) {
        if (frame.slot.trim() !== '') {
          throw new Error(
            `build.js: component "${frame.name}" is used as a block include by ${pageLabel} but has no "${CONTENT_MARKER}" marker`
          );
        }

        appendText(template);
      } else {
        appendText(template.replace(CONTENT_MARKER, expandIncludes(frame.slot, pageLabel)));
      }
    }

    token = tokenRe.exec(source);
  }

  appendText(source.slice(cursor));

  if (stack.length > 0) {
    const openFrames = stack.map((frame) => `"${frame.name}"`).join(', ');
    throw new Error(`build.js: ${pageLabel} has unclosed include(s): ${openFrames}`);
  }

  return output.join('');
}

function findUnresolvedMarkers(markup) {
  const patterns = [
    { label: 'include directive', re: /<!--\s*@(?:include|endinclude)\b[\s\S]*?-->/ },
    { label: 'content marker', re: /<!--\s*@content\s*-->/ },
    { label: 'unfilled placeholder', re: /\{\{[\w-]+\}\}/ }
  ];

  return patterns.filter((pattern) => pattern.re.test(markup)).map((pattern) => pattern.label);
}
function bundleStylesheet(componentNames) {
  const sheets = [path.join(STYLES_DIR, 'tokens.css'), path.join(STYLES_DIR, 'reset.css')];

  for (const name of componentNames) {
    const sheet = path.join(COMPONENTS_DIR, name, `${name}.css`);
    if (fs.existsSync(sheet)) {
      sheets.push(sheet);
    }
  }

  return sheets
    .map((sheet) => {
      const label = path.relative(ROOT_DIR, sheet).split(path.sep).join('/');
      return `/* ===== ${label} ===== */\n${readText(sheet).trim()}\n`;
    })
    .join('\n');
}

function pageUrlFor(outputFile, outDir) {
  const relative = path.relative(outDir, outputFile).split(path.sep).join('/');

  if (relative === 'index.html') {
    return '/';
  }

  if (relative.endsWith('/index.html')) {
    return `/${relative.slice(0, -'index.html'.length)}`;
  }

  return `/${relative}`;
}

function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

function buildSitemap(pages) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = pages
    .filter((page) => !page.url.endsWith('404.html'))
    .map((page) => {
      const location = page.url === '/' ? `${SITE_URL}/` : `${SITE_URL}${page.url}`;
      const priority = page.url === '/' ? '1.0' : '0.6';

      return [
        '  <url>',
        `    <loc>${location}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <priority>${priority}</priority>`,
        '  </url>'
      ].join('\n');
    });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    ''
  ].join('\n');
}

function buildRobots() {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${SITE_URL}/sitemap.xml`, ''].join('\n');
}
function build(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  const outDir = options.out;
  const componentNames = listComponentNames();

  if (!fs.existsSync(PAGES_DIR)) {
    throw new Error(`build.js: missing pages directory ${PAGES_DIR}`);
  }

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const pageFiles = listFilesRecursive(PAGES_DIR).filter((file) => file.endsWith('.html'));
  const pages = [];

  for (const pageFile of pageFiles) {
    const pageLabel = path.relative(ROOT_DIR, pageFile).split(path.sep).join('/');
    const outputFile = path.join(outDir, path.relative(PAGES_DIR, pageFile));
    const markup = expandIncludes(readText(pageFile), pageLabel);
    const unresolved = findUnresolvedMarkers(markup);

    if (unresolved.length > 0) {
      throw new Error(`build.js: ${pageLabel} still contains an unresolved ${unresolved.join(' / ')}`);
    }

    writeFile(outputFile, markup.endsWith('\n') ? markup : `${markup}\n`);
    pages.push({ source: pageLabel, output: outputFile, url: pageUrlFor(outputFile, outDir) });
  }

  writeFile(path.join(outDir, 'assets', 'styles.css'), bundleStylesheet(componentNames));
  writeFile(path.join(outDir, 'assets', 'favicon.svg'), FAVICON_SVG);
  writeFile(path.join(outDir, 'sitemap.xml'), buildSitemap(pages));
  writeFile(path.join(outDir, 'robots.txt'), buildRobots());

  return { outDir, pages, componentNames };
}

function main() {
  const { outDir, pages, componentNames } = build();
  const relativeOut = (path.relative(ROOT_DIR, outDir) || outDir).split(path.sep).join('/');

  console.log(`Built ${pages.length} page(s) into ${relativeOut} using ${componentNames.length} component(s):`);
  for (const page of pages) {
    console.log(`  ${page.url}  <-  ${page.source}`);
  }
  console.log('  /assets/styles.css');
  console.log('  /assets/favicon.svg');
  console.log('  /sitemap.xml');
  console.log('  /robots.txt');
}

if (require.main === module) {
  main();
}

module.exports = { build, expandIncludes, pageUrlFor, SITE_URL };