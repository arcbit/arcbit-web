'use strict';

define(['model/TLCrypto', 'model/TLUtils', 'model/TLHDWalletWrapper', 'model/TLWalletJSONKeys'],
    function(TLCrypto, TLUtils, TLHDWalletWrapper, TLWalletJSONKeys) {

        TLWalletJson.ARCBIT_NS = 'ab:identity:';
        TLWalletJson.ARCBIT_VERSION = 'ab:version';

        function TLWalletJson() {
        }

        TLWalletJson.getPasswordHash = function(password) {
            return TLCrypto.getPasswordHash(password);
        };

        TLWalletJson.getEncryptedWalletJsonContainer = function(walletJson, password, shouldEncrypt) {
            var str = TLUtils.dictionaryToJSONString(false, walletJson);
            if (shouldEncrypt) {
                str = TLCrypto.encrypt(str, password);
            }
            var walletJsonEncryptedWrapperDict = {
                "payload": str,
                "encrypted": shouldEncrypt,
                "password_hash": TLWalletJson.getPasswordHash(password),
                "date": Math.floor(Date.now() / 1000)
            };
            walletJsonEncryptedWrapperDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ENCRYPTION_VERSION] = "1";
            //console.log(" getEncryptedWalletJsonContainer: " + JSON.stringify(walletJsonEncryptedWrapperDict));
            return walletJsonEncryptedWrapperDict;
        };

        TLWalletJson.getWalletJsonDict = function(walletObj, password) {
            if (walletObj == null) {
                throw new Error("walletObj is null");
            }

            var version = walletObj[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ENCRYPTION_VERSION];
            if (version != "1") {
                throw new Error("Incorrect encryption version");
            }
            var walletPayloadDict = walletObj[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYLOAD];

            if (walletObj[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ENCRYPTED]) {
                if (password == null) {
                    throw new Error("Missing password");
                }

                var walletJsonString = TLWalletJson.decryptWalletJSONFile(walletPayloadDict, password);
                if (walletJsonString == null) {
                    throw new Error("Invalid Password");
                }
                var walletDict = TLUtils.JSONStringToDictionary(walletJsonString);
                return walletDict;
            } else {
                var walletDict = TLUtils.JSONStringToDictionary(walletPayloadDict);
                return walletDict;
            }
        };

        TLWalletJson.decryptWalletJSONFile = function(encryptedWalletJSONFile, password) {
            if (encryptedWalletJSONFile == null || password == null) {
                return null;
            }
            var str = TLCrypto.decrypt(encryptedWalletJSONFile, password);
            return str;
        };

        TLWalletJson.saveWalletJson = function(name, walletFile, callback) {
            var obj = {};
            obj[TLWalletJson.ARCBIT_NS+name] = walletFile;
            chrome.storage.local.set(obj, callback);
        };

        TLWalletJson.getLocalWalletJSONFile = function(name, callback) {
            chrome.storage.local.get(TLWalletJson.ARCBIT_NS+name, function(obj) {
                callback(obj[TLWalletJson.ARCBIT_NS+name]);
            });
        };

        TLWalletJson.deleteWalletJson = function(name, callback) {
            chrome.storage.local.remove(TLWalletJson.ARCBIT_NS+name, function() {
                callback();
            });
        };

        return TLWalletJson;
    });
