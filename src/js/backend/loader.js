/**
 * configure RequireJS
 * prefer named modules to long paths
 */
'use strict';

requirejs.config({
  baseUrl: '../js',
  paths: {
    'angular': '../vendors/angular/angular.min',
    'angular-animate': '../vendors/angular-animate/angular-animate.min',
    'angular-route': '../vendors/angular-route/angular-route.min',
    'mm.foundation': '../vendors/angular-foundation/mm-foundation-tpls.min',
    'angular-xeditable': '../vendors/angular-xeditable/dist/js/xeditable.min',
    'angular-translate': '../vendors/angular-translate/angular-translate.min',
    'angular-translate-loader-static-file': '../vendors/angular-translate-loader-static-files/angular-translate-loader-static-files.min',
    'ngProgress': "../vendors/ngprogress/build/ngProgress",
    'toaster': "../vendors/AngularJS-Toaster/toaster",
    'crypto-js': "../vendors/crypto-js/cryptojs",
    'identicon': "../vendors/identicon/identicon",
    'pnglib': "../vendors/identicon/pnglib",
    'qrcodejs': "../vendors/qrcodejs/qrcode",
    'jsqrcode': "../vendors/jsqrcode/jsqrcode",
    'async': "../vendors/async/lib/async",
    'big': "../vendors/big.js/big.min",
    'bip39': "../vendors/bip39/bip39",
    'spin': "../vendors/spin.js/spin.min",
    'angularSpinner': "../vendors/angular-spinner/angular-spinner.min",
    'socket-io': '../vendors/socket-io-client/socket.io',
    'angular-socket-io': '../vendors/angular-socket-io/socket.min',

    'bitcoinjs-lib': "../vendors/bitcoinjs-lib/bitcoinjs",
    'sjcl-real': "../vendors/sjcl/sjcl",

    'domReady': '../vendors/requirejs-domready/domReady',
    'sjcl': 'util/fixes',
    
    'available_languages': '../i18n/_index'
  },
  
  /**
   * for libs that either do not support AMD out of the box
   */
  shim: {
    'angular': {
      exports: 'angular'
    },
    'angular-animate': {
      deps: ['angular']
    },
    'angular-route': {
      deps: ['angular']
    },
    'mm.foundation': {
      deps: ['angular']
    },
    'angular-xeditable': {
      deps: ['angular']
    },
    'angular-translate': {
      deps: ['angular']
    },
    'angular-translate-loader-static-file': {
      deps: ['angular', 'angular-translate']
    },
    'ngProgress': {
      deps: ['angular']
    },
    'toaster': {
      deps: ['angular']
    },
    'socket-io': {
      exports: 'io'
    },
    'angular-socket-io': {
      deps: ['angular', 'socket-io']
    },
    'qrcodejs': {
      exports: 'QRCode'
    },
    'crypto-js': {
      exports: 'CryptoJS'
    },
    'jsqrcode': {
      exports: 'qrcode'
    },
    'arcbit': {
      exports: 'ArcBit'
    },
    'identicon': {
      deps: ['pnglib'],
      exports: 'Identicon'
    },
    'pnglib': {
      exports: 'PNGlib'
    },
    'sjcl-real': {
      exports: 'sjcl'
    }
  }
});
