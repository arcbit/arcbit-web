/*
 * @fileOverview TLCrypto tests
 */
'use strict';

define(['bitcoinjs-lib', 'model/TLCrypto'],
    function(Bitcoin, TLCrypto) {
        //*
        describe('test TLCrypto', function() {
            it('test TLCrypto', function () {
                var plainText = "test";
                var cipherText = TLCrypto.encrypt(plainText, 'pas');
                var decryptedText = TLCrypto.decrypt(cipherText, 'pas');
                expect(decryptedText).toBe(plainText);

                var errorStr = null;
                try {
                    TLCrypto.decrypt(cipherText, 'passwrong');
                } catch(err) {
                    errorStr = err.toString();
                }
                expect(errorStr).toBe("CORRUPT: ccm: tag doesn't match");

                var passwordDigest = TLCrypto.getPasswordDigest(plainText);
                expect(passwordDigest).toBe("be2ef4971b24405df0541f95fe6158ac661e69971337ff7260b219d1056ebc3b");
                var passwordHash = TLCrypto.getPasswordHash(plainText);
                expect(passwordHash).toBe("96697409e6c2c15e94d4f03f38b8c31548e88a211887df050105f72a403695e2");
            });
        });
        //*/
    });
