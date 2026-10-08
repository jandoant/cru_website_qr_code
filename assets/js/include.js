/* ==========================================================================
   HTML includes
   Replaces every <div data-include="path/to/file.html"></div> with the
   contents of that file, so reusable blocks can live in /components.

   Usage:
     <div data-include="components/promo-gewinnspiel.html"></div>

   Safety: some hosts answer a missing file with their start page (status 200).
   A response that is a whole HTML document is therefore rejected, and scripts
   inside a component are never executed – otherwise the page could end up
   inserting itself again and again.

   Note: fetch() does not work when the page is opened as a local file
   (file://). Test with a local server, e.g. `python3 -m http.server`.
   ========================================================================== */

(function () {
  'use strict';

  var FULL_DOCUMENT = /<!doctype|<html[\s>]|<head[\s>]|<body[\s>]/i;

  function include(placeholder) {
    var url = placeholder.getAttribute('data-include');

    // Mark as handled right away so a placeholder is never processed twice
    placeholder.removeAttribute('data-include');

    return fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error(response.status + ' ' + response.statusText);
        }
        return response.text();
      })
      .then(function (html) {
        if (FULL_DOCUMENT.test(html)) {
          throw new Error('server returned a whole page instead of the component');
        }

        // <template> parses the markup without running any scripts in it
        var template = document.createElement('template');
        template.innerHTML = html;

        var scripts = template.content.querySelectorAll('script');
        Array.prototype.forEach.call(scripts, function (script) {
          script.remove();
        });

        placeholder.replaceWith(template.content);
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
