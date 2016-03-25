'use strict';

define([],
    function() {

        function Identity(name, appDelegate) {
            this.appDelegate = appDelegate;
            this.name = name;
        }

        Identity.prototype.isLocalWalletDataReady = function() {
            return this.appDelegate != null && this.appDelegate.walletDecrypted == true;
        };

        return Identity;
    });
