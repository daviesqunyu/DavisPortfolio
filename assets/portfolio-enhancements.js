(() => {
  const cards = [...document.querySelectorAll('.project-card[data-category]')];
  const search = document.querySelector('#projectSearch');
  const filters = [...document.querySelectorAll('.filter-chip[data-filter]')];
  const count = document.querySelector('#projectResults');
  const empty = document.querySelector('#projectEmpty');
  let activeFilter = 'all';

  const renderProjects = () => {
    const query = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
      const searchable = `${card.dataset.search || ''} ${card.textContent}`.toLowerCase();
      const matchesQuery = !query || searchable.includes(query);
      const show = matchesCategory && matchesQuery;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (count) count.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'} shown`;
    if (empty) empty.hidden = visible !== 0;
  };

  filters.forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filters.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    renderProjects();
  }));
  search?.addEventListener('input', renderProjects);
  renderProjects();

  // Broken local/remote artwork degrades to a readable local SVG data image.
  document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      if (image.dataset.fallbackApplied) return;
      image.dataset.fallbackApplied = 'true';
      const title = (image.alt || 'Project artwork').replace(/[<>&"']/g, '').slice(0, 60);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 650"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#123b49"/><stop offset="1" stop-color="#282455"/></linearGradient></defs><rect width="1200" height="650" fill="url(#g)"/><circle cx="600" cy="260" r="105" fill="#8bd5ff" fill-opacity=".16"/><path d="M545 260h110M600 205v110" stroke="#8bd5ff" stroke-width="18" stroke-linecap="round"/><text x="600" y="455" fill="#f4f7fc" font-family="Arial,sans-serif" font-size="34" text-anchor="middle">${title}</text></svg>`;
      image.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
      image.classList.add('image-fallback');
    });
  });

  const topButton = document.querySelector('.back-to-top');
  if (topButton) {
    const updateTopButton = () => topButton.classList.toggle('visible', window.scrollY > 420);
    window.addEventListener('scroll', updateTopButton, { passive: true });
    updateTopButton();
    topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
})();
