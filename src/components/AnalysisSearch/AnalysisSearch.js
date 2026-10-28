/* ===== src/components/AnalysisSearch/AnalysisSearch.js =====
 * Client-side patent search interface for the Analysis Search page.
 * Calls the USPTO Patent Examination Data System (PEDS) / Open Data Portal
 * search endpoint directly from the browser. No backend, no keys required
 * for the public endpoint. Results are paginated locally and source links
 * are preserved so users can trace each record back to USPTO.
 */

'use strict';

(function () {
  const form = document.getElementById('analysis-search-form');
  const input = document.getElementById('analysis-search-query');
  const button = document.getElementById('analysis-search-button');
  const errorEl = document.getElementById('analysis-search-error');
  const loadingEl = document.getElementById('analysis-search-loading');
  const resultsEl = document.getElementById('analysis-search-results');
  const resultsListEl = document.getElementById('analysis-search-results-list');
  const countEl = document.getElementById('analysis-search-results-count');
  const emptyEl = document.getElementById('analysis-search-empty');
  const paginationEl = document.getElementById('analysis-search-pagination');
  const prevButton = document.getElementById('analysis-search-prev');
  const nextButton = document.getElementById('analysis-search-next');
  const pageInfoEl = document.getElementById('analysis-search-page-info');

  const USPTO_SEARCH_URL =
    'https://developer.uspto.gov/ibd-api/v1/patent/application/search';

  const PAGE_SIZE = 10;
  let allResults = [];
  let currentPage = 1;

  function setLoading(loading) {
    button.disabled = loading;
    loadingEl.hidden = !loading;
    resultsEl.hidden = loading;
    emptyEl.hidden = loading;
    paginationEl.hidden = loading;
    errorEl.textContent = '';
  }

  function showError(message) {
    errorEl.textContent = message;
    setLoading(false);
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  function renderResults(results) {
    resultsListEl.innerHTML = '';

    if (!results || results.length === 0) {
      countEl.textContent = '';
      resultsEl.hidden = true;
      emptyEl.hidden = false;
      paginationEl.hidden = true;
      return;
    }

    emptyEl.hidden = true;
    resultsEl.hidden = false;

    for (const record of results) {
      const article = document.createElement('article');
      article.className = 'analysis-search__result';

      const title = record.title || record.inventionTitle || 'Untitled patent';
      const number =
        record.patentNumber ||
        record.applicationNumber ||
        record.publicationNumber ||
        '—';
      const abstract = record.abstract || record.inventionAbstract || '';
      const sourceUrl =
        record.url ||
        record.link ||
        `https://ppubs.uspto.gov/pubwebapp/static/pages/ppubsbasic.html`;

      const titleLink = document.createElement('a');
      titleLink.className = 'analysis-search__result-title';
      titleLink.href = sourceUrl;
      titleLink.target = '_blank';
      titleLink.rel = 'noopener noreferrer';
      titleLink.textContent = escapeHtml(title);

      const meta = document.createElement('p');
      meta.className = 'analysis-search__result-meta';
      meta.textContent = [
        number ? 'Patent: ' + escapeHtml(number) : null,
        record.date ? 'Filed: ' + escapeHtml(record.date) : null
      ]
        .filter(Boolean)
        .join('  |  ');

      const snippet = document.createElement('p');
      snippet.className = 'analysis-search__result-snippet';
      snippet.textContent = escapeHtml(abstract).slice(0, 300);

      const source = document.createElement('div');
      source.className = 'analysis-search__result-source';

      const sourceLink = document.createElement('a');
      sourceLink.className = 'analysis-search__result-link';
      sourceLink.href = sourceUrl;
      sourceLink.target = '_blank';
      sourceLink.rel = 'noopener noreferrer';
      sourceLink.textContent = 'View at USPTO →';

      source.appendChild(sourceLink);
      article.appendChild(titleLink);
      article.appendChild(meta);
      article.appendChild(snippet);
      article.appendChild(source);
      resultsListEl.appendChild(article);
    }

    countEl.textContent =
      results.length === 1 ? '1 result' : results.length + ' results';
  }

  function renderPagination() {
    const totalPages = Math.ceil(allResults.length / PAGE_SIZE) || 1;
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = Math.min(currentPage * PAGE_SIZE, allResults.length);
    pageInfoEl.textContent =
      allResults.length === 0
        ? 'No results'
        : `Showing ${start + 1}–${end} of ${allResults.length}`;
    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
    paginationEl.hidden = totalPages <= 1;
  }

  function goToPage(page) {
    const totalPages = Math.ceil(allResults.length / PAGE_SIZE) || 1;
    currentPage = Math.max(1, Math.min(page, totalPages));
    const start = (currentPage - 1) * PAGE_SIZE;
    renderResults(allResults.slice(start, start + PAGE_SIZE));
    renderPagination();
  }

  prevButton.addEventListener('click', () => goToPage(currentPage - 1));
  nextButton.addEventListener('click', () => goToPage(currentPage + 1));

  async function handleSubmit(event) {
    event.preventDefault();
    errorEl.textContent = '';
    const query = input.value.trim();

    if (!query) {
      showError('Please enter a search term.');
      return;
    }

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(
        `${USPTO_SEARCH_URL}?searchText=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'NationalAI-AnalysisSearch/1.0'
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error('USPTO search returned status ' + response.status);
      }

      const data = await response.json();

      const raw =
        data.results ||
        data.patentApplications ||
        data.applications ||
        data.data ||
        [];

      allResults = raw.map(normalizeRecord);
      currentPage = 1;
      goToPage(1);
    } catch (err) {
      if (err.name === 'AbortError') {
        showError('The search request timed out. Please try again.');
      } else {
        showError('Unable to reach the USPTO search service. ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function normalizeRecord(record) {
    return {
      title:
        record.inventionTitle ||
        record.title ||
        record.patentTitle ||
        '',
      patentNumber: record.patentNumber || record.publicationNumber || '',
      applicationNumber: record.applicationNumber || '',
      date: record.filingDate || record.applicationDate || record.date || '',
      abstract:
        record.inventionAbstract ||
        record.abstract ||
        record.summary ||
        '',
      url:
        record.url ||
        record.link ||
        record.patentUrl ||
        `https://ppubs.uspto.gov/pubwebapp/static/pages/ppubsbasic.html`
    };
  }

  form.addEventListener('submit', handleSubmit);
})();