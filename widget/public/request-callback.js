(function () {
  if (window.RoomMitraRequestCallbackLoaded) return;
  window.RoomMitraRequestCallbackLoaded = true;

  var scriptEl =
    document.currentScript || document.querySelector('script[src*="request-callback"]');

  if (!scriptEl) return;

  var hotelId = scriptEl.getAttribute('data-hotel-id') || 'UNKNOWN';

  // NEW: read theme colors + height
  var primaryColor = scriptEl.getAttribute('data-primary-color') || '';
  var cardBgColor = scriptEl.getAttribute('data-card-bg-color') || '';
  var iframeHeight = scriptEl.getAttribute('data-height') || ''; // <-- NEW

  var baseWidgetUrl = scriptEl.getAttribute('data-widget-url');
  if (!baseWidgetUrl) {
    var scriptSrc = scriptEl.getAttribute('src') || '';
    try {
      var url = new URL(scriptSrc, window.location.href);
      var host = url.hostname;

      if (host.endsWith('roommitra.com') && host.startsWith('widget')) {
        baseWidgetUrl = url.protocol + '//' + host;
      } else {
        baseWidgetUrl = 'http://localhost:3003';
      }
    } catch (e) {
      console.error('[RoomMitra] Unable to determine widget base url for request callback', e);
      baseWidgetUrl = 'http://localhost:3003';
    }
  }

  // NEW: append theme params
  var iframeSrc =
    baseWidgetUrl +
    '/request-callback?hotelId=' +
    encodeURIComponent(hotelId) +
    (primaryColor ? '&primary=' + encodeURIComponent(primaryColor) : '') +
    (cardBgColor ? '&cardBg=' + encodeURIComponent(cardBgColor) : '');

  var iframe = document.createElement('iframe');
  iframe.src = iframeSrc;
  iframe.width = '100%';

  if (iframeHeight) {
    // allow either "260" or "260px"
    if (!/px$/.test(iframeHeight)) {
      iframeHeight = iframeHeight + 'px';
    }
    iframe.style.height = iframeHeight;
  } else {
    iframe.style.height = '220px'; // default
  }

  iframe.style.border = '0';
  iframe.style.overflow = 'hidden';
  iframe.style.display = 'block';
  iframe.setAttribute('title', 'Request a call back');

  var anchor =
    document.querySelector('[data-roommitra-callback-anchor]') ||
    document.getElementById('roommitra-request-callback-root');

  if (anchor) {
    anchor.appendChild(iframe);
    return;
  }

  iframe.style.position = 'fixed';
  iframe.style.left = '16px';
  iframe.style.bottom = '16px';
  iframe.style.maxWidth = '360px';
  iframe.style.zIndex = '2147483646';

  document.body.appendChild(iframe);
})();
