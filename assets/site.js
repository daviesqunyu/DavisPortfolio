(() => {
  const body = document.body;
  const themeToggle = document.querySelector('.theme-toggle');
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.site-nav');
  const savedTheme = localStorage.getItem('davis-portfolio-theme');

  if (savedTheme === 'light') body.classList.add('light');

  const syncThemeButton = () => {
    if (!themeToggle) return;
    const light = body.classList.contains('light');
    themeToggle.innerHTML = light ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
  };

  syncThemeButton();
  themeToggle?.addEventListener('click', () => {
    body.classList.toggle('light');
    localStorage.setItem('davis-portfolio-theme', body.classList.contains('light') ? 'light' : 'dark');
    syncThemeButton();
  });

  menuToggle?.addEventListener('click', () => {
    const open = navigation.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menuToggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });

  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
})();
