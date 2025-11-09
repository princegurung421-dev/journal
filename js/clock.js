(function () {
  function safeGet(id) {
    try { return document.getElementById(id); } catch (e) { return null; }
  }

  function formatDate(now) {
    return now.toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function updateClock() {
    var now = new Date();
    var timeEl = safeGet('clockTime');
    var dateEl = safeGet('clockDate');
    if (timeEl) timeEl.textContent = now.toLocaleTimeString();
    if (dateEl) dateEl.textContent = formatDate(now);

    // If there's a week3 date placeholder, fill it once with the current date
    var week3 = safeGet('week3-date');
    if (week3 && !week3.dataset.set) {
      week3.textContent = formatDate(now);
      week3.dataset.set = '1';
    }
  }

  // First run
  updateClock();
  setInterval(updateClock, 1000);
})();
