'use strict';

define(['bitcoinjs-lib', 'crypto-js', 'sjcl'],
    function(Bitcoin, CryptoJS, sjcl) {

        function TLCrypto() {
        }

        TLCrypto.wordsToBytes = function(words) {
            var bytes = []
            for (var b = 0; b < words.length * 32; b += 8) {
                bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF)
            }
            return bytes
        };

        TLCrypto.wordArrayToBytes = function(wordArray) {
            return TLCrypto.wordsToBytes(wordArray.words)
        };

        TLCrypto.hexStringToData = function(hexString) {
            return new Bitcoin.Buffer(hexString, 'hex');
        };

        TLCrypto.getPasswordDigest = function(password) {
            var SHA256 = CryptoJS.SHA256;
            var passwordDigest = TLCrypto.wordArrayToBytes(SHA256(SHA256(SHA256(password))));
            return new Bitcoin.Buffer(passwordDigest).toString('hex');
        };

        TLCrypto.getPasswordHash = function(password) {
            var SHA256 = CryptoJS.SHA256;
            var passwordDigest = TLCrypto.wordArrayToBytes(SHA256(SHA256(SHA256(SHA256(SHA256(password))))));
            return new Bitcoin.Buffer(passwordDigest).toString('hex');
        };

        TLCrypto.encrypt = function(plainText, password) {
            var passwordDigest = TLCrypto.getPasswordDigest(password);
            var privData = sjcl.encrypt(passwordDigest, plainText, {ks: 256, ts: 128});
            return privData;
        };

        TLCrypto.decrypt = function(cipherText, password) {
            var passwordDigest = TLCrypto.getPasswordDigest(password);
            var data = sjcl.decrypt(passwordDigest, cipherText);
            return data;
        };

        return TLCrypto;
    });
