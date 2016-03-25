/*
 * @fileOverview TLStealthAddress tests
 */
'use strict';

define(['bitcoinjs-lib', 'model/TLStealthAddress', 'model/TLBitcoinJSWrapper'],
    function(Bitcoin, TLStealthAddress, TLBitcoinJSWrapper) {
        describe('Test TLStealthAddress', function() {
//*
            var networkBitcoin = Bitcoin.networks.bitcoin;
            var expectedStealthAddress = 'vJmujDzf2PyDEcLQEQWyzVNthLpRAXqTi3ZencThu2WCzrRNi64eFYJP6ZyPWj53hSZBKTcUAk8J5Mb8rZC4wvGn77Sj4Z3yP7zE69';
            var expectedScanPublicKey = '02a13daf6cc5ad7a1adcae59ff348a005247aa9e84453770d0e0ee96b894f8bbb1';
            var scanPrivateKey = 'd63e1ca7e79bafd8fdc7e568c6b3fcf8a287ad328e80376e6582af2e69943eca';
            var expectedSpendPublicKey = '02c55695f16cd320fef70ff6f46601cdeed655d9198d555a533382fb81a8f6eab5';
            var spendPrivateKey = 'c4054001795dd20c740d5d1389e080b424a9ff2ec9503aa3182369f4b71f00ac';
            var ephemeralPublicKey = '02d53b53c3cb7d6e8f4925e404ce40ec9edd81b0b03d49da950deb3c2240ca519a';
            var ephemeralPrivateKey = 'dc406d598685e3400a7eff2d952d47f999de9f69d5ff1295302ad7314a2cf979';
            var paymentAddressPublicKey = '02da20a21ac1332edd5352306104f7a751b45e52bf4a41d4c350ccb890301d80e6';
            var paymentAddressPrivateKey = '775c912899b27ee8a1f944c0e2ac90e095f63893d39c3d66d0dd0a854b799eb5';
            var isTestNet = false;
            var nonce = 0xdeadbeef;

            it('test stealthAddress', function () {
                var stealthAddress = TLStealthAddress.createStealthAddress(expectedScanPublicKey, expectedSpendPublicKey, isTestNet);
                expect(stealthAddress).toBe(expectedStealthAddress);

                var publicKeys = TLStealthAddress.getScanPublicKeyAndSpendPublicKey(stealthAddress, isTestNet);
                var scanPublicKey = publicKeys[0];
                var spendPublicKey = publicKeys[1];
                expect(scanPublicKey).toBe(expectedScanPublicKey);
                expect(spendPublicKey).toBe(expectedSpendPublicKey);

                var stealthDataScriptAndPaymentAddress = TLStealthAddress.createDataScriptAndPaymentAddressWithNounceAndEphemKey(stealthAddress,
                    ephemeralPrivateKey, nonce, isTestNet);
                var expectedPaymentAddress = TLBitcoinJSWrapper.getAddressFromPublicKey(paymentAddressPublicKey);

                expect(stealthDataScriptAndPaymentAddress[0]).toBe('6a2606deadbeef02d53b53c3cb7d6e8f4925e404ce40ec9edd81b0b03d49da950deb3c2240ca519a');
                expect(stealthDataScriptAndPaymentAddress[1]).toBe(expectedPaymentAddress);

                var publicKey = TLStealthAddress.getPaymentAddressPublicKeyFromScript(stealthDataScriptAndPaymentAddress[0], scanPrivateKey, spendPublicKey);
                expect(publicKey).toBe(paymentAddressPublicKey);
                expect(TLBitcoinJSWrapper.getAddressFromPublicKey(publicKey, networkBitcoin)).toBe('1C6gQ79qKKG21AGCA9USKYWPvu6LzoPH5h');
            });

            it('test addition', function () {
                var lhsPublicKey = '02a3fe61cf993845ec7c0c0833884ae2f2fdd1cc8d1c134f12836b4a4584178ab3';
                var rhsPublicKey = '028007c01dd3a4f074bc5552dd73bbe8f530fc0da5a438af04ab87feaf85a0136a';
                expect(TLStealthAddress.addPublicKeys(lhsPublicKey, rhsPublicKey)).toBe('0360882edc74ef593142ef477cb62e08eb0af14351d31e6dcf38c9ee8af726d3cb');

                var lhsPrivateKey = 'c4054001795dd20c740d5d1389e080b424a9ff2ec9503aa3182369f4b71f00ac';
                var rhsPrivateKey = 'b35751272054acdc2debe7ad58cc102b2bfb164bb994a2ff788bff1d6490df4a';
                expect(TLStealthAddress.addPrivateKeys(lhsPrivateKey, rhsPrivateKey)).toBe(paymentAddressPrivateKey);
            });

            it('test sharedSecret', function () {
                var sharedSecret = TLStealthAddress.getSharedSecretForReceiver(ephemeralPublicKey, scanPrivateKey);
                expect(sharedSecret).toBe('b35751272054acdc2debe7ad58cc102b2bfb164bb994a2ff788bff1d6490df4a');
            });

            it('test stealthDataScript', function () {
                var stealthDataScript = '6a2606deadbeef02d53b53c3cb7d6e8f4925e404ce40ec9edd81b0b03d49da950deb3c2240ca519a';

                var publicKey = TLStealthAddress.getPaymentAddressPublicKeyFromScript(stealthDataScript, scanPrivateKey, expectedSpendPublicKey);
                expect(publicKey).toBe(paymentAddressPublicKey);
                expect(TLBitcoinJSWrapper.getAddressFromPublicKey(publicKey, networkBitcoin)).toBe('1C6gQ79qKKG21AGCA9USKYWPvu6LzoPH5h');

                var secret = TLStealthAddress.getPaymentAddressPrivateKeySecretFromScript(stealthDataScript, scanPrivateKey, spendPrivateKey);
                expect(secret).toBe(paymentAddressPrivateKey);
                expect(TLBitcoinJSWrapper.getAddressFromSecret(secret, networkBitcoin)).toBe('1C6gQ79qKKG21AGCA9USKYWPvu6LzoPH5h');

                expect(TLStealthAddress.isStealthAddress('waPaGzJ3AUzpu3tBBcu7vrsyGsBj29MNFvANP9G2RxokXncKZ3KJkEcnLHwgZvp6HhXabbQNkJhQbar6vXMFMmG9nJDz5rufxA7ZBp', true)).toBe(true);
                expect(TLStealthAddress.isStealthAddress('waPaGzJ3AUzpu3tBBcu7vrsyGsBj29MNFvANP9G2RxokXncKZ3KJkEcnLHwgZvp6HhXabbQNkJhQbar6vXMFMmG9nJDz5rufxA7ZBp', false)).toBe(false);
                expect(TLStealthAddress.isStealthAddress(expectedStealthAddress, isTestNet)).toBe(true);
                expect(TLStealthAddress.isStealthAddress(expectedStealthAddress, true)).toBe(false);
                expect(TLStealthAddress.isStealthAddress('1DvKTsUfVaExCD7rBK4nyHt88tYpxU93eD', isTestNet)).toBe(false);
                expect(TLStealthAddress.isStealthAddress("Open the pod bay doors Hal", isTestNet)).toBe(false);

                var scanPublicKey = '03267a6dc59b3dfeae10efdca889245379ca0fa733dc5fa9c9b573d8896f01577e';
                ephemeralPrivateKey = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
                var sharedSecret = TLStealthAddress.getSharedSecretForSender(scanPublicKey, ephemeralPrivateKey);
                expect(sharedSecret).toBe('b6e408dfe08aabde07d459cdcb9f6fb160b95063286161cd51261c448e5bc09c');

                var stealthDataScriptAndPaymentAddress = TLStealthAddress.createDataScriptAndPaymentAddressWithNounceAndEphemKey(expectedStealthAddress,
                    ephemeralPrivateKey, nonce, isTestNet);
                expect(stealthDataScriptAndPaymentAddress[0]).toBe('6a2606deadbeef03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd');
                expect(stealthDataScriptAndPaymentAddress[1]).toBe('1HCvVzoWN9SpYEmaMuJGGHNDVXxtDDjDEh');
            });
//*/
        });
    });
