'use strict';

define(['bitcoinjs-lib'],
    function(Bitcoin) {

        var STEALTH_ADDRESS_MSG_SIZE = 0x26; //38 bytes without 2 byte prefix
        var STEALTH_ADDRESS_TRANSACTION_VERSION = 0x06;
        var BTC_MAGIC_BYTE = 0x2a;
        var BTC_TESTNET_MAGIC_BYTE = 0x2b;

        function TLStealthAddress() {
        }

        TLStealthAddress.getStealthAddressTransacionVersion = function() {
            return STEALTH_ADDRESS_TRANSACTION_VERSION;
        };

        TLStealthAddress.getMagicByte = function(isTestNet) {
            return isTestNet ? BTC_TESTNET_MAGIC_BYTE : BTC_MAGIC_BYTE;
        };

        TLStealthAddress.getStealthAddressMsgSize = function() {
            return STEALTH_ADDRESS_MSG_SIZE;
        };

        TLStealthAddress.isStealthAddress = function(stealthAddress, isTestNet) {
            var data;
            try {
                data = Bitcoin.base58check.decode(stealthAddress);
                if(data == null) {
                    return false;
                }
            } catch (err) {
                return false;
            }
            var stealthAddressHex = data.toString('hex');
            if (stealthAddressHex.length != 142) {
                return false;
            }
            if (stealthAddressHex.substring(0, 2) != this.getMagicByte(isTestNet).toString(16)) {
                return false;
            }
            var scanPublicKey = stealthAddressHex.substring(4, 66+4);
            var spendPublicKey = stealthAddressHex.substring(72, 66+72);
            return this.createStealthAddress(scanPublicKey, spendPublicKey, isTestNet) == stealthAddress;
        };

        TLStealthAddress.createStealthAddress = function(scanPublicKey, spendPublicKey, isTestNet) {
            var hexString = this.getMagicByte(isTestNet).toString(16) + '00' + scanPublicKey + '01' + spendPublicKey + '0100';
            return Bitcoin.base58check.encode(new Bitcoin.Buffer(hexString, 'hex'));
        };

        TLStealthAddress.generateEphemeralPrivkey = function() {
            return Bitcoin.ECKey.makeRandom(true).d.toHex();
        };

        TLStealthAddress.generateNonce = function() {
            return parseInt(Bitcoin.ECKey.makeRandom(true).d.toString(16).substring(0, 8), 16);
        };

        TLStealthAddress.createDataScriptAndPaymentAddress = function(stealthAddress, isTestNet) {
            var ephemeralPrivateKey = this.generateEphemeralPrivkey();
            var nonce = this.generateNonce();
            return this.createDataScriptAndPaymentAddressWithNounceAndEphemKey(stealthAddress, ephemeralPrivateKey, nonce, isTestNet);
        };

        TLStealthAddress.createDataScriptAndPaymentAddressWithNounceAndEphemKey = function(stealthAddress, ephemeralPrivateKey, nonce, isTestNet) {
            var publicKeys = TLStealthAddress.getScanPublicKeyAndSpendPublicKey(stealthAddress, isTestNet);
            var scanPublicKey = publicKeys[0];
            var spendPublicKey = publicKeys[1];
            if (this.createStealthAddress(scanPublicKey, spendPublicKey, isTestNet) != stealthAddress) {
                throw new Error("Invalid stealth address");
            }
            var key = new Bitcoin.ECKey(Bitcoin.BigInteger.fromBuffer(new Bitcoin.Buffer(ephemeralPrivateKey, 'hex')));
            var ephemeralPublicKey = key.pub.toHex();
            var nonceHex = '0'.repeat(8-nonce.toString(16).length)+nonce.toString(16);
            var stealthDataScript = Bitcoin.opcodes.OP_RETURN.toString(16) + this.getStealthAddressMsgSize().toString(16) +
                + '0' + this.getStealthAddressTransacionVersion().toString(16) + nonceHex + ephemeralPublicKey;

            var paymentPublicKey = this.getPaymentPublicKeySender(scanPublicKey, spendPublicKey, ephemeralPrivateKey);

            var paymentAddress;
            if (!isTestNet) {
                var key = Bitcoin.ECPubKey.fromHex(paymentPublicKey);
                paymentAddress = key.getAddress().toString();
            } else {
                //TODO support testnet
                var key = Bitcoin.ECPubKey.fromHex(paymentPublicKey);
                paymentAddress = key.getAddress().toString();
            }
            return [stealthDataScript, paymentAddress];
        };

        TLStealthAddress.getEphemeralPublicKeyFromStealthDataScript = function(scriptHex) {
            if (scriptHex.length != 80) {
                return null;
            }
            return scriptHex.substring(14);
        };

        TLStealthAddress.getPaymentAddressPrivateKeySecretFromScript = function(stealthDataScript, scanPrivateKey, spendPrivateKey) {
            var ephemeralPublicKey = this.getEphemeralPublicKeyFromStealthDataScript(stealthDataScript);
            if (ephemeralPublicKey == null) {
                return null;
            }
            return this.getPaymentPrivateKey(scanPrivateKey, spendPrivateKey, ephemeralPublicKey);
        };

        TLStealthAddress.getPaymentAddressPublicKeyFromScript = function(stealthDataScript, scanPrivateKey, spendPrivateKey) {
            var ephemeralPublicKey = this.getEphemeralPublicKeyFromStealthDataScript(stealthDataScript);
            if (ephemeralPublicKey == null) {
                return null;
            }
            return this.getPaymentPublicKeyForReceiver(scanPrivateKey, spendPrivateKey, ephemeralPublicKey);
        };

        TLStealthAddress.getScanPublicKeyAndSpendPublicKey = function(stealthAddress, isTestNet) {
            var data = Bitcoin.base58check.decode(stealthAddress);
            var stealthAddressHex = data.toString('hex');
            if (stealthAddressHex.length != 142) {
                throw new Error("stealthAddressHex.length != 142");
            }
            if (stealthAddressHex.substring(0, 2) != this.getMagicByte(isTestNet).toString(16)) {
                throw new Error("stealth address contains invalid magic byte");
            }
            var scanPublicKey = stealthAddressHex.substring(4, 66+4);
            var spendPublicKey = stealthAddressHex.substring(72, 66+72);
            return [scanPublicKey, spendPublicKey];
        };

        TLStealthAddress.getSharedSecretForSender = function(scanPublicKey, ephemeralPrivateKey) {
            var scanPublicKeyPoint = Bitcoin.ECPubKey.fromHex(scanPublicKey);
            var ephemeralPrivateKeySecret = Bitcoin.BigInteger.fromBuffer(new Bitcoin.Buffer(ephemeralPrivateKey, 'hex'));
            var point = scanPublicKeyPoint.Q.multiply(ephemeralPrivateKeySecret);
            var c = Bitcoin.crypto.sha256(point.getEncoded(true));
            return Bitcoin.BigInteger.fromBuffer(c).toHex();
        };


        TLStealthAddress.getSharedSecretForReceiver = function(ephemeralPublicKey, scanPrivateKey) {
            var ephemeralPublicKeyPoint = Bitcoin.ECPubKey.fromHex(ephemeralPublicKey);
            var scanPrivateKeySecret = Bitcoin.BigInteger.fromBuffer(new Bitcoin.Buffer(scanPrivateKey, 'hex'));
            var point = ephemeralPublicKeyPoint.Q.multiply(scanPrivateKeySecret);
            var c = Bitcoin.crypto.sha256(point.getEncoded(true));
            return Bitcoin.BigInteger.fromBuffer(c).toHex();
        };

        TLStealthAddress.getPaymentPublicKeyForReceiver = function(scanPrivateKey, spendPublicKey, ephemeralPublicKey) {
            var sharedSecret = this.getSharedSecretForReceiver(ephemeralPublicKey, scanPrivateKey);
            if (sharedSecret == null) {
                return null;
            } else {
                var secretNum = Bitcoin.BigInteger.fromBuffer(new Bitcoin.Buffer(sharedSecret, 'hex'));
                var key = new Bitcoin.ECKey(secretNum, true);
                return this.addPublicKeys(spendPublicKey, key.pub.toHex());
            }
        };

        TLStealthAddress.getPaymentPublicKeySender = function(scanPublicKey, spendPublicKey, ephemeralPrivateKey) {
            var sharedSecret = this.getSharedSecretForSender(scanPublicKey, ephemeralPrivateKey);
            if (sharedSecret == null) {
                return null;
            } else {
                var secretNum = Bitcoin.BigInteger.fromBuffer(new Bitcoin.Buffer(sharedSecret, 'hex'));
                var key = new Bitcoin.ECKey(secretNum, true);
                return this.addPublicKeys(spendPublicKey, key.pub.toHex());
            }
        };

        TLStealthAddress.getPaymentPrivateKey = function(scanPrivateKey, spendPrivateKey, ephemeralPublicKey) {
            var sharedSecret = this.getSharedSecretForReceiver(ephemeralPublicKey, scanPrivateKey);
            if (sharedSecret == null) {
                return null
            } else {
                return this.addPrivateKeys(spendPrivateKey, sharedSecret);
            }
        };

        TLStealthAddress.addPublicKeys = function(lhsPublicKey, rhsPublicKey) {
            var lhsPubKey = Bitcoin.ECPubKey.fromHex(lhsPublicKey);
            var rhsPubKey = Bitcoin.ECPubKey.fromHex(rhsPublicKey);
            return new Bitcoin.ECPubKey(lhsPubKey.Q.add(rhsPubKey.Q), true).toHex();
        };

        TLStealthAddress.addPrivateKeys = function(lhsPrivateKey, rhsPrivateKey) {
            var secretNum = Bitcoin.BigInteger.fromBuffer(new Bitcoin.Buffer(lhsPrivateKey, 'hex'));
            var spendKey = new Bitcoin.ECKey(secretNum, true);
            var c = Bitcoin.BigInteger.fromBuffer(new Bitcoin.Buffer(rhsPrivateKey, 'hex'));
            return new Bitcoin.ECKey(spendKey.d.add(c).mod(Bitcoin.ECKey.curve.n), true).d.toHex();
        };

        return TLStealthAddress;
    });
