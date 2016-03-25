'use strict';

define(['bip39', 'bitcoinjs-lib', 'model/TLStealthAddress'],
    function(BIP39, Bitcoin, TLStealthAddress) {


        function TLHDWalletWrapper() {
        }

        TLHDWalletWrapper.getBIP44KeyChain = function(masterHex, accountIdx, network) {
            var keyChain = Bitcoin.HDNode.fromSeedHex(masterHex, network);
            return keyChain.deriveHardened(44).deriveHardened(0).deriveHardened(accountIdx);
        };

        TLHDWalletWrapper.generateMnemonicPassphrase = function() {
            return BIP39.generateMnemonic();
        };

        TLHDWalletWrapper.phraseIsValid = function(phrase) {
            return BIP39.validateMnemonic(phrase);
        };

        TLHDWalletWrapper.getMasterHex = function(mnemonic) {
            return BIP39.mnemonicToSeedHex(mnemonic);
        };

        TLHDWalletWrapper.getStealthAddress = function(extendedKey, isTestnet) {
            var network =  isTestnet ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin;
            var scanKeyChain = Bitcoin.HDNode.fromBase58(extendedKey, network).deriveHardened(100).derive(0);
            var scanPriv = scanKeyChain.privKey.d.toHex();
            var scanPublicKey = scanKeyChain.pubKey.toHex();
            var spendKeyChain = Bitcoin.HDNode.fromBase58(extendedKey, network).deriveHardened(100).derive(1);
            var spendPriv = spendKeyChain.privKey.d.toHex();
            var spendPublicKey = spendKeyChain.pubKey.toHex();
            var stealthAddress = TLStealthAddress.createStealthAddress(scanPublicKey, spendPublicKey, isTestnet);
            return {'stealthAddress': stealthAddress, 'scanPriv': scanPriv, 'spendPriv': spendPriv};
        };

        TLHDWalletWrapper.getAccountIdxForExtendedKey = function(extendedKey, network) {
            return Bitcoin.HDNode.fromBase58(extendedKey, network).index;
        };

        TLHDWalletWrapper.isValidExtendedPublicKey = function(extendedPublicKey, network) {
            try {
                var node = Bitcoin.HDNode.fromBase58(extendedPublicKey, network);
                return node != null && node.privKey == null &&
                    ((node.network.bip32.public == 0x0488b21e && network == Bitcoin.networks.bitcoin) || (node.network.bip32.public == 0x043587cf && network == Bitcoin.networks.testnet));
            } catch (e) {
                return false;
            }
        };

        TLHDWalletWrapper.getKeyChain = function(extendKey, network) {
            return Bitcoin.HDNode.fromBase58(extendKey, network);
        };

        TLHDWalletWrapper.isValidExtendedPrivateKey = function(extendedPrivateKey, network) {
            try {
                var node = Bitcoin.HDNode.fromBase58(extendedPrivateKey, network);
                return node != null && node.privKey != null &&
                    ((node.network.bip32.private == 0x0488ade4 && network == Bitcoin.networks.bitcoin) || (node.network.bip32.private == 0x04358394 && network == Bitcoin.networks.testnet));
            } catch (e) {
                return false;
            }
        };

        TLHDWalletWrapper.getExtendPubKey = function(extendPrivKey, network) {
            return Bitcoin.HDNode.fromBase58(extendPrivKey, network).neutered().toBase58();
        };

        TLHDWalletWrapper.getExtendPubKeyFromMasterHex = function(masterHex, accountIdx, network) {
            return TLHDWalletWrapper.getBIP44KeyChain(masterHex, accountIdx, network).neutered().toBase58();
        };

        TLHDWalletWrapper.getExtendPrivKey = function(masterHex, accountIdx, network) {
            return TLHDWalletWrapper.getBIP44KeyChain(masterHex, accountIdx, network).toBase58();
        };

        TLHDWalletWrapper.getAddress = function(extendPubKey, sequence, network) {
            var keyChain = Bitcoin.HDNode.fromBase58(extendPubKey, network);
            for (var i=0; i < sequence.length; i++) {
                keyChain = keyChain.derive(sequence[i]);
            }

            return keyChain.getAddress(network).toString();
        };

        TLHDWalletWrapper.getPrivateKey = function(extendPrivKey, sequence, network) {
            var keyChain = Bitcoin.HDNode.fromBase58(extendPrivKey, network);
            for (var i=0; i < sequence.length; i++) {
                keyChain = keyChain.derive(sequence[i]);
            }
            return keyChain.privKey.toWIF(network);

        };

        return TLHDWalletWrapper;
    });
