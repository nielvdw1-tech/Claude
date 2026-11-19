/* Shows the online booking calendar on book.html (link set in booking-config.js). */
(function () {
  'use strict';
  var url = window.VDW_BOOKING_URL;
  var box = document.getElementById('bookCalendar');
  if (!url || !box) return;
  var src = url;
  if (/calendly\.com/.test(url)) {
    src += (url.indexOf('?') < 0 ? '?' : '&') + 'hide_gdpr_banner=1&embed_type=Inline&embed_domain=' + encodeURIComponent(location.hostname);
  }
  box.innerHTML = '<iframe class="book-frame" src="' + src.replace(/"/g, '&quot;') + '" title="Choose a date and time for your consultation" loading="lazy"></iframe>' +
    '<p class="book-open">Calendar not showing? <a href="' + url.replace(/"/g, '&quot;') + '" target="_blank" rel="noopener">Open the booking calendar</a></p>';
})();
