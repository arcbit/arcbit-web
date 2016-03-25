'use strict';

define(['./module'], function (providers) {

    providers.factory('modals', ['$window', 'notify', 'sounds', '$templateCache', '$http', '$timeout', '_Filter', function($window, notify, sounds, $templateCache, $http, $timeout, _) {

        var modals = {

            page: false,
            /**
             * Opens a modal
             *
             * @param {string} tplName Name of the template to be loaded
             * @param {object} vars Key-value pairs object that passes parameters from main
             * scope to the modal one. You can get the variables in the modal accessing to
             * `$scope.vars` variable.
             * @param {function} okCallback Function called when clicked on Ok button. The
             * first parameter is the data returned by the modal and the second one the vars
             * parameter passed to this function.
             * @param {function} cancelCallback Function called when modal is cancelled. The
             * first parameter is the reason because the modal has been cancelled and the
             * second one the vars parameter passed to this function.
             */
            open: function(tplName, vars, okCallback, cancelCallback) {
                var tplUrl = 'modals/'+tplName+'.html';
                var finish = function() {
                    modals.page = tplUrl;
                    modals.vars = vars;
                    modals.okCallback = okCallback;
                    modals.cancelCallback = cancelCallback;
                    modals.show = true;
                };
                if ($templateCache.get(tplUrl)) {
                    finish();
                } else {
                    $http.get(tplUrl, {cache:$templateCache}).success(function() {finish();});
                }
            },

            cancel: function(reason) {
                if (modals.spinnerShowing) modals.spinnerShowing = false;
                if (reason != 'dont_dismiss') modals.show = false;
                if (modals.cancelCallback) {
                    modals.cancelCallback(reason, modals.vars);
                }
            },

            checkKeyDown: function(evt) {
                if (modals.show && evt.keyCode === 27) {
                    modals.cancel();
                }
            },

            focus: function(id) {
                $timeout(function() {
                    var elmt = document.getElementById(id);
                    elmt.focus();
                });
            },

            onQrCancel: function(data) {
                if (data && data.name === 'PermissionDeniedError') {
                    notify.error(_('Your camera is disabled'));
                }
            },

            scanQr: function(callback) {
                modals.open('scan-qr', {}, callback, modals.onQrCancel);
            },

            showQr: function(value) {
                if (typeof value !== "object" || value === null) {
                    value = {value: value};
                }
                modals.open('show-qr', value);
            },

            showBtcQr: function(value) {
                if (typeof value !== "object" || value === null) {
                    value = {value: value};
                }
                value.btc = true;
                modals.showQr(value, value);
            },

            password: function(text, callback, cancelCallback) {
                modals.open('ask-password', {text: text, password: ''}, callback, cancelCallback);
            },

            promptForOKCancel: function(title, description, okText, cancelText, callback, cancelCallback) {
                modals.open('prompt-ok-cancel', {title: title, description: description, okText: okText, cancelText: cancelText}, callback, cancelCallback);
            },

            promptForOK: function(title, description, okText, callback, cancelCallback) {
                modals.open('prompt-ok', {title: title, description: description, okText: okText}, callback, cancelCallback);
            },

            promptForTextArea: function(title, description, textData, okText, callback, cancelCallback) {
                modals.open('prompt-text-area', {title: title, description: description, textData: textData, okText: okText}, callback, cancelCallback);
            },

            promptForInput: function(title, description, placeholder, callback, cancelCallback) {
                modals.open('prompt-for-input', {title: title, description: description, placeholder: placeholder}, callback, cancelCallback);
            },

            promptSignMessage: function(isInputPrivateKey, addr, inputPrivateKeyChangeCallback, callback, cancelCallback) {
                modals.open('prompt-sign-msg', {addr: addr, isInputPrivateKey:isInputPrivateKey,
                    inputPrivateKeyChangeCallback: inputPrivateKeyChangeCallback, key: null, msg: null, sig: null}, callback, cancelCallback);
            },

            showSpinner: function(desc) {
                modals.spinnerShowing = true;
                modals.open('prompt-spinner', {desc: desc});
            },

            paymentReview: function(tos, bitcoinCode, currencyCode, feeAmount, showTxHexButton, callback, cancelCallback) {
                modals.open('payment-review', {tos: tos, bitcoinCode: bitcoinCode, currencyCode: currencyCode, feeAmount: feeAmount,
                    showTxHexButton: showTxHexButton, showTxHex: false, txHex: null}, callback, cancelCallback);
            }
        };
        return modals;
    }]);
});
