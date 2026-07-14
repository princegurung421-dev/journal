/**
 * Timezone-based location indicator.
 *
 * Instead of the Geolocation API (which triggers a permission pop-up and needs
 * a network call to reverse-geocode), this reads the device's IANA time zone
 * via the Intl API. It is instant, private, works fully offline, and never
 * prompts the user. Example output:  "Kathmandu · GMT+5:45"
 */
(function () {
  const el = document.getElementById('locations');
  if (!el) return;

  try {
    const now = new Date();

    // IANA zone, e.g. "Asia/Kathmandu" or "Australia/Perth"
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const city = zone
      ? zone.split('/').pop().replace(/_/g, ' ')
      : 'Local time';

    // GMT offset, e.g. "GMT+5:45"
    const offsetMin = -now.getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMin);
    const hours = Math.floor(abs / 60);
    const mins = abs % 60;
    const offset = `GMT${sign}${hours}${mins ? ':' + String(mins).padStart(2, '0') : ''}`;

    el.innerHTML = `<strong><i class="fas fa-location-dot"></i> ${city}</strong> &middot; ${offset}`;
  } catch (e) {
    // Never break the page if Intl is unavailable
    el.textContent = '';
  }
})();
