(function () {
  // Minimal, idempotent bootloader for Web Voice Agent widget
  if (window.RoomMitraWebVoiceAgent) return;
  window.RoomMitraWebVoiceAgent = true;

  // Default config (can override via data-* attributes)
  const scriptTag =
    document.currentScript || document.querySelector('script[src*="web-voice-agent.js"]');
  const data = (scriptTag && scriptTag.dataset) || {};

  // Room Mitra image lightbox in parent page
  const LIGHTBOX_ROOT_ID = 'room-mitra-image-lightbox-root';
  let roomMitraPreviousBodyOverflow = null;

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
      console.error('unable to determine widget base url for web voice agent', e);
      // If URL parsing fails, fall back to localhost
      baseWidgetUrl = 'http://localhost:3003';
    }
  }

  const hotelId = data.hotelId || '';
  const signature = data.signature || '';
  const theme = data.theme ? JSON.parse(decodeURIComponent(data.theme)) : null;
  const logoUrl = data.logoUrl || `${baseWidgetUrl}/images/square-no-bg.svg`;
  const position = data.position || 'bottom-right';

  const params = {
    hotelId,
    signature,
    theme: data.theme || null,
    position,
  };

  const widgetUrl = `${baseWidgetUrl}/web-voice-agent?${Object.entries(params)
    .map((p) => `${p[0]}=${encodeURIComponent(p[1])}`)
    .join('&')}`;

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
  launcher.style.background = theme && theme.primary ? theme.primary : '#161032';
  launcher.style.display = 'flex';
  launcher.style.alignItems = 'center';
  launcher.style.justifyContent = 'center';
  launcher.style.color = '#fff';
  launcher.innerHTML = `
  <img 
    src="${logoUrl}"
    alt="Room Mitra"
    style="width: 60%; height: 60%; object-fit: contain; pointer-events: none;"
  />
  `;

  // position
  if (position === 'bottom-left') {
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
    iframe.src = widgetUrl;
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
    if (position === 'bottom-left') {
      iframe.style.left = '20px';
      iframe.style.bottom = '86px';
    } else {
      iframe.style.right = '20px';
      iframe.style.bottom = '86px';
    }

    document.body.appendChild(iframe);
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

    // Lock background scroll
    if (roomMitraPreviousBodyOverflow === null) {
      roomMitraPreviousBodyOverflow = document.body.style.overflow || '';
      document.body.style.overflow = 'hidden';
    }

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '2147483647';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.background = 'rgba(15,23,42,0.65)';
    overlay.style.backdropFilter = 'blur(12px)';
    overlay.style.webkitBackdropFilter = 'blur(12px)';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 150ms ease-out';

    let index = startIndex;
    let touchStartX = null;
    let touchStartY = null;

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.maxWidth = '900px';
    container.style.maxHeight = '90vh';
    container.style.margin = '0 16px';
    container.style.transform = 'scale(0.96)';
    container.style.transition = 'transform 150ms ease-out';

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
    captionEl.style.color = '#f5f5f5';

    function cleanup() {
      root.innerHTML = '';
      if (roomMitraPreviousBodyOverflow !== null) {
        document.body.style.overflow = roomMitraPreviousBodyOverflow;
        roomMitraPreviousBodyOverflow = null;
      }
      window.removeEventListener('keydown', onKeyDown);
    }

    function close() {
      overlay.style.opacity = '0';
      container.style.transform = 'scale(0.96)';
      setTimeout(cleanup, 160);
    }

    function showCurrent() {
      const item = items[index];
      imgEl.src = item.url;
      imgEl.alt = item.alt || item.caption || '';
      captionEl.textContent = item.caption || '';
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'ArrowLeft' && items.length > 1) {
        index = (index - 1 + items.length) % items.length;
        showCurrent();
      } else if (e.key === 'ArrowRight' && items.length > 1) {
        index = (index + 1) % items.length;
        showCurrent();
      }
    }

    window.addEventListener('keydown', onKeyDown);

    // Close on background click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        close();
      }
    });

    // Touch swipe support + prevent scroll bleed
    overlay.addEventListener(
      'touchstart',
      (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    overlay.addEventListener(
      'touchmove',
      (e) => {
        if (typeof e.cancelable !== 'boolean' || e.cancelable) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    overlay.addEventListener(
      'touchend',
      (e) => {
        if (touchStartX == null || touchStartY == null || !e.changedTouches?.length) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const minSwipe = 40;

        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe && items.length > 1) {
          if (dx > 0) {
            // swipe right → previous
            index = (index - 1 + items.length) % items.length;
          } else {
            // swipe left → next
            index = (index + 1) % items.length;
          }
          showCurrent();
        }

        touchStartX = null;
        touchStartY = null;
      },
      { passive: true }
    );

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
    closeBtn.style.background = 'rgba(15,23,42,0.9)';
    closeBtn.style.color = 'white';
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.fontSize = '16px';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });

    if (items.length > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.textContent = '‹';
      prevBtn.style.position = 'absolute';
      prevBtn.style.left = '0';
      prevBtn.style.top = '50%';
      prevBtn.style.transform = 'translateY(-50%)';
      prevBtn.style.marginLeft = '10px';
      prevBtn.style.padding = '8px 12px';
      prevBtn.style.background = 'rgba(15,23,42,0.85)';
      prevBtn.style.color = '#fff';
      prevBtn.style.border = 'none';
      prevBtn.style.borderRadius = '999px';
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
      nextBtn.style.background = 'rgba(15,23,42,0.85)';
      nextBtn.style.color = '#fff';
      nextBtn.style.border = 'none';
      nextBtn.style.borderRadius = '999px';
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

    // Smooth fade + scale-in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      container.style.transform = 'scale(1)';
    });
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
