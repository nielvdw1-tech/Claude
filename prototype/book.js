/* Shows the online booking calendar on book.html (link set in booking-config.js). */
(function () {
  'use strict';
  var url = window.VDW_BOOKING_URL;
  var box = document.getElementById('bookCalendar');
  if (!url || !box) return;
  var src = url;
  if (/calendly\.com/.test(url)) {
    src += (url.indexOf('?') < 0 ? '?' : '&') + 'hide_gdpr_banner=1&embed_type=Inline&embed_domain=' + encodeURIComponent(location.hostname || 'vdwsafety.com');
  }
  // Calendly shows the calendar and time slots side by side when it has room, and stacks them on phones
  function frameHeight() { return window.innerWidth < 700 ? 1100 : 760; }
  var frame = document.createElement('iframe');
  frame.className = 'book-frame';
  frame.src = src;
  frame.title = 'Choose a date and time for your consultation';
  frame.setAttribute('width', '100%');
  frame.style.cssText = 'display:block;width:100%;min-width:100%;border:0;height:' + frameHeight() + 'px;';
  box.innerHTML = '';
  box.style.padding = '0';
  box.appendChild(frame);
  var help = document.createElement('p');
  help.className = 'book-open';
  help.innerHTML = 'Calendar not showing? <a href="' + url.replace(/"/g, '&quot;') + '" target="_blank" rel="noopener">Open the booking calendar</a>';
  box.appendChild(help);
  window.addEventListener('resize', function () { frame.style.height = frameHeight() + 'px'; });
})();
