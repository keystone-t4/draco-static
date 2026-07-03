(function () {
  'use strict';

  // ----- Footer year -----
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  // ----- Mobile menu -----
  var menu = document.querySelector('[data-mobile-menu]');
  var toggleBtn = document.querySelector('[data-nav-toggle]');
  var closeBtn = document.querySelector('[data-mobile-menu-close]');

  function openMenu() {
    if (!menu) return;
    menu.hidden = false;
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    if (!menu) return;
    menu.hidden = true;
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
  }
  if (toggleBtn) toggleBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  document.querySelectorAll('[data-mobile-menu-link]').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // ----- Nav shadow + scroll progress -----
  var nav = document.querySelector('[data-nav]');
  var progress = document.querySelector('[data-progress]');
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 30);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- Reveal on scroll -----
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var delay = parseFloat(entry.target.getAttribute('data-reveal-delay') || '0');
            entry.target.style.transitionDelay = delay + 'ms';
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ----- Contact form -----
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var errorBox = form.querySelector('[data-form-error]');
    var submitBtn = form.querySelector('[data-form-submit]');
    var submitLabel = form.querySelector('[data-form-submit-label]');
    var successBox = document.querySelector('[data-contact-success]');

    function showError(message) {
      if (!errorBox) return;
      errorBox.textContent = message;
      errorBox.hidden = false;
    }
    function hideError() {
      if (!errorBox) return;
      errorBox.hidden = true;
      errorBox.textContent = '';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideError();

      var data = new FormData(form);
      var name = String(data.get('name') || '').trim();
      var email = String(data.get('email') || '').trim();
      var message = String(data.get('message') || '').trim();

      if (!name || !email || !message) {
        showError('Please complete the required fields (name, email and message).');
        return;
      }

      var payload = {
        name: name,
        company: String(data.get('company') || '').trim(),
        email: email,
        country: String(data.get('country') || '').trim(),
        category: String(data.get('category') || '').trim(),
        message: message,
        website: String(data.get('website') || '').trim() // honeypot
      };

      submitBtn.disabled = true;
      var originalLabel = submitLabel ? submitLabel.textContent : '';
      if (submitLabel) submitLabel.textContent = 'Sending…';

      fetch('server/contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            return { ok: res.ok, body: body };
          });
        })
        .then(function (result) {
          if (result.ok && result.body && result.body.ok) {
            form.hidden = true;
            if (successBox) successBox.hidden = false;
          } else {
            showError((result.body && result.body.error) || 'Something went wrong. Please try again or email us directly.');
          }
        })
        .catch(function () {
          showError('Could not reach the server. Please check your connection or email us directly.');
        })
        .finally(function () {
          submitBtn.disabled = false;
          if (submitLabel) submitLabel.textContent = originalLabel;
        });
    });
  }
})();
