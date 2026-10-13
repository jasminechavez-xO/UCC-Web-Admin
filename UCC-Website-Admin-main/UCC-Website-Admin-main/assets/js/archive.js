(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const tableBody = $('#archiveTableBody');
  const search = $('#archiveSearch');
  const category = $('#categoryFilter');
  const order = $('#orderFilter');
  const count = $('#archiveCount');
  const empty = $('#archiveEmpty');
  const endMessage = $('#archiveEndMessage');
  const showMore = $('#showMoreBtn');
  const showLess = $('#showLessBtn');
  const modal = $('#archivePreviewModal');
  const PAGE_SIZE = 5;
  let visibleLimit = PAGE_SIZE;
  let toastTimer;

  // Table rows are hardcoded in Archive.html. All actions operate on these rows in memory only.
  function rows() { return $$('tr[data-id]', tableBody); }
  function formatLongDate(value) {
    if (!value) return '—';
    const d = new Date(value + 'T12:00:00');
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-PH', {month:'long', day:'numeric', year:'numeric'});
  }
  function matches(row) {
    const term = search.value.trim().toLowerCase();
    const categoryMatch = category.value === 'all' || row.dataset.category === category.value;
    const text = [row.dataset.title, row.dataset.category, row.dataset.excerpt, row.dataset.content, row.dataset.publish, row.dataset.archived].join(' ').toLowerCase();
    return categoryMatch && (!term || text.includes(term));
  }
  function sortRows(matched) {
    const mode = order.value;
    return matched.sort((a,b) => {
      if (mode === 'oldest') return (a.dataset.publish || '').localeCompare(b.dataset.publish || '');
      if (mode === 'az') return (a.dataset.title || '').localeCompare(b.dataset.title || '');
      if (mode === 'za') return (b.dataset.title || '').localeCompare(a.dataset.title || '');
      return (b.dataset.publish || '').localeCompare(a.dataset.publish || '');
    });
  }
  function render() {
    const allRows = rows();
    const matched = sortRows(allRows.filter(matches));
    const shown = new Set(matched.slice(0, visibleLimit));
    allRows.forEach(row => { row.hidden = !shown.has(row); if (shown.has(row)) tableBody.appendChild(row); });
    count.textContent = String(allRows.length);
    empty.hidden = matched.length > 0;
    showMore.hidden = matched.length <= visibleLimit || matched.length === 0;
    showLess.hidden = visibleLimit <= PAGE_SIZE || matched.length <= PAGE_SIZE;
    endMessage.hidden = matched.length === 0 || matched.length > visibleLimit;
    if (window.lucide) window.lucide.createIcons();
  }
  function toast(message) {
    const el = $('#archiveToast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
  }
  function openPreview(row) {
    $('#previewTitle').textContent = row.dataset.title || 'Untitled post';
    $('#previewExcerpt').textContent = row.dataset.excerpt || '';
    $('#previewBody').innerHTML = (row.dataset.content || '').split(/\n{2,}/).map(p => `<p>${escapeHTML(p)}</p>`).join('');
    // No internet images: the placeholder remains visible for these two sample records.
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const close = $('[data-close-preview]', modal); if (close) close.focus();
  }
  function closePreview() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  tableBody.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const row = button.closest('tr[data-id]');
    if (!row) return;
    const title = row.dataset.title || 'this post';
    if (button.dataset.action === 'preview') { openPreview(row); return; }
    if (button.dataset.action === 'restore') {
      if (!window.confirm(`Unarchive “${title}”?`)) return;
      row.remove(); render(); toast('Post unarchived.'); return;
    }
    if (button.dataset.action === 'delete') {
      if (!window.confirm(`Permanently delete “${title}”? This cannot be undone.`)) return;
      row.remove(); render(); toast('Archived item deleted.');
    }
  });
  [search, category, order].forEach(control => control.addEventListener(control === search ? 'input' : 'change', () => { visibleLimit = PAGE_SIZE; render(); }));
  showMore.addEventListener('click', () => { visibleLimit += PAGE_SIZE; render(); });
  showLess.addEventListener('click', () => { visibleLimit = PAGE_SIZE; render(); });
  $$('[data-close-preview]', modal).forEach(button => button.addEventListener('click', closePreview));
  modal.addEventListener('click', event => { if (event.target === modal) closePreview(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('open')) closePreview(); });
  if (window.lucide) window.lucide.createIcons();
  render();
})();
