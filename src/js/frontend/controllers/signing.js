'use strict';

define(['./module', 'arcbit', 'bitcoinjs-lib', 'model/TLBitcoinJSWrapper'], function (controllers, ArcBit, Bitcoin, TLBitcoinJSWrapper) {

    // Controller
    controllers.controller('SigningCtrl', ['$scope', 'notify', 'modals', '_Filter', function($scope, notify, modals, _) {

        /**
         * Verify a signature
         */

        $scope.verifyText = function() {
            var identity = ArcBit.getIdentity();
            var address = $scope.tools.verifyAddress;
            var sigText = $scope.tools.verifySig;
            var text = $scope.tools.verifyText;

            if (sigText == null) {
                notify.warning(_('Missing signature'));
                return;
            }
            if (!address || !TLBitcoinJSWrapper.isValidAddress(address, identity.appDelegate.appWallet.isTestnet())) {
                notify.warning(_('Invalid address'));
                return;
            }

            try {
                if (TLBitcoinJSWrapper.verifySignature(address, sigText, text)) {
                    notify.success(_('Signature ok'));
                } else {
                    notify.warning(_('Invalid signature'));
                }
            } catch(err) {
                notify.warning(_('Invalid signature'));
            }
            $scope.tools.output = '';
            $scope.verifyOpen = false;
            $scope.tools.open = false;
        };

        /**
         * Sign the given text
         */
        $scope.signText = function() {
            var identity = ArcBit.getIdentity();
            modals.promptSignMessage(true, null, function(vars) {
                if (vars.key != null && TLBitcoinJSWrapper.isValidPrivateKey(vars.key)) {
                    vars.addr = TLBitcoinJSWrapper.getAddress(vars.key, identity.appDelegate.appWallet.isTestnet());
                } else {
                    vars.addr = null;
                }
            }, function() {
            }, function(reason, vars) {
                if (reason == 'dont_dismiss') {
                    if (vars.msg == null) {
                        notify.warning(_('Missing message'));
                        return;
                    }
                    if (vars.key == null || !TLBitcoinJSWrapper.isValidPrivateKey(vars.key)) {
                        notify.warning(_('Invalid Private Key'));
                        return;
                    }
                    vars.addr = TLBitcoinJSWrapper.getAddress(vars.key, identity.appDelegate.appWallet.isTestnet());
                    vars.sig = TLBitcoinJSWrapper.getSignatureFromKey(vars.key, vars.msg);
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
            });

        }

    }]);
});
