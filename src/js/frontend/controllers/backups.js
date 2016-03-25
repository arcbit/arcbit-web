/**
 * Backups
 */
'use strict';

define(['./module', 'arcbit', 'bitcoinjs-lib', 'model/TLWalletJson', 'model/TLWalletJSONKeys', 'sjcl'], function (controllers, ArcBit, Bitcoin, TLWalletJson, TLWalletJSONKeys) {
    controllers.controller('BackupsCtrl', ['$scope', '$window', 'notify', 'modals', '_Filter', function($scope, $window, notify, modals, _) {

        /**
         * Export
         */

        function download(filename, text) {
            var pom = $window.document.createElement('a');
            pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            pom.setAttribute('download', filename);
            pom.click();
        }

        function backupIdentityWithWalletJSON(identityName, walletObj) {
            if (walletObj != null && !walletObj[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ENCRYPTED]) {
                modals.password(_("Enter Wallet Password"), function(password) {

                    var passwordHash = TLWalletJson.getPasswordHash(password);
                    if (passwordHash == walletObj[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PASSWORD_HASH]) {

                        var encryptedWalletJson = TLWalletJson.getEncryptedWalletJsonContainer(JSON.parse(walletObj[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYLOAD]), password, true);
                        var obj = {};
                        obj[TLWalletJson.ARCBIT_NS+identityName] = encryptedWalletJson;
                        download('arcbit-'+identityName+'.json', JSON.stringify(obj));
                    } else {
                        notify.error(_('Incorrect password'));
                        backupIdentityWithWalletJSON(identityName, walletObj);
                    }
                });
            } else {
                var obj = {};
                obj[TLWalletJson.ARCBIT_NS+identityName] = walletObj;
                download('arcbit-'+identityName+'.json', JSON.stringify(obj));
            }
        }

        $scope.backupIdentity = function(identityName) {
            TLWalletJson.getLocalWalletJSONFile(identityName, function (walletObj) {
                backupIdentityWithWalletJSON(identityName, walletObj);
                if(!$scope.$$phase) {
                    $scope.$apply();
                }
            });
        };


        /**
         * Import
         */

            // Link for angular, we will put some information here
        $scope.importFile = {};

        // Private link to our contents
        var backupFile;


        /**
         * Callback for file selection
         */
        var handleFileSelect = function(data) {
            var fileDiv = $window.document.getElementById('import-wallet-file');
            var file = fileDiv.files[0];
            if (!file) {
                return;
            }
            $scope.step = 'unlock';
            $scope.importFile.name = file.name;
            $scope.importFile.size = (file.size/1024).toFixed(1);
            var reader = new FileReader();

            reader.onload = function(data) {
                backupFile = data.target.result;
                $scope.fileLoaded = true;
            };

            reader.readAsText(file);
            $scope.$apply();
        };

        /**
         * Unlock a backup once having the password
         */
        $scope.unlockBackup = function() {
            var walletObj;
            try {
                walletObj = JSON.parse(backupFile);
            } catch(e) {
                $scope.error = _('Bad file');
                return;
            }

            var walletName;
            var walletIdentityKey;
            for (var key in walletObj) {
                if (key.substring(0, TLWalletJson.ARCBIT_NS.length) == TLWalletJson.ARCBIT_NS) {
                    walletName = key.substring(TLWalletJson.ARCBIT_NS.length);
                    walletIdentityKey = key;
                }
            }

            if (walletName == null) {
                $scope.error = _('No ArcBit wallet file found');
                return;
            }

            try {
                var walletDict = TLWalletJson.getWalletJsonDict(walletObj[walletIdentityKey], $scope.password);
            } catch(errMsg) {
                if (errMsg.message == 'Incorrect encryption version') {
                    errMsg = _('Incorrect encryption version');
                } else if (errMsg.message == 'Missing password') {
                    errMsg = _('Missing password');
                } else if (errMsg.message == 'Invalid Password') {
                    errMsg = _('Invalid Password');
                }
                $scope.error = errMsg + ' ' + _('Note: Decryption password is the same as your login password at the time you backed up this wallet file.');
                return;
            }

            function restoreFromWalletObj(i, name, callBack) {
                var newName = i == 0 ? name : name + " (" + i + ")";
                TLWalletJson.getLocalWalletJSONFile(newName, function(dummy) {
                    if (dummy == null) {
                        TLWalletJson.saveWalletJson(newName, walletObj[walletIdentityKey], function () {
                            var keyRing = ArcBit.getKeyRing();
                            keyRing.availableIdentities.push(newName);
                            callBack(newName);
                        });
                    } else {
                        restoreFromWalletObj(i+1, name, callBack);
                    }
                });
            }

            restoreFromWalletObj(0, walletName, function(name) {
                notify.success(name + " " + _('Imported'));
                $scope.ok();
                if(!$scope.$$phase) {
                    $scope.$apply();
                }
            });
        };


        /**
         * Call to start the import process
         */
        $scope.restoreBackup = function() {
            modals.open('import', {}, function(data) {
            });
        };


        /**
         * Call to start the import process
         * Link with the import file div
         */
        var fileId = $window.document.getElementById('import-wallet-file');
        if (fileId) {
            $window.document.getElementById('import-wallet-file').addEventListener('change', handleFileSelect, false);
        }
    }]);
});
