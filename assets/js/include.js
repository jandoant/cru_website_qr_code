/* ==========================================================================
   HTML includes
   Replaces every <div data-include="path/to/file.html"></div> with the
   contents of that file, so reusable blocks can live in /components.

   Usage:
     <div data-include="components/promo-gewinnspiel.html"></div>

   Note: fetch() does not work when the page is opened as a local file
   (file://). Test with a local server, e.g. `python3 -m http.server`.
   ========================================================================== */

(function () {
  'use strict';

  function include(placeholder) {
    var url = placeholder.getAttribute('data-include');

    return fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error(response.status + ' ' + response.statusText);
        }
        return response.text();
      })
      .then(function (html) {
        // Swap the placeholder for the component's markup, keeping its position
        var range = document.createRange();
        range.selectNode(placeholder);
        placeholder.replaceWith(range.createContextualFragment(html));
      })
      .catch(function (error) {
        // Fail quietly for visitors; the rest of the page still works
        placeholder.remove();
        console.warn('Could not load component "' + url + '":', error);
      });
  }

  function init() {
    var placeholders = document.querySelectorAll('[data-include]');
    Array.prototype.forEach.call(placeholders, include);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
