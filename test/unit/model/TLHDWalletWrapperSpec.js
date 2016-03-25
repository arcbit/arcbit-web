/*
 * @fileOverview TLHDWalletWrapper tests
 */
'use strict';

define(['bitcoinjs-lib', 'model/TLHDWalletWrapper'],
    function(Bitcoin, TLHDWalletWrapper) {
//*
        describe('Test TLHDWalletWrapper', function() {
            var networkBitcoin = Bitcoin.networks.bitcoin;
            var networkTestnet = Bitcoin.networks.testnet;
            var backupPassphrase = "slogan lottery zone helmet fatigue rebuild solve best hint frown conduct ill";


            it('test IsValid bitcoin', function () {
                expect(TLHDWalletWrapper.phraseIsValid("report age service frame aspect worry nature toward vendor jungle grit grit")).toBe(false);
                expect(TLHDWalletWrapper.phraseIsValid("I'm sorry, Dave. I'm afraid I can't do that")).toBe(false);

                var network = networkBitcoin;

                expect(TLHDWalletWrapper.isValidExtendedPrivateKey("xprv9s21ZrQH143K31xYSDQpPDxsXRTUcvj2iNHm5NUtrGiGG5e2DtALGdso3pGz6ssrdK4PFmM8NSpSBHNqPqm55Qn3LqFtT2emdEXVYsCzC2U", network)).toBe(true);
                expect(TLHDWalletWrapper.isValidExtendedPrivateKey("xpub661MyMwAqRbcFW31YEwpkMuc5THy2PSt5bDMsktWQcFF8syAmRUapSCGu8ED9W6oDMSgv6Zz8idoc4a6mr8BDzTJY47LJhkJ8UB7WEGuduB", network)).toBe(false);

                expect(TLHDWalletWrapper.isValidExtendedPublicKey("xpub661MyMwAqRbcFW31YEwpkMuc5THy2PSt5bDMsktWQcFF8syAmRUapSCGu8ED9W6oDMSgv6Zz8idoc4a6mr8BDzTJY47LJhkJ8UB7WEGuduB", network)).toBe(true);
                expect(TLHDWalletWrapper.isValidExtendedPublicKey("xprv9s21ZrQH143K31xYSDQpPDxsXRTUcvj2iNHm5NUtrGiGG5e2DtALGdso3pGz6ssrdK4PFmM8NSpSBHNqPqm55Qn3LqFtT2emdEXVYsCzC2U", network)).toBe(false);
                expect(TLHDWalletWrapper.isValidExtendedPrivateKey("I'm sorry, Dave. I'm afraid I can't do that", network)).toBe(false);
                expect(TLHDWalletWrapper.isValidExtendedPublicKey("I'm sorry, Dave. I'm afraid I can't do that", network)).toBe(false);

                expect(TLHDWalletWrapper.isValidExtendedPrivateKey("tprv8ghHTunGi9gpD75TviQkXEQGpj8geMySh6YUndnWspdBuUEk3KUENtftKJQuCpWyVNhzzL6zroqKWnrNWANmRkW9pfVg7vnX2U56nrK2gmU", network)).toBe(false);
                expect(TLHDWalletWrapper.isValidExtendedPublicKey("tpubDDPKcKpWrXNV6a7FpN5Lve4PPkecohAMGQ9G59ppJ6RajxVWfiHpZPHkVRvuLx7hDdQjUBYRUeNZRAN5dn9FnbBCE14f4QNaMyyoCqbdkeN", network)).toBe(false);

                expect(TLHDWalletWrapper.isValidExtendedPublicKey("tprv8ghHTunGi9gpD75TviQkXEQGpj8geMySh6YUndnWspdBuUEk3KUENtftKJQuCpWyVNhzzL6zroqKWnrNWANmRkW9pfVg7vnX2U56nrK2gmU", network)).toBe(false);
                expect(TLHDWalletWrapper.isValidExtendedPrivateKey("tpubDDPKcKpWrXNV6a7FpN5Lve4PPkecohAMGQ9G59ppJ6RajxVWfiHpZPHkVRvuLx7hDdQjUBYRUeNZRAN5dn9FnbBCE14f4QNaMyyoCqbdkeN", network)).toBe(false);
            });
            it('test IsValid testnet', function () {
                var network = networkTestnet;
                expect(TLHDWalletWrapper.isValidExtendedPrivateKey("tprv8ghHTunGi9gpD75TviQkXEQGpj8geMySh6YUndnWspdBuUEk3KUENtftKJQuCpWyVNhzzL6zroqKWnrNWANmRkW9pfVg7vnX2U56nrK2gmU", network)).toBe(true);
                expect(TLHDWalletWrapper.isValidExtendedPrivateKey("tpubDDPKcKpWrXNV6a7FpN5Lve4PPkecohAMGQ9G59ppJ6RajxVWfiHpZPHkVRvuLx7hDdQjUBYRUeNZRAN5dn9FnbBCE14f4QNaMyyoCqbdkeN", network)).toBe(false);

                expect(TLHDWalletWrapper.isValidExtendedPublicKey("tpubDDPKcKpWrXNV6a7FpN5Lve4PPkecohAMGQ9G59ppJ6RajxVWfiHpZPHkVRvuLx7hDdQjUBYRUeNZRAN5dn9FnbBCE14f4QNaMyyoCqbdkeN", network)).toBe(true);
                expect(TLHDWalletWrapper.isValidExtendedPublicKey("tprv8ghHTunGi9gpD75TviQkXEQGpj8geMySh6YUndnWspdBuUEk3KUENtftKJQuCpWyVNhzzL6zroqKWnrNWANmRkW9pfVg7vnX2U56nrK2gmU", network)).toBe(false);
                expect(TLHDWalletWrapper.isValidExtendedPrivateKey("I'm sorry, Dave. I'm afraid I can't do that", network)).toBe(false);
                expect(TLHDWalletWrapper.isValidExtendedPublicKey("I'm sorry, Dave. I'm afraid I can't do that", network)).toBe(false);

                expect(TLHDWalletWrapper.isValidExtendedPrivateKey("xprv9s21ZrQH143K31xYSDQpPDxsXRTUcvj2iNHm5NUtrGiGG5e2DtALGdso3pGz6ssrdK4PFmM8NSpSBHNqPqm55Qn3LqFtT2emdEXVYsCzC2U", network)).toBe(false);
                expect(TLHDWalletWrapper.isValidExtendedPublicKey("xprv9s21ZrQH143K31xYSDQpPDxsXRTUcvj2iNHm5NUtrGiGG5e2DtALGdso3pGz6ssrdK4PFmM8NSpSBHNqPqm55Qn3LqFtT2emdEXVYsCzC2U", network)).toBe(false);

                expect(TLHDWalletWrapper.isValidExtendedPublicKey("xpub661MyMwAqRbcFW31YEwpkMuc5THy2PSt5bDMsktWQcFF8syAmRUapSCGu8ED9W6oDMSgv6Zz8idoc4a6mr8BDzTJY47LJhkJ8UB7WEGuduB", network)).toBe(false);
                expect(TLHDWalletWrapper.isValidExtendedPrivateKey("xpub661MyMwAqRbcFW31YEwpkMuc5THy2PSt5bDMsktWQcFF8syAmRUapSCGu8ED9W6oDMSgv6Zz8idoc4a6mr8BDzTJY47LJhkJ8UB7WEGuduB", network)).toBe(false);
            });

            it('test TLHDWalletWrapper bitcoin', function () {
                var network = networkBitcoin;

                expect(TLHDWalletWrapper.phraseIsValid(backupPassphrase)).toBe(true);
                var masterHex = TLHDWalletWrapper.getMasterHex(backupPassphrase);
                expect(masterHex).toBe("ae3ff5936bf70293eda11b5ea5ee9585fe9b22c9a80b610ee37251a22120e970c75a18bbd95219a0348c7dee40eeb44a4d2480900be8f931d0cf85203f9d94ce");

                var extendPrivKey = TLHDWalletWrapper.getExtendPrivKey(masterHex, 0, network);
                expect(extendPrivKey).toBe("xprv9z2LgaTwJsrjcHqwG9ZFManHWbiUQqwSMYdMvDN4Pr8i7sVf3x8Us9JSQ8FFCT8f7wBDzEVEhTFX3wJdNx2pchEZJ2HNTa4U7NKgM9uWoK6");
                var extendPubKey = TLHDWalletWrapper.getExtendPubKey(extendPrivKey, network);
                expect(extendPubKey).toBe("xpub6D1h65zq9FR2pmvQNB6Fiij24dYxpJfHimYxibmfxBfgzfpobVSjQwcvFPr7pTATRisprc2YwYYWiysUEvJ1u9iuAQKMNsiLn2PPSrtVFt6");
                var stealthAddress = TLHDWalletWrapper.getStealthAddress(extendPrivKey, network == networkTestnet);
                expect(stealthAddress['stealthAddress']).toBe("vJmuQKhaULxxLGKG5QiTkg2xhMibdauFTHnwMeNFgrVpnLr8ZcasPzt8QFcbhJDQJ2Wi2wExmEQ73xnzqR9kXLnaWVkBac6dj7iv9S");
                expect(stealthAddress['scanPriv']).toBe("1e47179452fed4b73b2fd7c5ce3516aadf64c5217c67f5c556e5a1dc1908d047");
                expect(stealthAddress['spendPriv']).toBe("365d66d8bd67fd40e98df439861922bf8ee507725d9dbcf479d4ad49b9177858");

                var mainAddressIndex0 = [0,0];
                var mainAddress0 = TLHDWalletWrapper.getAddress(extendPubKey, mainAddressIndex0, network);
                expect(mainAddress0).toBe("1K7fXZeeQydcUvbsfvkMSQmiacV5sKRYQz");
                var mainPrivKey0 = TLHDWalletWrapper.getPrivateKey(extendPrivKey, mainAddressIndex0, network);
                expect(mainPrivKey0).toBe("KwJhkmrjjg3AEX5gvccNAHCDcXnQLwzyZshnp5yK7vXz1mHKqDDq");

                var mainAddressIndex1 = [0,1];
                var mainAddress1 = TLHDWalletWrapper.getAddress(extendPubKey, mainAddressIndex1, network);
                expect(mainAddress1).toBe("12eQLjACXw6XwfGF9kqBwy9U7Se8qGoBuq");
                var mainPrivKey1 = TLHDWalletWrapper.getPrivateKey(extendPrivKey, mainAddressIndex1, network);
                expect(mainPrivKey1).toBe("KwpCsb3wBGk7E1M9EXcZWZhRoKBoZLNc63RsSP4YspUR53Ndefyr");

                var changeAddressIndex0 = [1,0];
                var changeAddress0 = TLHDWalletWrapper.getAddress(extendPubKey, changeAddressIndex0, network);
                expect(changeAddress0).toBe("1CvpGn9VxVY1nsWWL3MSWRYaBHdNkCDbmv");
                var changePrivKey0 = TLHDWalletWrapper.getPrivateKey(extendPrivKey, changeAddressIndex0, network);
                expect(changePrivKey0).toBe("L33guNrQHMXdpFd9jpjo2mQzddwLUgUrNzK3KqAM83D9ZU1H5NDN");

                var changeAddressIndex1 = [1,1];
                var changeAddress1 = TLHDWalletWrapper.getAddress(extendPubKey, changeAddressIndex1, network);
                expect(changeAddress1).toBe("17vnH8d1fBbjX7GZx727X2Y6dheaid2NUR");
                var changePrivKey1 = TLHDWalletWrapper.getPrivateKey(extendPrivKey, changeAddressIndex1, network);
                expect(changePrivKey1).toBe("KwiMiFtWv1PXNN3zV67TC59tWJxPbeagMJU1SSr3uLssAC82UKhf");
            });

            it('test TLHDWalletWrapper testnet', function () {
                var network = networkTestnet;

                expect(TLHDWalletWrapper.phraseIsValid(backupPassphrase)).toBe(true);
                var masterHex = TLHDWalletWrapper.getMasterHex(backupPassphrase);
                expect(masterHex).toBe("ae3ff5936bf70293eda11b5ea5ee9585fe9b22c9a80b610ee37251a22120e970c75a18bbd95219a0348c7dee40eeb44a4d2480900be8f931d0cf85203f9d94ce");

                var extendPrivKey = TLHDWalletWrapper.getExtendPrivKey(masterHex, 0, network);
                expect(extendPrivKey).toBe("tprv8ghHTunGi9gpD75TviQkXEQGpj8geMySh6YUndnWspdBuUEk3KUENtftKJQuCpWyVNhzzL6zroqKWnrNWANmRkW9pfVg7vnX2U56nrK2gmU");
                var extendPubKey = TLHDWalletWrapper.getExtendPubKey(extendPrivKey, network);
                expect(extendPubKey).toBe("tpubDDPKcKpWrXNV6a7FpN5Lve4PPkecohAMGQ9G59ppJ6RajxVWfiHpZPHkVRvuLx7hDdQjUBYRUeNZRAN5dn9FnbBCE14f4QNaMyyoCqbdkeN");
                var stealthAddress = TLHDWalletWrapper.getStealthAddress(extendPrivKey, network == networkTestnet);
                expect(stealthAddress['stealthAddress']).toBe("waPVZhcLGRMy3vnt9b5JSextRPuoeaRMfVcCLJxLdyjkAHFQproqBuApbwY7FFo41bTqBNnbbzoELmjys2eTNLXPRieptnwGymfqv3");
                expect(stealthAddress['scanPriv']).toBe("1e47179452fed4b73b2fd7c5ce3516aadf64c5217c67f5c556e5a1dc1908d047");
                expect(stealthAddress['spendPriv']).toBe("365d66d8bd67fd40e98df439861922bf8ee507725d9dbcf479d4ad49b9177858");

                var mainAddressIndex0 = [0,0];
                var mainAddress0 = TLHDWalletWrapper.getAddress(extendPubKey, mainAddressIndex0, network);
                expect(mainAddress0).toBe("mydcpcjdE14sG35VPVijGKz3Sc5nsbbeo7");
                var mainPrivKey0 = TLHDWalletWrapper.getPrivateKey(extendPrivKey, mainAddressIndex0, network);
                expect(mainPrivKey0).toBe("cMfhDgrbAjjRPxYxK2RVXbhHEm5p1Q6fdurFvWRpd3BzGWQYiFw6");

                var mainAddressIndex1 = [0,1];
                var mainAddress1 = TLHDWalletWrapper.getAddress(extendPubKey, mainAddressIndex1, network);
                expect(mainAddress1).toBe("mhAMdnFBLxXnimjrsKoZmtMnySEqo6Q7sk");
                var mainPrivKey1 = TLHDWalletWrapper.getPrivateKey(extendPrivKey, mainAddressIndex1, network);
                expect(mainPrivKey1).toBe("cNBCLW3ncLSNPSpQcwRgstCVRYVDDnUJA5aLYoX4Nw8RKnSk1tYZ");

                var changeAddressIndex0 = [1,0];
                var changeAddress0 = TLHDWalletWrapper.getAddress(extendPubKey, changeAddressIndex0, network);
                expect(changeAddress0).toBe("msSmZqEUmWyGZyz83cKpLLku3HE5eQSwyL");
                var changePrivKey0 = TLHDWalletWrapper.getPrivateKey(extendPrivKey, changeAddressIndex0, network);
                expect(changePrivKey0).toBe("cTQgNHrFiRDtyh6R8EYvQ5v4FsEk98aYT2TWSFcrd9s9pD5Y6iTE");

                var changeAddressIndex1 = [1,1];
                var changeAddress1 = TLHDWalletWrapper.getAddress(extendPubKey, changeAddressIndex1, network);
                expect(changeAddress1).toBe("mnSjaBhzUD2zJDkBffzVLwkRVhFHahwU7v");
                var changePrivKey1 = TLHDWalletWrapper.getPrivateKey(extendPrivKey, changeAddressIndex1, network);
                expect(changePrivKey1).toBe("cN5MBAtNM55nXoXFsVvaZPex8YFoG6gNRLcUYsJZQTXsQwAQ86wM");
            });
        });
        //*/
    });
