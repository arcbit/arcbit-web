/*
 * @fileOverview TLBitcoinJSWrapper tests
 */
'use strict';

define(['bitcoinjs-lib', 'model/TLBitcoinJSWrapper'],
    function(Bitcoin, TLBitcoinJSWrapper) {
        describe('test TLBitcoinJSWrapper', function() {
            var networkBitcoin = Bitcoin.networks.bitcoin;
            var networkTestnet = Bitcoin.networks.testnet;

            //*
            it('test key and addresses', function () {
                var txid = "2c441ba4920f03f37866edb5647f2626b64f57ad98b0a8e011af07da0aefcec3";
                var txHash = TLBitcoinJSWrapper.reverseHexString(txid);
                expect(txHash).toBe("c3ceef0ada07af11e0a8b098ad574fb626267f64b5ed6678f3030f92a41b442c");

                var address = TLBitcoinJSWrapper.getAddressFromOutputScript('76a9147ab89f9fae3f8043dcee5f7b5467a0f0a6e2f7e188ac', networkBitcoin);
                expect(address).toBe('1CBtcGivXmHQ8ZqdPgeMfcpQNJrqTrSAcG');
                address = TLBitcoinJSWrapper.getAddressFromOutputScript('76a914988cb8253f4e28be6e8bfded1b4aa11c646e1a8588ac', networkTestnet);
                expect(address).toBe('muRZaZYTZCDrb68nKQ7Kjk595aj8mmjaKP');

                var pubKeyHash = TLBitcoinJSWrapper.getStandardPubKeyHashScriptFromAddress('1DvKTsUfVaExCD7rBK4nyHt88tYpxU93eD');
                expect(pubKeyHash).toBe('76a9148db6f7be85dffed461440320f4f779735dacdfdc88ac');

                var address1 = TLBitcoinJSWrapper.getAddress('L4rK1yDtCWekvXuE6oXD9jCYfFNV2cWRpVuPLBcCU2z8TrisoyY1', networkBitcoin);
                expect(address1).toBe('1F3sAm6ZtwLAUnj7d38pGFxtP3RVEvtsbV');
                address1 = TLBitcoinJSWrapper.getAddress('5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss', networkBitcoin);
                expect(address1).toBe('1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN');
                address1 = TLBitcoinJSWrapper.getAddress('cVDJUtDjdaM25yNVVDLLX3hcHUfth4c7tY3rSc4hy9e8ibtCuj6G', networkTestnet);
                expect(address1).toBe('muZpTpBYhxmRFuCjLc7C6BBDF32C8XVJUi');
                address1 = TLBitcoinJSWrapper.getAddress('93KCDD4LdP4BDTNBXrvKUCVES2jo9dAKKvhyWpNEMstuxDauHty', networkTestnet);
                expect(address1).toBe('mx5u3nqdPpzvEZ3vfnuUQEyHg3gHd8zrrH');


                var address2 = TLBitcoinJSWrapper.getAddressFromPublicKey('03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd', networkBitcoin);
                expect(address2).toBe('1F3sAm6ZtwLAUnj7d38pGFxtP3RVEvtsbV');
                address2 = TLBitcoinJSWrapper.getAddressFromPublicKey('03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd', networkTestnet);
                expect(address2).toBe('muZpTpBYhxmRFuCjLc7C6BBDF32C8XVJUi');

                var address3 = TLBitcoinJSWrapper.getAddressFromSecret('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', networkBitcoin);
                expect(address3).toBe('1F3sAm6ZtwLAUnj7d38pGFxtP3RVEvtsbV');
                address3 = TLBitcoinJSWrapper.getAddressFromSecret('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', networkTestnet);
                expect(address3).toBe('muZpTpBYhxmRFuCjLc7C6BBDF32C8XVJUi');

                var key = TLBitcoinJSWrapper.privateKeyFromSecret('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', networkBitcoin);
                expect(key).toBe('L4rK1yDtCWekvXuE6oXD9jCYfFNV2cWRpVuPLBcCU2z8TrisoyY1');

                key = TLBitcoinJSWrapper.privateKeyFromSecret('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', networkTestnet);
                expect(key).toBe('cVDJUtDjdaM25yNVVDLLX3hcHUfth4c7tY3rSc4hy9e8ibtCuj6G');


                var valid = TLBitcoinJSWrapper.isValidPrivateKey('L4rK1yDtCWekvXuE6oXD9jCYfFNV2cWRpVuPLBcCU2z8TrisoyY1');
                expect(valid).toBe(true);
                valid = TLBitcoinJSWrapper.isValidPrivateKey('93KCDD4LdP4BDTNBXrvKUCVES2jo9dAKKvhyWpNEMstuxDauHty');
                expect(valid).toBe(true);

                var valid1 = TLBitcoinJSWrapper.isValidPrivateKey('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
                expect(valid1).toBe(false);


                var valid2 = TLBitcoinJSWrapper.isAddressVersion0('1DvKTsUfVaExCD7rBK4nyHt88tYpxU93eD');
                expect(valid2).toBe(true);

                var valid3 = TLBitcoinJSWrapper.isAddressVersion0('3EktnHQD7RiAE6uzMj2ZifT9YgRrkSgzQX');
                expect(valid3).toBe(false);

                valid = TLBitcoinJSWrapper.isAddressVersion0('1');
                expect(valid).toBe(true);

                valid = TLBitcoinJSWrapper.isValidAddress('1DvKTsUfVaExCD7rBK4nyHt88tYpxU93eD', false);
                expect(valid).toBe(true);
                valid = TLBitcoinJSWrapper.isValidAddress('3EktnHQD7RiAE6uzMj2ZifT9YgRrkSgzQX', false);
                expect(valid).toBe(true);
                valid = TLBitcoinJSWrapper.isValidAddress('1');
                expect(valid).toBe(false);

                valid = TLBitcoinJSWrapper.isValidAddress('mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn', false);
                expect(valid).toBe(false);
                valid = TLBitcoinJSWrapper.isValidAddress('2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Vc', false);
                expect(valid).toBe(false);
                valid = TLBitcoinJSWrapper.isValidAddress('2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Ve', false);
                expect(valid).toBe(false);

                valid = TLBitcoinJSWrapper.isValidAddress('1DvKTsUfVaExCD7rBK4nyHt88tYpxU93eD', true);
                expect(valid).toBe(false);
                valid = TLBitcoinJSWrapper.isValidAddress('3EktnHQD7RiAE6uzMj2ZifT9YgRrkSgzQX', true);
                expect(valid).toBe(false);
                valid = TLBitcoinJSWrapper.isValidAddress('1');
                expect(valid).toBe(false);

                valid = TLBitcoinJSWrapper.isValidAddress('mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn', true);
                expect(valid).toBe(true);
                valid = TLBitcoinJSWrapper.isValidAddress('2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Vc', true);
                expect(valid).toBe(true);
                valid = TLBitcoinJSWrapper.isValidAddress('2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Ve', true);
                expect(valid).toBe(false);


                valid = TLBitcoinJSWrapper.isBIP38EncryptedKey('6PfNtAd2tHsBBEeaHuRLAbRc7dXbx1VL3DJEQkjgnNMGcKdr1TVeCxvwd8');
                expect(valid).toBe(true);
                valid = TLBitcoinJSWrapper.isBIP38EncryptedKey('6P');
                expect(valid).toBe(true);

                valid = TLBitcoinJSWrapper.isBIP38EncryptedKey('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
                expect(valid).toBe(false);
                valid = TLBitcoinJSWrapper.isBIP38EncryptedKey('6p');
                expect(valid).toBe(false);
                valid = TLBitcoinJSWrapper.isBIP38EncryptedKey('6');
                expect(valid).toBe(false);
                valid = TLBitcoinJSWrapper.isBIP38EncryptedKey('');
                expect(valid).toBe(false);

                var signature = TLBitcoinJSWrapper.getSignature('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'message');
                expect(signature).toBe('IIKZsJmBeK/xz3fgdBWTZdMlAkKJPbppe7Z706uYpcDCDxqm3iOJE5nv8736HXb6XvLIbNz1hIhJJTfJMOCiiw8=');
            });

            it('test createSignedSerializedTransactionHex', function () {
                var hash = TLBitcoinJSWrapper.reverseHexString("935c6975aa65f95cb55616ace8c8bede83b010f7191c0a6d385be1c95992870d");
                var script = "76a9149a1c78a507689f6f54b847ad1cef1e614ee23f1e88ac";
                var address = "1F3sAm6ZtwLAUnj7d38pGFxtP3RVEvtsbV";
                var privateKey = "L4rK1yDtCWekvXuE6oXD9jCYfFNV2cWRpVuPLBcCU2z8TrisoyY1";
                var txHexAndTxHash = TLBitcoinJSWrapper.createSignedSerializedTransactionHex([hash], [0], [script], [address],
                    [2500000], [privateKey], null);
                expect(TLBitcoinJSWrapper.reverseHexString(txHexAndTxHash["txHash"])).toBe("3f3b1fa143c07bb58d1531afdaa544ccdd0ee0ac9ab164ace70fda725c2ea455");
                expect(TLBitcoinJSWrapper.reverseHexString(txHexAndTxHash["txHex"])).toBe("00000000ac881e3fe24e611eef1cad47b8546f9f6807a5781c9a14a9761900000000002625a001ffffffffbdc540c5c16ab5b882fc92c6416e2206db365ac3c2b3b2364e0c792cf2994ba3032101059d97d9306baac9667ea14f9e471eaf662ef884b586113fb84c69bde4c3d260200296efaa281b43230988c867cb2793e48646a21d66d1d95cb563148d7326261b2a20024430476a000000000d879259c9e15b386d0a1c19f710b083debec8e8ac1656b55cf965aa75695c930100000001");
            });

            it('test getSignature', function () {
                var privKey = '4e422fb1e5e1db6c1f6ab32a7706d368ceb385e7fab098e633c5c5949c3b97cd';
                var msg = "I'm sorry, Dave. I'm afraid I can't do that";
                var signature = TLBitcoinJSWrapper.getSignature(privKey, msg);
                expect(signature).toBe("IPD9ItlEbXBhPOg1ENibzP3ab1npAPjzFAt3krUrnlfDJvosnoNHi8CfUZcxrrcYFmHKu7dm1V9XVrkIONKLxrg=");
//            expect(signature).toBe("HPD9ItlEbXBhPOg1ENibzP3ab1npAPjzFAt3krUrnlfDJvosnoNHi8CfUZcxrrcYFmHKu7dm1V9XVrkIONKLxrg=");
                var address = TLBitcoinJSWrapper.getAddressFromSecret(privKey, networkBitcoin);
                expect(TLBitcoinJSWrapper.verifySignature(address, signature, msg)).toBe(true);
            });

            it('test reverseHexString', function () {
                var txid = '2c441ba4920f03f37866edb5647f2626b64f57ad98b0a8e011af07da0aefcec3';
                var hash = TLBitcoinJSWrapper.reverseHexString(txid);
                expect(hash).toBe("c3ceef0ada07af11e0a8b098ad574fb626267f64b5ed6678f3030f92a41b442c");
                expect(TLBitcoinJSWrapper.reverseHexString(hash)).toBe(txid);
            });
            //*/
        });
    });
