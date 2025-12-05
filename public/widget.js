/**
 * TryStyle Chat Widget Embed Script
 * 
 * Простое использование (все уже настроено):
 * <script src="https://trystyle.live/widget.js"></script>
 * <div id="trystyle-widget"></div>
 * 
 * Или с кастомными настройками:
 * <script>
 *   window.TryStyleWidget = {
 *     containerId: 'trystyle-widget',
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
    containerId: 'trystyle-widget',
    width: '400px',
    height: '600px',
    url: 'https://trystyle.live/widget',
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  // Get configuration from window object or use defaults
  const config = window.TryStyleWidget || {};
  const finalConfig = {
    containerId: config.containerId || defaults.containerId,
    width: config.width || defaults.width,
    height: config.height || defaults.height,
    url: config.url || defaults.url,
    border: config.border !== undefined ? config.border : defaults.border,
    borderRadius: config.borderRadius || defaults.borderRadius,
    boxShadow: config.boxShadow || defaults.boxShadow
  };

  // Find container element
  const container = document.getElementById(finalConfig.containerId);
  
  if (!container) {
    console.error('TryStyle Widget: Container element with id "' + finalConfig.containerId + '" not found.');
    return;
  }

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.src = finalConfig.url;
  iframe.width = finalConfig.width;
  iframe.height = finalConfig.height;
  iframe.style.border = finalConfig.border;
  iframe.style.borderRadius = finalConfig.borderRadius;
  iframe.style.boxShadow = finalConfig.boxShadow;
  iframe.style.display = 'block';
  iframe.style.overflow = 'hidden';
  iframe.setAttribute('allow', 'camera; microphone');
  iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox');
  iframe.setAttribute('title', 'TryStyle Chat Widget');

  // Append iframe to container
  container.appendChild(iframe);

  // Optional: Handle responsive sizing
  if (config.responsive !== false) {
    // Make iframe responsive if container has responsive classes
    if (container.classList.contains('responsive') || config.responsive === true) {
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.minHeight = finalConfig.height;
    }
  }

  // Expose API for programmatic control
  window.TryStyleWidgetAPI = {
    reload: function() {
      iframe.src = iframe.src;
    },
    setSize: function(width, height) {
      iframe.width = width;
      iframe.height = height;
    },
    getIframe: function() {
      return iframe;
    }
  };

  console.log('TryStyle Widget loaded successfully');
})();

