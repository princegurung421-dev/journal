(async function(){
  const el = document.getElementById('locations');
  if (!el) return;
  el.textContent = 'Locating...';

  const CACHE_KEY = 'pj_location_cache';
  const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.ts) return null;
      if ((Date.now() - obj.ts) > CACHE_TTL_MS) {
        // expired
        try { localStorage.removeItem(CACHE_KEY); } catch (e) {}
        return null;
      }
      return obj;
    } catch (e) {
      console.warn('Could not read location cache', e);
      return null;
    }
  }

  function writeCache(obj) {
    try {
      const toStore = Object.assign({}, obj, { ts: Date.now() });
      localStorage.setItem(CACHE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.warn('Could not write location cache', e);
    }
  }

  function setLocation(text) {
    el.innerHTML = `<strong>${text}</strong>`;
  }

  // Try browser geolocation first (more accurate) with a timeout
  function getGeolocation(timeout = 8000) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      let done = false;
      const timer = setTimeout(() => {
        if (done) return;
        done = true;
        reject(new Error('Geolocation timeout'));
      }, timeout);
      navigator.geolocation.getCurrentPosition(pos => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(pos.coords);
      }, err => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        reject(err);
      }, { enableHighAccuracy: false, maximumAge: 60000, timeout });
    });
  }

  // Reverse-geocode coordinates to a human-readable place using Nominatim
  async function reverseGeocode(lat, lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
      const resp = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      if (!resp.ok) return null;
      const data = await resp.json();
      const a = data.address || {};
      const cityLike = a.city || a.town || a.village || a.hamlet || a.municipality || a.county || a.state;
      const country = a.country;
      if (cityLike && country) return `${cityLike}, ${country}`;
      if (country) return country;
      if (data.display_name) return data.display_name.split(',').slice(0,3).join(', ');
      return null;
    } catch (e) {
      console.error('Reverse geocode error', e);
      return null;
    }
  }

  // Fallback to IP-based geolocation if navigator.geolocation fails/denied
  async function ipFallback() {
    try {
      const resp = await fetch('https://ipapi.co/json/');
      if (!resp.ok) return null;
      const data = await resp.json();
      let place = null;
      if (data.city && data.country_name) {
        place = `${data.city}, ${data.country_name}`;
      } else if (data.region && data.country_name) {
        place = `${data.region}, ${data.country_name}`;
      }
      const lat = data.latitude || data.lat || null;
      const lon = data.longitude || data.lon || null;
      const result = {};
      if (place) result.place = place;
      if (lat && lon) {
        result.lat = Number(lat);
        result.lon = Number(lon);
      }
      if (!result.place && (result.lat == null || result.lon == null)) return null;
      return result;
    } catch (e) {
      console.error('IP fallback error', e);
      return null;
    }
  }

  try {
    // Check cache first
    const cached = readCache();
    if (cached) {
      if (cached.place) {
        setLocation(cached.place);
        return;
      }
      if (cached.lat != null && cached.lon != null) {
        const placeName = await reverseGeocode(cached.lat, cached.lon);
        if (placeName) {
          setLocation(placeName);
          writeCache({ place: placeName, lat: cached.lat, lon: cached.lon });
          return;
        }
        const coordText = `${cached.lat.toFixed(5)}, ${cached.lon.toFixed(5)}`;
        setLocation(coordText);
        writeCache({ place: coordText, lat: cached.lat, lon: cached.lon });
        return;
      }
    }

    // First try precise browser geolocation
    try {
      const coords = await getGeolocation();
      const place = await reverseGeocode(coords.latitude, coords.longitude);
      if (place) {
        setLocation(place);
        writeCache({ place, lat: coords.latitude, lon: coords.longitude });
        return;
      }
      const coordText = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
      setLocation(coordText);
      writeCache({ place: coordText, lat: coords.latitude, lon: coords.longitude });
      return;
    } catch (geoErr) {
      console.warn('Geolocation failed, falling back to IP lookup:', geoErr);
      const ipInfo = await ipFallback();
      if (ipInfo) {
        if (ipInfo.place) {
          setLocation(ipInfo.place);
          writeCache({ place: ipInfo.place, lat: ipInfo.lat, lon: ipInfo.lon });
          return;
        }
        if (ipInfo.lat != null && ipInfo.lon != null) {
          const placeName = await reverseGeocode(ipInfo.lat, ipInfo.lon);
          if (placeName) {
            setLocation(placeName);
            writeCache({ place: placeName, lat: ipInfo.lat, lon: ipInfo.lon });
            return;
          }
          const coordText = `${ipInfo.lat.toFixed(5)}, ${ipInfo.lon.toFixed(5)}`;
          setLocation(coordText);
          writeCache({ place: coordText, lat: ipInfo.lat, lon: ipInfo.lon });
          return;
        }
      }
      setLocation('Location not available');
    }
  } catch (err) {
    console.error('Location error', err);
    setLocation('Location not available');
  }
})();
