/*
 * @fileOverview Background service running for the wallet
 */
'use strict';

define(['model/keyring', 'backend/port'],
function(IdentityKeyRing, Port) {

  function WalletService(core) {
    var keyRing = new IdentityKeyRing();
      var currentIdentity = false;
    this.name = 'wallet';

      var walletTabId;
      chrome.extension.onMessage.addListener(
          function(message, sender) {
              if (message.type == 'getTabId') {
                  walletTabId = sender.tab.id;
              }

          }
      );
      chrome.runtime.onMessage.addListener(function(data) {
          if (data.type == 'handleBitcoinURI') {
              chrome.tabs.query({active: true}, function() {
                  var identity = self.getIdentity();
                  if (identity && identity.appDelegate) {
                      identity.appDelegate.postEvent('wallet', {'type': 'bitcoinuri', 'url': data.url});
                  }
              });
          }
      });

      var self = this;
      // close socket when close tab
      chrome.tabs.onRemoved.addListener(function (tabId) {
          if (tabId == walletTabId) {
              //alert(tabId);
              var identity = self.getIdentity();
              if (identity && identity.appDelegate) {
                  identity.appDelegate.bitcoinListener.closeDontReopen();
                  identity.appDelegate.stealthWebSocket.closeDontReopen();
              }
          }
      });


      // Wallet port
    Port.listen('wallet', function() {
      }, function(port) {
          // Client connected
          if (currentIdentity && keyRing.identities.hasOwnProperty(currentIdentity)) {
              port.postMessage({'type': 'ready', 'identity': currentIdentity});
          }
      }, function(port) {
          // Client disconnected
    });

    /***************************************
    /* Identities
     */

    var startIdentity = function(identity, callback) {
        currentIdentity = identity.name;

        Port.post('wallet', {'type': 'ready', 'identity': identity.name});
        Port.post('wallet', {'type': 'loaded', 'identity': identity.name});

        callback ? callback(identity) : null;
    };

    this.setCurrentIdentity = function(name) {
        currentIdentity = name;
    }

    this.createIdentityWithEncryptedWalletJSON = function(name, walletObj, callback) {
        if (currentIdentity) {
            Port.post('wallet', {'type': 'closing', 'identity': currentIdentity});
        }
        var identity = keyRing.createIdentityWithEncryptedWalletJSON(name, walletObj);
        startIdentity(identity, callback);
    };

    this.createIdentity = function(name, network, mnemonic, recoverFromMnemonic, successCallback, errorCallback) {
        if (currentIdentity) {
            Port.post('wallet', {'type': 'closing', 'identity': currentIdentity});
        }
        keyRing.createIdentity(name, network, mnemonic, recoverFromMnemonic, function(identity) {
            startIdentity(identity, successCallback);
        }, errorCallback);
    };

    this.renameIdentity = function(newName, callback) {
        var identity = core.getCurrentIdentity();
        var oldName = currentIdentity;
        // Need to set this here since it won't be got automatically from the store change.
        identity.name = newName;
        keyRing.rename(oldName, newName, function() {
            currentIdentity = newName;
            Port.post('wallet', {'type': 'rename', 'oldName': oldName, 'newName': newName});
            callback ? callback() : null;
        });
    };

      this.loadIdentityFromJSON = function(name, walletObj, callback) {
          Port.post('wallet', {'type': 'closing', 'identity': currentIdentity});
          keyRing.loadWalletObj(name, walletObj, function(identity) {
              startIdentity(identity, callback);
          });
      };

    this.loadIdentity = function(idx, callback) {
        var name = keyRing.availableIdentities[idx];
        if (currentIdentity !== name) {
            Port.post('wallet', {'type': 'closing', 'identity': currentIdentity});
            keyRing.get(name, function(identity) {
                startIdentity(identity, callback);
            });
        }
    };

    // Get an identity from the keyring
    this.getIdentity = function(idx) {
        if (idx === null || idx === undefined) {
            return self.getCurrentIdentity();
        }
        var name = keyRing.availableIdentities[idx];
        currentIdentity = name;
        return keyRing.identities[name];
    };

    this.getCurrentIdentity = function() {
        return keyRing.identities[currentIdentity];
    };

    this.getKeyRing = function() {
        return keyRing;
    };
  }
  return WalletService;
});

