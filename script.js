// Utility: rAF-coalesced scroll listener
function onScroll(callback) {
  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          callback();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
}

// 1) Navbar: sticky scrolled state + active link highlighting
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const handle = () => {
    // Scrolled shadow/class
    if (window.scrollY > 50) navbar?.classList.add('scrolled');
    else navbar?.classList.remove('scrolled');

    // Active link highlight
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= sectionTop - 200) {
        current = section.getAttribute('id') || '';
      }
    });
    navLinks.forEach((link) => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href.endsWith(`#${current}`)) link.classList.add('active');
    });
  };

  handle();
  onScroll(handle);
}

// 2) IntersectionObserver-based reveal animations
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (
            entry.target.classList.contains('providers-grid') ||
            entry.target.classList.contains('categories-grid') ||
            entry.target.classList.contains('stories-grid')
          ) {
            const items = entry.target.children;
            Array.from(items).forEach((item, index) => {
              setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
              }, index * 100);
            });
          }
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  const animatedElements = document.querySelectorAll(
    `.section-header, .provider-card, .step, .category-card, .story-card, .providers-grid, .categories-grid, .stories-grid`
  );

  animatedElements.forEach((el) => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  document.querySelectorAll('.provider-card, .category-card, .story-card').forEach((item) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(30px)';
      item.style.transition = 'all 0.6s ease-out';
    });
}

// 3) Search functionality on the homepage (Updated)
function initSearchFunctionality() {
  const searchBtn = document.querySelector('.search-btn');
  const searchInput = document.querySelector('.search-input');
  const locationInput = document.querySelector('.location-input');
  const popularTags = document.querySelectorAll('.tag');

  if (!searchBtn || !searchInput) return;

  const performSearch = () => {
    const term = searchInput.value.trim();
    const loc = (locationInput?.value || '').trim();
    
    // Redirect to the all-services page with query parameters
    window.location.href = `all-services.html?q=${encodeURIComponent(term)}&loc=${encodeURIComponent(loc)}`;
  };

  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
  locationInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  popularTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      if (!searchInput) return;
      searchInput.value = tag.textContent.trim();
      performSearch();
    });
  });
}

// 4) Lazy loading images
function initLazyLoading() {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach((img) => imageObserver.observe(img));
}

// 5) Mobile menu / hamburger toggle
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
}

// 6) Theme Toggle
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        // Apply saved theme on page load
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            let theme = 'light';
            if (document.body.classList.contains('dark-mode')) {
                theme = 'dark';
                themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
            } else {
                themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
            }
            localStorage.setItem('theme', theme);
        });
    }
}

// 7) Language Switcher to prompt browser translation
function initLanguageSwitcher() {
    const langButton = document.querySelector('.language-btn');
    const langDropdown = document.querySelector('.language-dropdown');
    const chevronIcon = langButton?.querySelector('.chevron-icon');
    const currentLangSpan = document.getElementById('current-lang');
    const langOptions = document.querySelectorAll('.language-option');

    if (!langButton || !langDropdown) return;

    // Toggle dropdown
    langButton.addEventListener('click', (event) => {
        event.stopPropagation();
        langDropdown.classList.toggle('active');
        chevronIcon?.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    window.addEventListener('click', () => {
        langDropdown.classList.remove('active');
        chevronIcon?.classList.remove('active');
    });

    // Handle language selection
    langOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const langCode = this.dataset.lang;
            const langShort = this.textContent.match(/\(([^)]+)\)/)[1];
            
            document.documentElement.lang = langCode;
            
            if (currentLangSpan) currentLangSpan.textContent = langShort;
            localStorage.setItem('preferredLanguage', langCode);
            localStorage.setItem('preferredLanguageShort', langShort);

            langDropdown.classList.remove('active');
            chevronIcon?.classList.remove('active');
            
            console.log(`Page language set to '${langCode}'. Your browser should now offer to translate if your browser's language is different.`);
        });
    });

    // On page load, apply the saved language preference
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
        document.documentElement.lang = savedLang;
        const savedLangShort = localStorage.getItem('preferredLanguageShort');
        if (savedLangShort && currentLangSpan) {
            currentLangSpan.textContent = savedLangShort;
        }
    } else {
        document.documentElement.lang = 'en';
    }
}

// Init all once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initNavbar();
    initScrollAnimations();
    initSearchFunctionality();
    initLazyLoading();
    initThemeToggle();
    initLanguageSwitcher();
});