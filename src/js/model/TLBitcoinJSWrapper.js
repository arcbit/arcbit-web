'use strict';

define(['bitcoinjs-lib', 'model/TLStealthAddress', 'model/TLBIP38'],
    function(Bitcoin, TLStealthAddress, TLBIP38) {

        function TLBitcoinJSWrapper() {
        }

        TLBitcoinJSWrapper.getNetwork = function(isTestnet) {
            return isTestnet ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin;
        };

        TLBitcoinJSWrapper.getAddressFromOutputScript = function(scriptHex, network) {
            var script = Bitcoin.Script.fromHex(scriptHex);
            return Bitcoin.Address.fromOutputScript(script, network).toString();
        };

        TLBitcoinJSWrapper.getStandardPubKeyHashScriptFromAddress = function(address) {
            return Bitcoin.Address.fromBase58Check(address).toOutputScript().toHex();
        };

        TLBitcoinJSWrapper.getAddress = function(privateKey, network) {
            return Bitcoin.ECKey.fromWIF(privateKey).pub.getAddress(network).toString();
        };

        TLBitcoinJSWrapper.getAddressFromPublicKey = function(publicKey, network) {
            return Bitcoin.ECPubKey.fromHex(publicKey).getAddress(network).toString();
        };

        TLBitcoinJSWrapper.getAddressFromSecret = function(secret, network) {
            var secretNum = Bitcoin.BigInteger.fromBuffer(new Bitcoin.Buffer(secret, 'hex'));
            return new Bitcoin.ECKey(secretNum).pub.getAddress(network).toString();
        };

        TLBitcoinJSWrapper.privateKeyFromEncryptedPrivateKey = function(encryptedPrivateKey, password, success, wrongPassword, error) {
            TLBIP38.parseBIP38toECKey(encryptedPrivateKey, password, success, wrongPassword, error);
        };

        TLBitcoinJSWrapper.privateKeyFromSecret = function(secret, network) {
            var secretNum = Bitcoin.BigInteger.fromBuffer(new Bitcoin.Buffer(secret, 'hex'));
            return new Bitcoin.ECKey(secretNum).toWIF(network);
        };

        TLBitcoinJSWrapper.isAddressVersion0 = function(address) {
            return address.indexOf('1') === 0;
        };

        TLBitcoinJSWrapper.isValidRegAddress = function(address, network) {
            var addr = Bitcoin.Address.fromBase58Check(address);
            if (!addr) {
                return false;
            }
            if (network == Bitcoin.networks.bitcoin) {
                return addr.version == 0 || addr.version == 5;
            } else {
                return addr.version == 111 || addr.version == 196;
            }
        };

        TLBitcoinJSWrapper.isValidAddress = function(address, isTestnet) {
            try {
                return TLStealthAddress.isStealthAddress(address, isTestnet)
                    || TLBitcoinJSWrapper.isValidRegAddress(address,  TLBitcoinJSWrapper.getNetwork(isTestnet));
            } catch (e) {
                return false;
            }
        };

        TLBitcoinJSWrapper.isValidPrivateKey = function(privateKey) {
            try {
                return Bitcoin.ECKey.fromWIF(privateKey) != null;
            } catch (e) {
                return false;
            }
        };

        TLBitcoinJSWrapper.isBIP38EncryptedKey = function(privateKey) {
            return privateKey != null && privateKey.indexOf('6P') === 0;
        };

        TLBitcoinJSWrapper.getSignatureFromKey = function(privateKey, message) {
            var key = Bitcoin.ECKey.fromWIF(privateKey);
            var signature = Bitcoin.Message.sign(key, message);
            if (Bitcoin.Message.verify(key.pub.getAddress().toString(), signature, message) != true) {
                throw new Error("signing failed");
            }
            return signature.toString('base64');
        };

        TLBitcoinJSWrapper.getSignature = function(privateKey, message) {
            var secretNum = Bitcoin.BigInteger.fromBuffer(new Bitcoin.Buffer(privateKey, 'hex'));
            var key = new Bitcoin.ECKey(secretNum);
            var signature = Bitcoin.Message.sign(key, message);
            if (Bitcoin.Message.verify(key.pub.getAddress().toString(), signature, message) != true) {
                throw new Error("signing failed");
            }
            return signature.toString('base64');
        };

        TLBitcoinJSWrapper.verifySignature = function(address, signature, message) {
            return Bitcoin.Message.verify(address, signature, message);
        };

        TLBitcoinJSWrapper.reverseHexString = function(hex) {
            return Bitcoin.bufferutils.reverse(new Bitcoin.Buffer(hex, 'hex')).toString('hex');
        };

        TLBitcoinJSWrapper.createSignedSerializedTransactionHex = function(hashes, inputIndexes, inputScripts,
                                                                           outputAddresses, outputAmounts,
                                                                           privateKeys, outputScripts) {
            var tx = new Bitcoin.TransactionBuilder();
            for (var i = 0; i < hashes.length; i++) {
                tx.addInput(hashes[i], inputIndexes[i]);
            }

            if (outputScripts != null) {
                for (var i = 0; i < outputScripts.length; i++) {
                    tx.addOutput(Bitcoin.Script.fromHex(outputScripts[i]), i);
                }
            }

            for (var i = 0; i < outputAddresses.length; i++) {
                tx.addOutput(outputAddresses[i], outputAmounts[i]);
            }

            for (var i = 0; i < privateKeys.length; i++) {
                tx.sign(i, Bitcoin.ECKey.fromWIF(privateKeys[i]));
            }

            return {
                "txHex": tx.build().toHex(),
                "txHash": tx.build().getId()
            };
        };

        return TLBitcoinJSWrapper;
    });
