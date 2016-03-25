'use strict';

define(['model/identity', 'model/TLWalletJson', 'model/TLAppDelegate',
        'model/TLGlobalSettings', 'model/TLExchangeRate', 'model/TLBlockExplorerAPI'],
    function(Identity, TLWalletJson, TLAppDelegate, TLGlobalSettings, TLExchangeRate, TLBlockExplorerAPI) {

        /**
         * Manage and serialize identities.
         * @constructor
         */
        function IdentityKeyRing() {
            this.identities = {};
            this.availableIdentities = [];
            this.loadIdentities();
            this.currentIdentityName = null;
            this.globalSettings = new TLGlobalSettings();
            this.globalSettings.loadGlobalSettings();
            this.exchangeRate = new TLExchangeRate();
            this.exchangeRate.getExchangeRates(function () {
            }, function () {
            });
        }


        IdentityKeyRing.prototype.get = function(name, callback) {
            if (this.identities[name]) {
                callback(this.identities[name]);
            } else if (this.availableIdentities.indexOf(name) != -1) {
                this.load(name, callback);
            } else {
                throw Error('Identity doesn\'t exist');
            }
        };

        /**
         * Delete an identity from the keyring
         * @param {String} name Identity identifier.
         * @param {Function} callback Callback providing results for the function.
         */
        IdentityKeyRing.prototype.remove = function(name, callback) {
            var self = this;
            var idx = this.availableIdentities.indexOf(name);
            if (idx == -1) {
                throw Error('The identity doesn\'t exist!');
            }
            // Close the identity
            if (this.identities[name]) {
                this.close(name);
            }

            TLWalletJson.deleteWalletJson(name, function(){
                self.availableIdentities.splice(idx, 1);
                callback ? callback() : null;
            });
        };


        /**
         * Get names for all identities available.
         * @return {String[]} List of the available identities.
         */
        IdentityKeyRing.prototype.getIdentityNames = function() {
            return this.availableIdentities;
        };

        /**
         * Release resources for an identity.
         * @param {String} name Identity identifier.
         */
        IdentityKeyRing.prototype.close = function(name) {
            delete this.identities[name];
        };

        IdentityKeyRing.prototype.rename = function(name, newName, callback) {
            var self = this;
            if (!this.identities[name]) {
                throw Error('Identity must be loaded to rename');
            }
            var oldIdx = this.availableIdentities.indexOf(name);
            // First save under the new name
            this.identities[newName] = this.identities[name];

            this.identities[newName].appDelegate.walletName = newName;
            this.currentIdentityName = newName;
            this.identities[newName].appDelegate.saveWalletNow(false, function() {
                self.globalSettings.setCurrentIdentityName(newName, function(){
                    self.remove(name, function() {
                        // Insert the new name in its old place
                        self.availableIdentities.splice(oldIdx, 0, newName);
                        callback ? callback() : null;
                    });
                });
            });
        };


        IdentityKeyRing.prototype.createIdentityWithEncryptedWalletJSON = function(name, walletObj) {
            var identity = new Identity(name, new TLAppDelegate(this.exchangeRate, name, walletObj, null));

            this.identities[name] = identity;
            if (this.availableIdentities.indexOf(name) == -1) {
                this.availableIdentities.push(name);
            }
            return identity;
        };


        IdentityKeyRing.prototype.createIdentity = function(name, network, mnemonic, isRecoverFromMnemonic, success, failure) {
            var identity = new Identity(name, new TLAppDelegate(this.exchangeRate, name, null, network=='testnet'));
            identity.appDelegate.saveWalletJSONEnabled = false;
            identity.appDelegate.initAppDelegate(mnemonic);
            var self = this;
            function completeCreateIdentity() {
                self.identities[name] = identity;
                if (self.availableIdentities.indexOf(name) == -1) {
                    self.availableIdentities.push(name);
                }
                success(identity);
            }
            if (isRecoverFromMnemonic) {
                identity.appDelegate.blockExplorerAPI = new TLBlockExplorerAPI(identity.appDelegate.preferences);
                if (this.identities[this.currentIdentityName]) {
                    var currentBlockExplorerAPI = this.identities[this.currentIdentityName].appDelegate.blockExplorerAPI.blockExplorerAPI;
                    var currentBlockExplorerURL = this.identities[this.currentIdentityName].appDelegate.blockExplorerAPI.blockExplorerURL;
                    // set api to current api in settings so users have choice in what api to use when restoring wallet
                    // will get set back to correct default api settings in the success callback of
                    identity.appDelegate.blockExplorerAPI.setUpAPI(currentBlockExplorerAPI, currentBlockExplorerURL);
                }
                identity.appDelegate.recoverHDWalletAndSave(mnemonic, function() {
                    identity.appDelegate.appWallet.setLoginPassword(mnemonic);
                    completeCreateIdentity();
                }, function() {
                    failure ? failure() : null;
                });
            } else {
                identity.appDelegate.appWallet.setLoginPassword(mnemonic);
                completeCreateIdentity();
            }
        };

        /**
         * Load a list of all available identities.
         * @param {Function} callback Callback providing results for the function.
         * @private
         */
        IdentityKeyRing.prototype.loadIdentities = function(callback) {
            var self = this;
            var _callback = callback;

            // See if we have cached list
            if (this.availableIdentities.length) {
                if (_callback) {
                    _callback(this.availableIdentities);
                }
                return;
            }
            chrome.storage.local.get(null, function(obj) {
                var keys = Object.keys(obj);
                for(var idx=0; idx<keys.length; idx++) {
                    if (keys[idx].substring(0, TLWalletJson.ARCBIT_NS.length) == TLWalletJson.ARCBIT_NS) {
                        var name = keys[idx].substring(TLWalletJson.ARCBIT_NS.length);
                        if (self.availableIdentities.indexOf(name) === -1) {
                            self.availableIdentities.push(name);
                        }
                    }
                }
                if (_callback) {
                    _callback(self.availableIdentities);
                }
            });
        };

        IdentityKeyRing.prototype.loadWalletObj = function(name, walletObj, callback) {
            var appDelegate = new TLAppDelegate(this.exchangeRate, name, walletObj, null);
            try {
                this.identities[name] = new Identity(name, appDelegate);
            } catch(e) {
                // show the inner exception
                console.log(e.stack);
                throw Error('Critical error loading identity');
            }
            if (callback) {
                callback(this.identities[name]);
            }
        };

        /**
         * Load an identity from database.
         * @param {String} name Identity identifier.
         * @param {Function} callback Callback providing results for the function.
         * @private
         */
        IdentityKeyRing.prototype.load = function(name, callback) {
            var self = this;
            TLWalletJson.getLocalWalletJSONFile(name, function (walletObj) {
                self.loadWalletObj(name, walletObj, callback);
            });
        };

        /*
         * Clear database (DANGEROUS!)
         */
        IdentityKeyRing.prototype.clear = function() {
            chrome.storage.local.clear();
            this.identities = {};
            this.availableIdentities = [];
        };

        return IdentityKeyRing;
    });
