/**
 * TryStyle Chat Widget Embed Script
 * 
 * Плавающий виджет в левом нижнем углу экрана
 * 
 * Простое использование (все уже настроено):
 * <script src="https://trystyle.live/widget.js"></script>
 * 
 * Или с кастомными настройками:
 * <script>
 *   window.TryStyleWidget = {
 *     width: '400px',
 *     height: '600px',
 *     url: 'https://trystyle.live/widget'  // Уже настроено, можно не указывать
 *   };
 * </script>
 * <script src="https://trystyle.live/widget.js"></script>
 */

(function() {
  'use strict';

  // Default configuration
  const defaults = {
    width: '400px',
    height: '600px',
    url: 'https://trystyle.live/widget',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    buttonSize: '60px',
    buttonOffset: '20px'
  };

  // Get configuration from window object or use defaults
  const config = window.TryStyleWidget || {};
  const finalConfig = {
    width: config.width || defaults.width,
    height: config.height || defaults.height,
    url: config.url || defaults.url,
    borderRadius: config.borderRadius || defaults.borderRadius,
    boxShadow: config.boxShadow || defaults.boxShadow,
    buttonSize: config.buttonSize || defaults.buttonSize,
    buttonOffset: config.buttonOffset || defaults.buttonOffset
  };

  // Create floating container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'trystyle-widget-container';
  widgetContainer.style.cssText = `
    position: fixed !important;
    bottom: ${finalConfig.buttonOffset} !important;
    left: ${finalConfig.buttonOffset} !important;
    z-index: 9999 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
    box-sizing: border-box !important;
  `;

  // Create open button (chat icon)
  const openButton = document.createElement('button');
  openButton.id = 'trystyle-widget-open-button';
  openButton.setAttribute('aria-label', 'Open TryStyle Chat');
  openButton.style.cssText = `
    width: ${finalConfig.buttonSize} !important;
    height: ${finalConfig.buttonSize} !important;
    border-radius: 50% !important;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    border: none !important;
    cursor: pointer !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: transform 0.2s ease, box-shadow 0.2s ease !important;
    padding: 0 !important;
    margin: 0 !important;
    outline: none !important;
    box-sizing: border-box !important;
  `;

  // Chat icon SVG
  const chatIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  chatIcon.setAttribute('width', '28');
  chatIcon.setAttribute('height', '28');
  chatIcon.setAttribute('viewBox', '0 0 24 24');
  chatIcon.setAttribute('fill', 'none');
  chatIcon.style.cssText = 'color: white !important;';
  
  const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path1.setAttribute('d', 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z');
  path1.setAttribute('fill', 'currentColor');
  
  chatIcon.appendChild(path1);
  openButton.appendChild(chatIcon);

  // Hover effect
  openButton.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.1)';
    this.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
  });
  
  openButton.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
    this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
  });

  // Create iframe container
  const iframeContainer = document.createElement('div');
  iframeContainer.id = 'trystyle-widget-iframe-container';
  iframeContainer.style.cssText = `
    width: ${finalConfig.width} !important;
    height: ${finalConfig.height} !important;
    border-radius: ${finalConfig.borderRadius} !important;
    box-shadow: ${finalConfig.boxShadow} !important;
    overflow: hidden !important;
    display: none !important;
    opacity: 0 !important;
    transform: scale(0.9) translateY(10px) !important;
    transition: opacity 0.3s ease, transform 0.3s ease !important;
    box-sizing: border-box !important;
    background: white !important;
  `;

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.src = finalConfig.url;
  iframe.width = '100%';
  iframe.height = '100%';
  iframe.style.cssText = `
    border: none !important;
    display: block !important;
    width: 100% !important;
    height: 100% !important;
    box-sizing: border-box !important;
  `;
  iframe.setAttribute('allow', 'camera; microphone');
  iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox');
  iframe.setAttribute('title', 'TryStyle Chat Widget');

  iframeContainer.appendChild(iframe);
  widgetContainer.appendChild(openButton);
  widgetContainer.appendChild(iframeContainer);
  document.body.appendChild(widgetContainer);

  // State management
  let isOpen = false;

  // Open widget function
  function openWidget() {
    if (isOpen) return;
    isOpen = true;
    
    // Hide button
    openButton.style.display = 'none';
    
    // Show iframe with animation
    iframeContainer.style.display = 'block';
    // Trigger reflow
    iframeContainer.offsetHeight;
    iframeContainer.style.opacity = '1';
    iframeContainer.style.transform = 'scale(1) translateY(0)';
  }

  // Close widget function
  function closeWidget() {
    if (!isOpen) return;
    isOpen = false;
    
    // Hide iframe with animation
    iframeContainer.style.opacity = '0';
    iframeContainer.style.transform = 'scale(0.9) translateY(10px)';
    
    setTimeout(function() {
      iframeContainer.style.display = 'none';
      // Show button
      openButton.style.display = 'flex';
    }, 300);
  }

  // Toggle widget function
  function toggleWidget() {
    if (isOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  }

  // Event listeners
  openButton.addEventListener('click', openWidget);

  // Listen for postMessage from iframe to close widget
  window.addEventListener('message', function(event) {
    // Security: in production, check event.origin
    if (event.data && event.data.type === 'close-widget') {
      closeWidget();
    }
  });

  // Expose API for programmatic control
  window.TryStyleWidgetAPI = {
    open: openWidget,
    close: closeWidget,
    toggle: toggleWidget,
    reload: function() {
      iframe.src = iframe.src;
    },
    setSize: function(width, height) {
      iframeContainer.style.width = width;
      iframeContainer.style.height = height;
    },
    getIframe: function() {
      return iframe;
    },
    isOpen: function() {
      return isOpen;
    }
  };

  console.log('TryStyle Widget loaded successfully');
})();




