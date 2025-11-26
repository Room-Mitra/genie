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

  // Room Mitra image lightbox in parent page
  const LIGHTBOX_ROOT_ID = 'room-mitra-image-lightbox-root';

  // Determine widget base URL
  let baseWidgetUrl = data.widgetUrl;

  if (!baseWidgetUrl) {
    const scriptSrc = scriptTag?.src || '';

    try {
      const url = new URL(scriptSrc, window.location.href);
      const host = url.hostname;

      // Handles widget.roommitra.com, widget-stage.roommitra.com, etc.
      if (host.endsWith('roommitra.com') && host.startsWith('widget')) {
        baseWidgetUrl = `${url.protocol}//${host}`;
      } else {
        // local/dev fallback
        baseWidgetUrl = 'http://localhost:3003';
      }
    } catch (e) {
      // If URL parsing fails, fall back to localhost
      baseWidgetUrl = 'http://localhost:3003';
    }
  }

  const WIDGET_URL = `${baseWidgetUrl}/widget?hotelId=${encodeURIComponent(HOTEL_ID)}`;

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
  launcher.style.background = THEME && THEME.primary ? THEME.primary : '#161032';
  launcher.style.display = 'flex';
  launcher.style.alignItems = 'center';
  launcher.style.justifyContent = 'center';
  launcher.style.color = '#fff';
  launcher.innerHTML = `
  <img 
    src="${baseWidgetUrl}/images/square-no-bg.svg"
    alt="Room Mitra"
    style="width: 60%; height: 60%; object-fit: contain; pointer-events: none;"
  />
  `;

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

  function ensureLightboxRoot() {
    let root = document.getElementById(LIGHTBOX_ROOT_ID);
    if (!root) {
      root = document.createElement('div');
      root.id = LIGHTBOX_ROOT_ID;
      document.body.appendChild(root);
    }
    return root;
  }

  function renderImageLightbox(items, startIndex) {
    const root = ensureLightboxRoot();
    root.innerHTML = '';

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '2147483647';
    overlay.style.background = 'rgba(0,0,0,0.8)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    let index = startIndex;

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.maxWidth = '900px';
    container.style.maxHeight = '90vh';
    container.style.margin = '0 16px';

    const imgEl = document.createElement('img');
    imgEl.style.maxHeight = '75vh';
    imgEl.style.width = '100%';
    imgEl.style.objectFit = 'contain';
    imgEl.style.borderRadius = '16px';
    imgEl.style.background = 'black';

    const captionEl = document.createElement('p');
    captionEl.style.marginTop = '10px';
    captionEl.style.textAlign = 'center';
    captionEl.style.fontSize = '12px';
    captionEl.style.color = '#fff';

    function showCurrent() {
      const item = items[index];
      imgEl.src = item.url;
      imgEl.alt = item.alt || item.caption || '';
      captionEl.textContent = item.caption || '';
    }

    // Close on background click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        root.innerHTML = '';
      }
    });

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '-14px';
    closeBtn.style.right = '-14px';
    closeBtn.style.width = '32px';
    closeBtn.style.height = '32px';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.background = 'rgba(0,0,0,0.85)';
    closeBtn.style.color = 'white';
    closeBtn.addEventListener('click', () => (root.innerHTML = ''));

    // Navigation
    if (items.length > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.textContent = '‹';
      prevBtn.style.position = 'absolute';
      prevBtn.style.left = '0';
      prevBtn.style.top = '50%';
      prevBtn.style.transform = 'translateY(-50%)';
      prevBtn.style.marginLeft = '10px';
      prevBtn.style.padding = '8px 12px';
      prevBtn.style.background = 'rgba(0,0,0,0.6)';
      prevBtn.style.color = '#fff';
      prevBtn.style.border = 'none';
      prevBtn.style.borderRadius = '50%';
      prevBtn.style.cursor = 'pointer';
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        index = (index - 1 + items.length) % items.length;
        showCurrent();
      });

      const nextBtn = document.createElement('button');
      nextBtn.textContent = '›';
      nextBtn.style.position = 'absolute';
      nextBtn.style.right = '0';
      nextBtn.style.top = '50%';
      nextBtn.style.transform = 'translateY(-50%)';
      nextBtn.style.marginRight = '10px';
      nextBtn.style.padding = '8px 12px';
      nextBtn.style.background = 'rgba(0,0,0,0.6)';
      nextBtn.style.color = '#fff';
      nextBtn.style.border = 'none';
      nextBtn.style.borderRadius = '50%';
      nextBtn.style.cursor = 'pointer';
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        index = (index + 1) % items.length;
        showCurrent();
      });

      container.appendChild(prevBtn);
      container.appendChild(nextBtn);
    }

    container.appendChild(closeBtn);
    container.appendChild(imgEl);
    container.appendChild(captionEl);
    overlay.appendChild(container);
    root.appendChild(overlay);

    showCurrent();
  }

  // Listen for lightbox messages from iframe
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.source === 'room-mitra-widget' && data.type === 'open_image_lightbox') {
      const { items, index } = data.payload || {};
      if (Array.isArray(items) && items.length) {
        renderImageLightbox(items, Math.max(0, Math.min(index, items.length - 1)));
      }
    }
  });
})();
