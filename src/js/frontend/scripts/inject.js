'use strict';

/*
 * We don't use registerProtocolHandler() because we have to declare web accessible
 * resources, and that exposes to the web that the user is using that extension.
 *
 * Instead, we listen the click event on links that have bitcoin uris.
 */

var isBitcoinUri = function(uri) {
  if (!chrome.runtime) {
    return false;
  }
  if (typeof uri != 'string') {
    return false;
  }
  if (uri.indexOf('bitcoin:') == 0) {
    return true;
  }
  return false;
};

if (document.body) {
  document.body.addEventListener('click', function(e) {
    var elem = e.target;
    while (elem && elem.tagName != 'A') {
      elem = elem.parentNode;
    }
    if (elem && elem.tagName == 'A' && isBitcoinUri(elem.href)) {
      chrome.runtime.sendMessage({ type: 'handleBitcoinURI', url: elem.href });
      e.preventDefault();
    }
  }, false);
}
