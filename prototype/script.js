(function () {
  'use strict';

  // Mobile nav toggle
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Accessible FAQ accordion (single-open)
  var triggers = document.querySelectorAll('.accordion-trigger');
  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));

      triggers.forEach(function (other) {
        if (other !== trigger) {
          other.setAttribute('aria-expanded', 'false');
          var otherPanel = document.getElementById(other.getAttribute('aria-controls'));
          if (otherPanel) otherPanel.hidden = true;
        }
      });

      trigger.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });

  // Always open a page at the top (unless a link points to a section)
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function toTop() {
    if (location.hash && location.hash.length > 1) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
  toTop();
  window.addEventListener('load', toTop);
  window.addEventListener('pageshow', toTop);
  setTimeout(toTop, 150);

  // Photos: load each data-photo-src if the file exists, otherwise keep the placeholder
  document.querySelectorAll('[data-photo-src]').forEach(function (el) {
    var src = el.getAttribute('data-photo-src');
    var img = new Image();
    img.onload = function () {
      if (el.classList.contains('photo-placeholder')) {
        var photo = document.createElement('img');
        photo.src = src;
        photo.alt = el.getAttribute('data-photo-alt') || '';
        el.innerHTML = '';
        el.appendChild(photo);
        el.classList.add('has-photo');
        el.removeAttribute('role');
        el.removeAttribute('aria-label');
      } else {
        el.style.setProperty('--photo', 'url("' + src + '")');
      }
      el.classList.remove('photo-slot');
    };
    img.src = src;
  });

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
