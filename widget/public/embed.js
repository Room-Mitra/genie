(function () {
  // Minimal, idempotent bootloader for Room Mitra widget
  if (window.RoomMitraWidgetBootloader) return;
  window.RoomMitraWidgetBootloader = true;

  // Default config (can override via data-* attributes)
  const scriptTag = document.currentScript || document.querySelector('script[src*="embed.js"]');
  const data = (scriptTag && scriptTag.dataset) || {};

  const HOTEL_ID = data.hotelId || data.hotelId || '';
  const THEME = data.theme ? JSON.parse(decodeURIComponent(data.theme)) : null;
  const POSITION = data.position || 'bottom-right';
  const WIDGET_URL =
    (data.widgetUrl || 'http://localhost:3001' + '/widget') +
    `?hotelId=${encodeURIComponent(HOTEL_ID)}`;

  // Create minimized launcher
  const launcher = document.createElement('button');
  launcher.setAttribute('aria-label', 'Open Room Mitra Voice Agent');
  launcher.style.position = 'fixed';
  launcher.style.zIndex = 2147483647;
  launcher.style.width = '56px';
  launcher.style.height = '56px';
  launcher.style.borderRadius = '50%';
  launcher.style.border = 'none';
  launcher.style.cursor = 'pointer';
  launcher.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';
  launcher.style.background = THEME && THEME.primary ? THEME.primary : '#0ea5a4';
  launcher.style.display = 'flex';
  launcher.style.alignItems = 'center';
  launcher.style.justifyContent = 'center';
  launcher.style.color = '#fff';
  launcher.innerText = 'RM';

  // position
  if (POSITION === 'bottom-left') {
    launcher.style.left = '20px';
    launcher.style.bottom = '20px';
  } else {
    launcher.style.right = '20px';
    launcher.style.bottom = '20px';
  }

  document.body.appendChild(launcher);

  // Hold iframe
  let iframe = null;

  function closeWidget() {
    if (iframe) {
      iframe.style.display = 'none';
    }
    open = false;
  }

  function openWidget() {
    if (iframe) {
      iframe.style.display = 'block';
      open = true;
      return;
    }

    iframe = document.createElement('iframe');
    iframe.src = WIDGET_URL;
    iframe.style.position = 'fixed';
    iframe.style.zIndex = 2147483646;
    iframe.style.width = '420px';
    iframe.style.height = '600px';
    iframe.style.border = '0';
    iframe.style.borderRadius = '12px';
    iframe.style.boxShadow = '0 12px 40px rgba(2,6,23,0.6)';
    iframe.style.background = '#fff';
    iframe.allow = 'microphone; autoplay';
    // sandbox as needed: allow-scripts and allow-same-origin required for most widgets
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');

    // position near launcher (bottom-right or bottom-left)
    if (POSITION === 'bottom-left') {
      iframe.style.left = '20px';
      iframe.style.bottom = '86px';
    } else {
      iframe.style.right = '20px';
      iframe.style.bottom = '86px';
    }

    document.body.appendChild(iframe);

    // Post init config to iframe (we do this after a short delay to allow iframe to be ready)
    iframe.addEventListener('load', function () {
      const payload = { hotelId: HOTEL_ID, theme: THEME };
      iframe.contentWindow?.postMessage({ type: 'ROOMMITRA_INIT', payload }, '*');
    });
  }

  // toggle open/close
  let open = false;
  launcher.addEventListener('click', function () {
    if (!open) {
      openWidget();
      open = true;
    } else {
      if (iframe) {
        const nowHidden = iframe.style.display !== 'none';
        iframe.style.display = nowHidden ? 'none' : 'block';
        open = !nowHidden;
      }
    }
  });

  // Listen for close requests from inside the iframe
  window.addEventListener('message', function (event) {
    const msg = event.data;
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'ROOMMITRA_CLOSE_WIDGET') {
      closeWidget();
    }
  });

  // provide API for host page devs
  window.RoomMitraWidget = {
    open: openWidget,
    close: closeWidget,
    post: function (msg) {
      if (iframe) iframe.contentWindow.postMessage(msg, '*');
    },
  };
})();
