/*
 * @fileOverview TLSpaghettiGodSend tests
 */
'use strict';

define(['bitcoinjs-lib', 'model/TLWallet', 'model/TLCoin', 'model/TLAppDelegate', 'model/TLSpaghettiGodSend', 'model/TLHDWalletWrapper',
        'model/TLBitcoinJSWrapper', 'model/TLWalletJson'],
    function(Bitcoin, TLWallet, TLCoin, TLAppDelegate, TLSpaghettiGodSend, TLHDWalletWrapper, TLBitcoinJSWrapper,
             TLWalletJson) {
        //*
        describe('test TLSpaghettiGodSend', function() {
            var isTestnet = false;
            var network = TLBitcoinJSWrapper.getNetwork(isTestnet);

            var backupPassphrase = "slogan lottery zone helmet fatigue rebuild solve best hint frown conduct ill";
            var masterHex = TLHDWalletWrapper.getMasterHex(backupPassphrase);
            var extendPrivKey = TLHDWalletWrapper.getExtendPrivKey(masterHex, 0);
            var extendPubKey = TLHDWalletWrapper.getExtendPubKey(extendPrivKey);
            var mainAddressIndex0 = [0, 0];
            var mainAddress = TLHDWalletWrapper.getAddress(extendPubKey, mainAddressIndex0, network);
            var changeAddressIndex0 = [1, 0];
            var changeAddress = TLHDWalletWrapper.getAddress(extendPubKey, changeAddressIndex0, network);

            var mockWalletPayload = {
                "version": '1',
                "payload": {
                    "wallets": [
                        {
                            "hd_wallets": [
                                {
                                    "name": "default",
                                    "master_hex": 0,
                                    "current_account_id": 0,
                                    "passphrase": backupPassphrase,
                                    "max_account_id": 1,
                                    "accounts": [
                                        {
                                            "name": "Account 1",
                                            "account_idx": 0,
                                            "xpub": extendPubKey,
                                            "xprv": extendPrivKey,
                                            "stealth_addrs": [
                                                {
                                                    "scan_key": "NOTUSED",
                                                    "spend_key": "NOTUSED",
                                                    "stealth_addr": "NOTUSED",
                                                    "servers": {
                                                        "www.arcbit.net": {
                                                            "watching": 1
                                                        }
                                                    },
                                                    "payments": [],
                                                    "last_tx_time": 0,
                                                }
                                            ],
                                            "status": 1,
                                            "needs_recovering": false,
                                            "main_addrs": [{
                                                "addr": mainAddress,
                                                "stat": 1,
                                                "idx": 0
                                            }],
                                            "change_addrs": [{
                                                "addr": changeAddress,
                                                "stat": 1,
                                                "idx": 0
                                            }],
                                            "min_change_addr_idx": 0,
                                            "min_main_addr_idx": 0
                                        }
                                    ]
                                }
                            ],
                            "imports": {
                                "imported_accounts": [],
                                "watch_only_accounts": [],
                                "imported_private_keys": [],
                                "watch_only_addrs": []
                            },
                            "testnet": false,
                            "addr_book": [],
                            "tx_tags": {},
                            "preferences": {
                                "tx_fee": "0.00001",
                                "block_explorer_urls": {
                                    "blockchain.info": ["https://blockchain.info/"],
                                    "insight": ["https://insight.bitpay.com/", "https://blockexplorer.com"],
                                    "toshi": ["https://bitcoin.toshi.io/"]
                                },
                                "block_explorer_api": 0,
                                "stealth_explorer_url": "www.arcbit.net",
                                "stealth_web_server_port": 443,
                                "stealth_web_socket_port": 443,
                                "fiat_display": "USD",
                                "display_local_currency": false
                            }
                        }
                    ]
                }
            };


            var walletObj = TLWalletJson.getEncryptedWalletJsonContainer(mockWalletPayload,
                backupPassphrase, false);

            var exchangeRate = null;
            var appDelegate = new TLAppDelegate(exchangeRate, "Wallet 1", walletObj, isTestnet);
            var walletDict = appDelegate.initAppDelegate(backupPassphrase);

            var accountsArray = appDelegate.appWallet.getAccountObjectArray();
            var accountObject = accountsArray[0];

            var godSend = new TLSpaghettiGodSend(appDelegate);
            godSend.setOnlyFromAccount(accountObject);

            var mockScript = TLBitcoinJSWrapper.getStandardPubKeyHashScriptFromAddress(mainAddress);

            function mockUnspentOutput(txid, value, txOutputN) {
                return {
                    "tx_hash": TLBitcoinJSWrapper.reverseHexString(txid),
                    "tx_hash_big_endian": txid,
                    "tx_output_n": txOutputN,
                    "script": mockScript,
                    "value": value,
                    "confirmations": 6
                }
            }

            it('test testCreateSignedSerializedTransactionHexAndBIP69_1', function () {
                var feeAmount = TLCoin.fromString("0.00000", TLCoin.TLBitcoinDenomination.BTC);
                var toAddress = "1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv";
                var toAddress2 = "1DZTzaBHUDM7T3QvUKBz4qXMRpkg8jsfB5";
                var toAmount = TLCoin.fromString("1", TLCoin.TLBitcoinDenomination.BTC);
                var toAmount2 = TLCoin.fromString("24", TLCoin.TLBitcoinDenomination.BTC);
                var txid0 = "35288d269cee1941eaebb2ea85e32b42cdb2b04284a56d8b14dcc3f5c65d6055";
                var txid1 = "35288d269cee1941eaebb2ea85e32b42cdb2b04284a56d8b14dcc3f5c65d6055";

                var unspentOutput0 = mockUnspentOutput(txid0, 100000000, 0);
                var unspentOutput1 = mockUnspentOutput(txid1, 2400000000, 1);


                function testCreateSignedSerializedTransactionHexAndBIP69_1_1() {
                    var toAddressesAndAmounts = [
                        {"address": toAddress, "amount": toAmount},
                        {"address": toAddress2, "amount": toAmount2}
                    ];
                    accountObject.unspentOutputs = [
                        unspentOutput0,
                        unspentOutput1
                    ];
                    var ret = godSend.createSignedSerializedTransactionHex(toAddressesAndAmounts, feeAmount, function (errorString) {
                        console.log('createSignedSerializedTransactionHex errorString ' + errorString);
                    });

                    var txHex = ret[0]["txHex"];
                    var txHash = ret[0]["txHash"];
                    var realToAddresses = ret[1];
                    expect(txHash).toBe("fbacfede55dc6a779782ba8fa22813860b7ef07d82c3abebb8f290b3141bf965");
                    expect(txHex).toBe("010000000255605dc6f5c3dc148b6da58442b0b2cd422be385eab2ebea4119ee9c268d2835000000006a4730440220449b1f95687bf469fb954bcdbbc0ae362fe9bd6ba88c5b4dd227d9a5c37eb82a02203440bf6b4178786913a197344d0999a7d98d246099dcddf4bf9b24473a4e7a9a0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff55605dc6f5c3dc148b6da58442b0b2cd422be385eab2ebea4119ee9c268d2835010000006a47304402201f6a4a87d0584157471210c1e126e64e52f565e950feb80045fc855829df3da4022059fd75fe51262aa7b7f214534357ed2786a9b3dcb12493112027711aebc8478a0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff0200e1f505000000001976a914c73015fa62d972ebb3b241fe8c936657b13fabd788ac00180d8f000000001976a91489c55a3ca6676c9f7f260a6439c83249b747380288ac00000000");

                    var transaction = Bitcoin.Transaction.fromHex(txHex);
                    expect(transaction.ins.length).toBe(2);
                    expect(transaction.ins[0].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid0));
                    expect(transaction.ins[0].index).toBe(0);
                    expect(transaction.ins[1].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid1));
                    expect(transaction.ins[1].index).toBe(1);

                    expect(transaction.outs.length).toBe(2);
                    var script0 = transaction.outs[0].script.buffer.toString('hex');
                    expect(script0).toBe("76a914c73015fa62d972ebb3b241fe8c936657b13fabd788ac");
                    expect(transaction.outs[0].value).toBe(100000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script0)).toBe("1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv");
                    var script1 = transaction.outs[1].script.buffer.toString('hex');
                    expect(script1).toBe("76a91489c55a3ca6676c9f7f260a6439c83249b747380288ac");
                    expect(transaction.outs[1].value).toBe(2400000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script1)).toBe("1DZTzaBHUDM7T3QvUKBz4qXMRpkg8jsfB5");

                    expect(realToAddresses.length).toBe(2);
                    expect(realToAddresses[0]).toBe("1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv");
                    expect(realToAddresses[1]).toBe("1DZTzaBHUDM7T3QvUKBz4qXMRpkg8jsfB5");
                }

                function testCreateSignedSerializedTransactionHexAndBIP69_1_2() {
                    var toAddressesAndAmounts = [
                        {"address": toAddress2, "amount": toAmount2},
                        {"address": toAddress, "amount": toAmount}
                    ];
                    accountObject.unspentOutputs = [
                        unspentOutput1,
                        unspentOutput0
                    ];
                    var ret = godSend.createSignedSerializedTransactionHex(toAddressesAndAmounts, feeAmount, function (errorString) {
                        console.log('createSignedSerializedTransactionHex errorString ' + errorString);
                    });

                    var txHex = ret[0]["txHex"];
                    var txHash = ret[0]["txHash"];
                    var realToAddresses = ret[1];
                    expect(txHash).toBe("fbacfede55dc6a779782ba8fa22813860b7ef07d82c3abebb8f290b3141bf965");
                    expect(txHex).toBe("010000000255605dc6f5c3dc148b6da58442b0b2cd422be385eab2ebea4119ee9c268d2835000000006a4730440220449b1f95687bf469fb954bcdbbc0ae362fe9bd6ba88c5b4dd227d9a5c37eb82a02203440bf6b4178786913a197344d0999a7d98d246099dcddf4bf9b24473a4e7a9a0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff55605dc6f5c3dc148b6da58442b0b2cd422be385eab2ebea4119ee9c268d2835010000006a47304402201f6a4a87d0584157471210c1e126e64e52f565e950feb80045fc855829df3da4022059fd75fe51262aa7b7f214534357ed2786a9b3dcb12493112027711aebc8478a0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff0200e1f505000000001976a914c73015fa62d972ebb3b241fe8c936657b13fabd788ac00180d8f000000001976a91489c55a3ca6676c9f7f260a6439c83249b747380288ac00000000");

                    var transaction = Bitcoin.Transaction.fromHex(txHex);
                    expect(transaction.ins.length).toBe(2);
                    expect(transaction.ins[0].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid0));
                    expect(transaction.ins[0].index).toBe(0);
                    expect(transaction.ins[1].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid1));
                    expect(transaction.ins[1].index).toBe(1);

                    expect(transaction.outs.length).toBe(2);
                    var script0 = transaction.outs[0].script.buffer.toString('hex');
                    expect(script0).toBe("76a914c73015fa62d972ebb3b241fe8c936657b13fabd788ac");
                    expect(transaction.outs[0].value).toBe(100000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script0)).toBe("1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv");
                    var script1 = transaction.outs[1].script.buffer.toString('hex');
                    expect(script1).toBe("76a91489c55a3ca6676c9f7f260a6439c83249b747380288ac");
                    expect(transaction.outs[1].value).toBe(2400000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script1)).toBe("1DZTzaBHUDM7T3QvUKBz4qXMRpkg8jsfB5");

                    expect(realToAddresses.length).toBe(2);
                    expect(realToAddresses[0]).toBe("1DZTzaBHUDM7T3QvUKBz4qXMRpkg8jsfB5");
                    expect(realToAddresses[1]).toBe("1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv");
                }

                testCreateSignedSerializedTransactionHexAndBIP69_1_1();
                testCreateSignedSerializedTransactionHexAndBIP69_1_2();
            });

            it('test testCreateSignedSerializedTransactionHexAndBIP69_2', function () {
                var feeAmount = TLCoin.fromString("0.00002735", TLCoin.TLBitcoinDenomination.BTC);
                var toAddress = "17nFgS1YaDPnXKMPQkZVdNQqZnVqRgBwnZ";
                var toAddress2 = "19Nrc2Xm226xmSbeGZ1BVtX7DUm4oCx8Pm";
                var toAmount = TLCoin.fromString("4.00057456", TLCoin.TLBitcoinDenomination.BTC);
                var toAmount2 = TLCoin.fromString("400", TLCoin.TLBitcoinDenomination.BTC);

                var txid0 = "0e53ec5dfb2cb8a71fec32dc9a634a35b7e24799295ddd5278217822e0b31f57";
                var txid1 = "26aa6e6d8b9e49bb0630aac301db6757c02e3619feb4ee0eea81eb1672947024";
                var txid2 = "28e0fdd185542f2c6ea19030b0796051e7772b6026dd5ddccd7a2f93b73e6fc2";
                var txid3 = "381de9b9ae1a94d9c17f6a08ef9d341a5ce29e2e60c36a52d333ff6203e58d5d";
                var txid4 = "3b8b2f8efceb60ba78ca8bba206a137f14cb5ea4035e761ee204302d46b98de2";
                var txid5 = "402b2c02411720bf409eff60d05adad684f135838962823f3614cc657dd7bc0a";
                var txid6 = "54ffff182965ed0957dba1239c27164ace5a73c9b62a660c74b7b7f15ff61e7a";
                var txid7 = "643e5f4e66373a57251fb173151e838ccd27d279aca882997e005016bb53d5aa";
                var txid8 = "6c1d56f31b2de4bfc6aaea28396b333102b1f600da9c6d6149e96ca43f1102b1";
                var txid9 = "7a1de137cbafb5c70405455c49c5104ca3057a1f1243e6563bb9245c9c88c191";
                var txid10 = "7d037ceb2ee0dc03e82f17be7935d238b35d1deabf953a892a4507bfbeeb3ba4";
                var txid11 = "a5e899dddb28776ea9ddac0a502316d53a4a3fca607c72f66c470e0412e34086";
                var txid12 = "b4112b8f900a7ca0c8b0e7c4dfad35c6be5f6be46b3458974988e1cdb2fa61b8";
                var txid13 = "bafd65e3c7f3f9fdfdc1ddb026131b278c3be1af90a4a6ffa78c4658f9ec0c85";
                var txid14 = "de0411a1e97484a2804ff1dbde260ac19de841bebad1880c782941aca883b4e9";
                var txid15 = "f0a130a84912d03c1d284974f563c5949ac13f8342b8112edff52971599e6a45";
                var txid16 = "f320832a9d2e2452af63154bc687493484a0e7745ebd3aaf9ca19eb80834ad60";

                var unspentOutput0 = mockUnspentOutput(txid0, 2529937904, 0);
                var unspentOutput1 = mockUnspentOutput(txid1, 2521656792, 1);
                var unspentOutput2 = mockUnspentOutput(txid2, 2509683086, 0);
                var unspentOutput3 = mockUnspentOutput(txid3, 2506060377, 1);
                var unspentOutput4 = mockUnspentOutput(txid4, 2510645247, 0);
                var unspentOutput5 = mockUnspentOutput(txid5, 2502325820, 1);
                var unspentOutput6 = mockUnspentOutput(txid6, 2525953727, 1);
                var unspentOutput7 = mockUnspentOutput(txid7, 2507302856, 0);
                var unspentOutput8 = mockUnspentOutput(txid8, 2534185804, 1);
                var unspentOutput9 = mockUnspentOutput(txid9, 136219905, 0);
                var unspentOutput10 = mockUnspentOutput(txid10, 2502901118, 1);
                var unspentOutput11 = mockUnspentOutput(txid11, 2527569363, 0);
                var unspentOutput12 = mockUnspentOutput(txid12, 2516268302, 0);
                var unspentOutput13 = mockUnspentOutput(txid13, 2521794404, 0);
                var unspentOutput14 = mockUnspentOutput(txid14, 2520533680, 1);
                var unspentOutput15 = mockUnspentOutput(txid15, 2513840095, 0);
                var unspentOutput16 = mockUnspentOutput(txid16, 2513181711, 0);


                function testCreateSignedSerializedTransactionHexAndBIP69_2_1() {
                    var toAddressesAndAmounts = [
                        {"address": toAddress, "amount": toAmount},
                        {"address": toAddress2, "amount": toAmount2}
                    ];
                    accountObject.unspentOutputs = [
                        unspentOutput0,
                        unspentOutput1,
                        unspentOutput2,
                        unspentOutput3,
                        unspentOutput4,
                        unspentOutput5,
                        unspentOutput6,
                        unspentOutput7,
                        unspentOutput8,
                        unspentOutput9,
                        unspentOutput10,
                        unspentOutput11,
                        unspentOutput12,
                        unspentOutput13,
                        unspentOutput14,
                        unspentOutput15,
                        unspentOutput16
                    ];
                    var ret = godSend.createSignedSerializedTransactionHex(toAddressesAndAmounts, feeAmount, function (errorString) {
                        console.log('createSignedSerializedTransactionHex errorString ' + errorString);
                    });

                    var txHex = ret[0]["txHex"];
                    var txHash = ret[0]["txHash"];
                    var realToAddresses = ret[1];
                    expect(txHash).toBe("0656add012962ef3bdd11eaf88347b78a2c4adb08fe8b95f79a8b8a4fe862132");
                    expect(txHex).toBe("0100000011571fb3e02278217852dd5d299947e2b7354a639adc32ec1fa7b82cfb5dec530e000000006b483045022100b28348624779833117dc8ae73bcb649528ad6edf9d5b48018c4488dbc9b9fa3702201f8b0e1707bdfa3438d6c1353b62e3a01cb0b7b4ee5e7ef93e7b2f563ead66a30121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff2470947216eb81ea0eeeb4fe19362ec05767db01c3aa3006bb499e8b6d6eaa26010000006a4730440220679db98b1e5b17a57acc78e7271c357130fd8b6d8d2072880429d05630c5cc2802205fb88f764053185d610ae8041907bdb85f711a51f5602bb663b744e786fd78700121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffc26f3eb7932f7acddc5ddd26602b77e7516079b03090a16e2c2f5485d1fde028000000006a47304402205031699fc96af02637f1ed7120c0e380f65370824f6af5cd37baf391f8188f73022026f5ba7a7f31fc3590f1e4dce50f12cc2122ce3fe30d187f11c3922ce3b22d0a0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff5d8de50362ff33d3526ac3602e9ee25c1a349def086a7fc1d9941aaeb9e91d38010000006b483045022100fefda0743cc428b17e688c65d226e899af8b0d5a6f05d0944f9c67257fa5a15a02207baa0a95d88b98b0b669cab8342cc43bc992daf3be41c4ba40de77453ed3fb220121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffe28db9462d3004e21e765e03a45ecb147f136a20ba8bca78ba60ebfc8e2f8b3b000000006b483045022100a54a4e0a3b476c855273a0aa6d97f5995e78a83cad59c28cda786b49a14f370602202cce0aadf128986b6448ad7f3288f95c9c5467ba01d16e94d807db587e481fe30121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff0abcd77d65cc14363f8262898335f184d6da5ad060ff9e40bf201741022c2b40010000006a4730440220636b2a05ef164457c9b8ee0f364c308a7ef8a0f5f7b01d6633ace40803a6fd7902205f052f39e940d2b8d797a5259ee35d0596a0dbfd199799722d95a895308bd1f10121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff7a1ef65ff1b7b7740c662ab6c9735ace4a16279c23a1db5709ed652918ffff54010000006b4830450221008e3f42e8e5d45712efe14c17ba199724e1d2bcaa2a459ede155b2df89d1b8c7902205260062b1eb6595a43180f0b40307467f4fe2f67138c2aed47d21dac739f4a770121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffaad553bb1650007e9982a8ac79d227cd8c831e1573b11f25573a37664e5f3e64000000006a47304402204b3a8b40ea4bd092ce05ae5a55704d98ceee485b87e9d9bbc1dcc0956a2230bb022043b2660c1513b029038a3f2492c2d0d39b45c04a14b1143ede43abb6832d6f910121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffb102113fa46ce949616d9cda00f6b10231336b3928eaaac6bfe42d1bf3561d6c010000006a4730440220651a1d62ba88ac05790bab2ead82483e99a748965cd8f1887c943c62c67786de022002bc57e36c7668c8e5d4c02e1baed3491b30d91e53633b807ca950b8bfad6fe90121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff91c1889c5c24b93b56e643121f7a05a34c10c5495c450504c7b5afcb37e11d7a000000006b483045022100ea05603d2944228bd2231354b1a6e6d106a803d7d52e8a290232b9769629c9a502204125264bb9d2cfd2db5455044d58a7b8ea8e0c7c88870def8c0fac2c559c5cfc0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffa43bebbebf07452a893a95bfea1d5db338d23579be172fe803dce02eeb7c037d010000006b483045022100fe8ce378ed72b0829805dde89cb16d2f6722f8b4128ee07f6ef064eaa4b607f702206400a9816e120e3e7427f4e83518b2822f010c219bcb758560ff280aae1cbe420121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff8640e312040e476cf6727c60ca3f4a3ad51623500aacdda96e7728dbdd99e8a5000000006a47304402203cce0a54d3314decb5adf1d9dbe5f887eb779daf6d4d2ce463435181da6cc72302206104213df446b9fc78d598c8425c82ca9b0952fab48a9edecb382ee5e68c11fe0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffb861fab2cde188499758346be46b5fbec635addfc4e7b0c8a07c0a908f2b11b4000000006a4730440220120d5d6672695c9ad3e72049da00be123bab74971386953b38409ff52989ce2502202b8702ba2d7fe90fc35aef52585c664865ae746d9e4242955b7ece22d89ad1ca0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff850cecf958468ca7ffa6a490afe13b8c271b1326b0ddc1fdfdf9f3c7e365fdba000000006a4730440220282a14909d8ed766441c4766a574af0fc20e1b587e545e1943429670457b959602207e4c7503ae3c9de83865d0972fbb18cd7c9630023347d6eba45963f0670ef7e70121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffe9b483a8ac4129780c88d1babe41e89dc10a26dedbf14f80a28474e9a11104de010000006b483045022100ec3744090e0603690319768ef234071410224230cc32e4731e50f9e8a05a6a5802203a1a8f7380e83fd1b61f4fd775aa6410d2e87d018b820aab4e98e1a8de0715f10121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff456a9e597129f5df2e11b842833fc19a94c563f57449281d3cd01249a830a1f0000000006a473044022060b06dcb2550beb9dd4181a45566ccf0ba41040d9003aa83c02fb63c4f9cbd8a02203c577c070c69382cfb05c74275590e3de6dcb77ce929b0d771f314ffa889f47c0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff60ad3408b89ea19caf3abd5e74e7a084344987c64b1563af52242e9d2a8320f3000000006b483045022100d7b08a358ce19469d369765c38d1f17ffe66151f7c9cd85757d89d4f218a9d390220418f13a4b8eb41ca471901f1ba2b1677166f90127b65b7417ad5a62d76f0b8c80121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff027064d817000000001976a9144a5fba237213a062f6f57978f796390bdcf8d01588ac00902f50090000001976a9145be32612930b8323add2212a4ec03c1562084f8488ac00000000");

                    var transaction = Bitcoin.Transaction.fromHex(txHex);
                    expect(transaction.ins.length).toBe(17);
                    expect(transaction.ins[0].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid0));
                    expect(transaction.ins[0].index).toBe(0);
                    expect(transaction.ins[1].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid1));
                    expect(transaction.ins[1].index).toBe(1);
                    expect(transaction.ins[2].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid2));
                    expect(transaction.ins[2].index).toBe(0);
                    expect(transaction.ins[3].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid3));
                    expect(transaction.ins[3].index).toBe(1);
                    expect(transaction.ins[4].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid4));
                    expect(transaction.ins[4].index).toBe(0);
                    expect(transaction.ins[5].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid5));
                    expect(transaction.ins[5].index).toBe(1);
                    expect(transaction.ins[6].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid6));
                    expect(transaction.ins[6].index).toBe(1);
                    expect(transaction.ins[7].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid7));
                    expect(transaction.ins[7].index).toBe(0);
                    expect(transaction.ins[8].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid8));
                    expect(transaction.ins[8].index).toBe(1);
                    expect(transaction.ins[9].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid9));
                    expect(transaction.ins[9].index).toBe(0);
                    expect(transaction.ins[10].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid10));
                    expect(transaction.ins[10].index).toBe(1);
                    expect(transaction.ins[11].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid11));
                    expect(transaction.ins[11].index).toBe(0);
                    expect(transaction.ins[12].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid12));
                    expect(transaction.ins[12].index).toBe(0);
                    expect(transaction.ins[13].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid13));
                    expect(transaction.ins[13].index).toBe(0);
                    expect(transaction.ins[14].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid14));
                    expect(transaction.ins[14].index).toBe(1);
                    expect(transaction.ins[15].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid15));
                    expect(transaction.ins[15].index).toBe(0);
                    expect(transaction.ins[16].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid16));
                    expect(transaction.ins[16].index).toBe(0);

                    expect(transaction.outs.length).toBe(2);
                    var script0 = transaction.outs[0].script.buffer.toString('hex');
                    expect(script0).toBe("76a9144a5fba237213a062f6f57978f796390bdcf8d01588ac");
                    expect(transaction.outs[0].value).toBe(400057456);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script0)).toBe("17nFgS1YaDPnXKMPQkZVdNQqZnVqRgBwnZ");
                    var script1 = transaction.outs[1].script.buffer.toString('hex');
                    expect(script1).toBe("76a9145be32612930b8323add2212a4ec03c1562084f8488ac");
                    expect(transaction.outs[1].value).toBe(40000000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script1)).toBe("19Nrc2Xm226xmSbeGZ1BVtX7DUm4oCx8Pm");

                    expect(realToAddresses.length).toBe(2);
                    expect(realToAddresses[0]).toBe("17nFgS1YaDPnXKMPQkZVdNQqZnVqRgBwnZ");
                    expect(realToAddresses[1]).toBe("19Nrc2Xm226xmSbeGZ1BVtX7DUm4oCx8Pm");
                }

                function testCreateSignedSerializedTransactionHexAndBIP69_2_2() {
                    var toAddressesAndAmounts = [
                        {"address": toAddress2, "amount": toAmount2},
                        {"address": toAddress, "amount": toAmount}
                    ];
                    accountObject.unspentOutputs = [
                        unspentOutput15,
                        unspentOutput2,
                        unspentOutput0,
                        unspentOutput1,
                        unspentOutput5,
                        unspentOutput3,
                        unspentOutput4,
                        unspentOutput6,
                        unspentOutput7,
                        unspentOutput9,
                        unspentOutput10,
                        unspentOutput8,
                        unspentOutput12,
                        unspentOutput11,
                        unspentOutput14,
                        unspentOutput16,
                        unspentOutput13
                    ];
                    var ret = godSend.createSignedSerializedTransactionHex(toAddressesAndAmounts, feeAmount, function (errorString) {
                        console.log('createSignedSerializedTransactionHex errorString ' + errorString);
                    });

                    var txHex = ret[0]["txHex"];
                    var txHash = ret[0]["txHash"];
                    var realToAddresses = ret[1];
                    expect(txHash).toBe("0656add012962ef3bdd11eaf88347b78a2c4adb08fe8b95f79a8b8a4fe862132");
                    expect(txHex).toBe("0100000011571fb3e02278217852dd5d299947e2b7354a639adc32ec1fa7b82cfb5dec530e000000006b483045022100b28348624779833117dc8ae73bcb649528ad6edf9d5b48018c4488dbc9b9fa3702201f8b0e1707bdfa3438d6c1353b62e3a01cb0b7b4ee5e7ef93e7b2f563ead66a30121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff2470947216eb81ea0eeeb4fe19362ec05767db01c3aa3006bb499e8b6d6eaa26010000006a4730440220679db98b1e5b17a57acc78e7271c357130fd8b6d8d2072880429d05630c5cc2802205fb88f764053185d610ae8041907bdb85f711a51f5602bb663b744e786fd78700121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffc26f3eb7932f7acddc5ddd26602b77e7516079b03090a16e2c2f5485d1fde028000000006a47304402205031699fc96af02637f1ed7120c0e380f65370824f6af5cd37baf391f8188f73022026f5ba7a7f31fc3590f1e4dce50f12cc2122ce3fe30d187f11c3922ce3b22d0a0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff5d8de50362ff33d3526ac3602e9ee25c1a349def086a7fc1d9941aaeb9e91d38010000006b483045022100fefda0743cc428b17e688c65d226e899af8b0d5a6f05d0944f9c67257fa5a15a02207baa0a95d88b98b0b669cab8342cc43bc992daf3be41c4ba40de77453ed3fb220121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffe28db9462d3004e21e765e03a45ecb147f136a20ba8bca78ba60ebfc8e2f8b3b000000006b483045022100a54a4e0a3b476c855273a0aa6d97f5995e78a83cad59c28cda786b49a14f370602202cce0aadf128986b6448ad7f3288f95c9c5467ba01d16e94d807db587e481fe30121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff0abcd77d65cc14363f8262898335f184d6da5ad060ff9e40bf201741022c2b40010000006a4730440220636b2a05ef164457c9b8ee0f364c308a7ef8a0f5f7b01d6633ace40803a6fd7902205f052f39e940d2b8d797a5259ee35d0596a0dbfd199799722d95a895308bd1f10121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff7a1ef65ff1b7b7740c662ab6c9735ace4a16279c23a1db5709ed652918ffff54010000006b4830450221008e3f42e8e5d45712efe14c17ba199724e1d2bcaa2a459ede155b2df89d1b8c7902205260062b1eb6595a43180f0b40307467f4fe2f67138c2aed47d21dac739f4a770121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffaad553bb1650007e9982a8ac79d227cd8c831e1573b11f25573a37664e5f3e64000000006a47304402204b3a8b40ea4bd092ce05ae5a55704d98ceee485b87e9d9bbc1dcc0956a2230bb022043b2660c1513b029038a3f2492c2d0d39b45c04a14b1143ede43abb6832d6f910121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffb102113fa46ce949616d9cda00f6b10231336b3928eaaac6bfe42d1bf3561d6c010000006a4730440220651a1d62ba88ac05790bab2ead82483e99a748965cd8f1887c943c62c67786de022002bc57e36c7668c8e5d4c02e1baed3491b30d91e53633b807ca950b8bfad6fe90121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff91c1889c5c24b93b56e643121f7a05a34c10c5495c450504c7b5afcb37e11d7a000000006b483045022100ea05603d2944228bd2231354b1a6e6d106a803d7d52e8a290232b9769629c9a502204125264bb9d2cfd2db5455044d58a7b8ea8e0c7c88870def8c0fac2c559c5cfc0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffa43bebbebf07452a893a95bfea1d5db338d23579be172fe803dce02eeb7c037d010000006b483045022100fe8ce378ed72b0829805dde89cb16d2f6722f8b4128ee07f6ef064eaa4b607f702206400a9816e120e3e7427f4e83518b2822f010c219bcb758560ff280aae1cbe420121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff8640e312040e476cf6727c60ca3f4a3ad51623500aacdda96e7728dbdd99e8a5000000006a47304402203cce0a54d3314decb5adf1d9dbe5f887eb779daf6d4d2ce463435181da6cc72302206104213df446b9fc78d598c8425c82ca9b0952fab48a9edecb382ee5e68c11fe0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffb861fab2cde188499758346be46b5fbec635addfc4e7b0c8a07c0a908f2b11b4000000006a4730440220120d5d6672695c9ad3e72049da00be123bab74971386953b38409ff52989ce2502202b8702ba2d7fe90fc35aef52585c664865ae746d9e4242955b7ece22d89ad1ca0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff850cecf958468ca7ffa6a490afe13b8c271b1326b0ddc1fdfdf9f3c7e365fdba000000006a4730440220282a14909d8ed766441c4766a574af0fc20e1b587e545e1943429670457b959602207e4c7503ae3c9de83865d0972fbb18cd7c9630023347d6eba45963f0670ef7e70121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffe9b483a8ac4129780c88d1babe41e89dc10a26dedbf14f80a28474e9a11104de010000006b483045022100ec3744090e0603690319768ef234071410224230cc32e4731e50f9e8a05a6a5802203a1a8f7380e83fd1b61f4fd775aa6410d2e87d018b820aab4e98e1a8de0715f10121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff456a9e597129f5df2e11b842833fc19a94c563f57449281d3cd01249a830a1f0000000006a473044022060b06dcb2550beb9dd4181a45566ccf0ba41040d9003aa83c02fb63c4f9cbd8a02203c577c070c69382cfb05c74275590e3de6dcb77ce929b0d771f314ffa889f47c0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff60ad3408b89ea19caf3abd5e74e7a084344987c64b1563af52242e9d2a8320f3000000006b483045022100d7b08a358ce19469d369765c38d1f17ffe66151f7c9cd85757d89d4f218a9d390220418f13a4b8eb41ca471901f1ba2b1677166f90127b65b7417ad5a62d76f0b8c80121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff027064d817000000001976a9144a5fba237213a062f6f57978f796390bdcf8d01588ac00902f50090000001976a9145be32612930b8323add2212a4ec03c1562084f8488ac00000000");

                    var transaction = Bitcoin.Transaction.fromHex(txHex);
                    expect(transaction.ins.length).toBe(17);
                    expect(transaction.ins[0].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid0));
                    expect(transaction.ins[0].index).toBe(0);
                    expect(transaction.ins[1].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid1));
                    expect(transaction.ins[1].index).toBe(1);
                    expect(transaction.ins[2].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid2));
                    expect(transaction.ins[2].index).toBe(0);
                    expect(transaction.ins[3].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid3));
                    expect(transaction.ins[3].index).toBe(1);
                    expect(transaction.ins[4].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid4));
                    expect(transaction.ins[4].index).toBe(0);
                    expect(transaction.ins[5].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid5));
                    expect(transaction.ins[5].index).toBe(1);
                    expect(transaction.ins[6].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid6));
                    expect(transaction.ins[6].index).toBe(1);
                    expect(transaction.ins[7].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid7));
                    expect(transaction.ins[7].index).toBe(0);
                    expect(transaction.ins[8].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid8));
                    expect(transaction.ins[8].index).toBe(1);
                    expect(transaction.ins[9].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid9));
                    expect(transaction.ins[9].index).toBe(0);
                    expect(transaction.ins[10].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid10));
                    expect(transaction.ins[10].index).toBe(1);
                    expect(transaction.ins[11].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid11));
                    expect(transaction.ins[11].index).toBe(0);
                    expect(transaction.ins[12].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid12));
                    expect(transaction.ins[12].index).toBe(0);
                    expect(transaction.ins[13].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid13));
                    expect(transaction.ins[13].index).toBe(0);
                    expect(transaction.ins[14].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid14));
                    expect(transaction.ins[14].index).toBe(1);
                    expect(transaction.ins[15].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid15));
                    expect(transaction.ins[15].index).toBe(0);
                    expect(transaction.ins[16].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid16));
                    expect(transaction.ins[16].index).toBe(0);

                    expect(transaction.outs.length).toBe(2);
                    var script0 = transaction.outs[0].script.buffer.toString('hex');
                    expect(script0).toBe("76a9144a5fba237213a062f6f57978f796390bdcf8d01588ac");
                    expect(transaction.outs[0].value).toBe(400057456);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script0)).toBe("17nFgS1YaDPnXKMPQkZVdNQqZnVqRgBwnZ");
                    var script1 = transaction.outs[1].script.buffer.toString('hex');
                    expect(script1).toBe("76a9145be32612930b8323add2212a4ec03c1562084f8488ac");
                    expect(transaction.outs[1].value).toBe(40000000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script1)).toBe("19Nrc2Xm226xmSbeGZ1BVtX7DUm4oCx8Pm");

                    expect(realToAddresses.length).toBe(2);
                    expect(realToAddresses[0]).toBe("19Nrc2Xm226xmSbeGZ1BVtX7DUm4oCx8Pm");
                    expect(realToAddresses[1]).toBe("17nFgS1YaDPnXKMPQkZVdNQqZnVqRgBwnZ");
                }

                testCreateSignedSerializedTransactionHexAndBIP69_2_1();
                testCreateSignedSerializedTransactionHexAndBIP69_2_2();
            });

            it('test testCreateSignedSerializedTransactionHexAndBIP69_3', function () {
                var feeAmount = TLCoin.fromString("0.00000", TLCoin.TLBitcoinDenomination.BTC);
                var toAddress = "1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv";
                var toAddress2 = "vJmwhHhMNevDQh188gSeHd2xxxYGBQmnVuMY2yG2MmVTC31UWN5s3vaM3xsM2Q1bUremdK1W7eNVgPg1BnvbTyQuDtMKAYJanahvse";
                var toAmount = TLCoin.fromString("1", TLCoin.TLBitcoinDenomination.BTC);
                var toAmount2 = TLCoin.fromString("24", TLCoin.TLBitcoinDenomination.BTC);
                var txid0 = "35288d269cee1941eaebb2ea85e32b42cdb2b04284a56d8b14dcc3f5c65d6055";
                var txid1 = "35288d269cee1941eaebb2ea85e32b42cdb2b04284a56d8b14dcc3f5c65d6055";

                var unspentOutput0 = mockUnspentOutput(txid0, 100000000, 0);
                var unspentOutput1 = mockUnspentOutput(txid1, 2400000000, 1);
                var nonce = 123;
                var ephemeralPrivateKeyHex = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

                function testCreateSignedSerializedTransactionHexAndBIP69_3_1() {
                    var toAddressesAndAmounts = [
                        {"address": toAddress, "amount": toAmount},
                        {"address": toAddress2, "amount": toAmount2}
                    ];
                    accountObject.unspentOutputs = [
                        unspentOutput0,
                        unspentOutput1
                    ];
                    var ret = godSend.createSignedSerializedTransactionHexWithStealthData(toAddressesAndAmounts, feeAmount,
                        nonce, ephemeralPrivateKeyHex, function (errorString) {
                            console.log('createSignedSerializedTransactionHex errorString ' + errorString);
                        });

                    var txHex = ret[0]["txHex"];
                    var txHash = ret[0]["txHash"];
                    var realToAddresses = ret[1];
                    expect(txHash).toBe("9debd8fa98772ef4110fc3eb07a0a172e7704a148708ada788b2b5560efd445f");
                    expect(txHex).toBe("010000000255605dc6f5c3dc148b6da58442b0b2cd422be385eab2ebea4119ee9c268d2835000000006b483045022100bb8786c01153753ab524a4a40c4d0635489e6bd68ded28e63b06f661977fa9fc022055bcba9bd538a5bb2c375c9b76f64c8a5e65f8d609fe50413d65c71afa6d31c40121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff55605dc6f5c3dc148b6da58442b0b2cd422be385eab2ebea4119ee9c268d2835010000006a47304402202c4c09455e0fc246617575d335194253a98bfb516943b3c0f14bb40f2676717402200af78f6591c26fc34910f4e43bde46c24538e500c71a781e2fb359b425fbca8e0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff030000000000000000286a26060000007b03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd00e1f505000000001976a914c73015fa62d972ebb3b241fe8c936657b13fabd788ac00180d8f000000001976a914d9bbccb1b996061b735b35841d90844c263fbc7388ac00000000");

                    var transaction = Bitcoin.Transaction.fromHex(txHex);
                    expect(transaction.ins.length).toBe(2);
                    expect(transaction.ins[0].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid0));
                    expect(transaction.ins[0].index).toBe(0);
                    expect(transaction.ins[1].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid1));
                    expect(transaction.ins[1].index).toBe(1);

                    expect(transaction.outs.length).toBe(3);
                    var script0 = transaction.outs[0].script.buffer.toString('hex');
                    expect(script0).toBe("6a26060000007b03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd");
                    expect(transaction.outs[0].value).toBe(0);
                    var script1 = transaction.outs[1].script.buffer.toString('hex');
                    expect(script1).toBe("76a914c73015fa62d972ebb3b241fe8c936657b13fabd788ac");
                    expect(transaction.outs[1].value).toBe(100000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script1)).toBe("1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv");
                    var script2 = transaction.outs[2].script.buffer.toString('hex');
                    expect(script2).toBe("76a914d9bbccb1b996061b735b35841d90844c263fbc7388ac");
                    expect(transaction.outs[2].value).toBe(2400000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script2)).toBe("1LrGcAw6WPFK4re5mt4MQfXj9xLeBYojRm");

                    expect(realToAddresses.length).toBe(2);
                    expect(realToAddresses[0]).toBe("1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv");
                    expect(realToAddresses[1]).toBe("1LrGcAw6WPFK4re5mt4MQfXj9xLeBYojRm");
                }

                function testCreateSignedSerializedTransactionHexAndBIP69_3_2() {
                    var toAddressesAndAmounts = [
                        {"address": toAddress2, "amount": toAmount2},
                        {"address": toAddress, "amount": toAmount}
                    ];
                    accountObject.unspentOutputs = [
                        unspentOutput1,
                        unspentOutput0
                    ];
                    var ret = godSend.createSignedSerializedTransactionHexWithStealthData(toAddressesAndAmounts, feeAmount,
                        nonce, ephemeralPrivateKeyHex, function (errorString) {
                            console.log('createSignedSerializedTransactionHex errorString ' + errorString);
                        });

                    var txHex = ret[0]["txHex"];
                    var txHash = ret[0]["txHash"];
                    var realToAddresses = ret[1];
                    expect(txHash).toBe("9debd8fa98772ef4110fc3eb07a0a172e7704a148708ada788b2b5560efd445f");
                    expect(txHex).toBe("010000000255605dc6f5c3dc148b6da58442b0b2cd422be385eab2ebea4119ee9c268d2835000000006b483045022100bb8786c01153753ab524a4a40c4d0635489e6bd68ded28e63b06f661977fa9fc022055bcba9bd538a5bb2c375c9b76f64c8a5e65f8d609fe50413d65c71afa6d31c40121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff55605dc6f5c3dc148b6da58442b0b2cd422be385eab2ebea4119ee9c268d2835010000006a47304402202c4c09455e0fc246617575d335194253a98bfb516943b3c0f14bb40f2676717402200af78f6591c26fc34910f4e43bde46c24538e500c71a781e2fb359b425fbca8e0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff030000000000000000286a26060000007b03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd00e1f505000000001976a914c73015fa62d972ebb3b241fe8c936657b13fabd788ac00180d8f000000001976a914d9bbccb1b996061b735b35841d90844c263fbc7388ac00000000");

                    var transaction = Bitcoin.Transaction.fromHex(txHex);
                    expect(transaction.ins.length).toBe(2);
                    expect(transaction.ins[0].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid0));
                    expect(transaction.ins[0].index).toBe(0);
                    expect(transaction.ins[1].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid1));
                    expect(transaction.ins[1].index).toBe(1);

                    expect(transaction.outs.length).toBe(3);
                    var script0 = transaction.outs[0].script.buffer.toString('hex');
                    expect(script0).toBe("6a26060000007b03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd");
                    expect(transaction.outs[0].value).toBe(0);
                    var script1 = transaction.outs[1].script.buffer.toString('hex');
                    expect(script1).toBe("76a914c73015fa62d972ebb3b241fe8c936657b13fabd788ac");
                    expect(transaction.outs[1].value).toBe(100000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script1)).toBe("1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv");
                    var script2 = transaction.outs[2].script.buffer.toString('hex');
                    expect(script2).toBe("76a914d9bbccb1b996061b735b35841d90844c263fbc7388ac");
                    expect(transaction.outs[2].value).toBe(2400000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script2)).toBe("1LrGcAw6WPFK4re5mt4MQfXj9xLeBYojRm");

                    expect(realToAddresses.length).toBe(2);
                    expect(realToAddresses[0]).toBe("1LrGcAw6WPFK4re5mt4MQfXj9xLeBYojRm");
                    expect(realToAddresses[1]).toBe("1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv");
                }

                testCreateSignedSerializedTransactionHexAndBIP69_3_1();
                testCreateSignedSerializedTransactionHexAndBIP69_3_2();
            });

            it('test testCreateSignedSerializedTransactionHexAndBIP69_4', function () {
                var feeAmount = TLCoin.fromString("0.00002735", TLCoin.TLBitcoinDenomination.BTC);
                var toAddress = "vJmwhHhMNevDQh188gSeHd2xxxYGBQmnVuMY2yG2MmVTC31UWN5s3vaM3xsM2Q1bUremdK1W7eNVgPg1BnvbTyQuDtMKAYJanahvse";
                var toAddress2 = "19Nrc2Xm226xmSbeGZ1BVtX7DUm4oCx8Pm";
                var toAmount = TLCoin.fromString("4.00057456", TLCoin.TLBitcoinDenomination.BTC);
                var toAmount2 = TLCoin.fromString("400", TLCoin.TLBitcoinDenomination.BTC);

                var txid0 = "0e53ec5dfb2cb8a71fec32dc9a634a35b7e24799295ddd5278217822e0b31f57";
                var txid1 = "26aa6e6d8b9e49bb0630aac301db6757c02e3619feb4ee0eea81eb1672947024";
                var txid2 = "28e0fdd185542f2c6ea19030b0796051e7772b6026dd5ddccd7a2f93b73e6fc2";
                var txid3 = "381de9b9ae1a94d9c17f6a08ef9d341a5ce29e2e60c36a52d333ff6203e58d5d";
                var txid4 = "3b8b2f8efceb60ba78ca8bba206a137f14cb5ea4035e761ee204302d46b98de2";
                var txid5 = "402b2c02411720bf409eff60d05adad684f135838962823f3614cc657dd7bc0a";
                var txid6 = "54ffff182965ed0957dba1239c27164ace5a73c9b62a660c74b7b7f15ff61e7a";
                var txid7 = "643e5f4e66373a57251fb173151e838ccd27d279aca882997e005016bb53d5aa";
                var txid8 = "6c1d56f31b2de4bfc6aaea28396b333102b1f600da9c6d6149e96ca43f1102b1";
                var txid9 = "7a1de137cbafb5c70405455c49c5104ca3057a1f1243e6563bb9245c9c88c191";
                var txid10 = "7d037ceb2ee0dc03e82f17be7935d238b35d1deabf953a892a4507bfbeeb3ba4";
                var txid11 = "a5e899dddb28776ea9ddac0a502316d53a4a3fca607c72f66c470e0412e34086";
                var txid12 = "b4112b8f900a7ca0c8b0e7c4dfad35c6be5f6be46b3458974988e1cdb2fa61b8";
                var txid13 = "bafd65e3c7f3f9fdfdc1ddb026131b278c3be1af90a4a6ffa78c4658f9ec0c85";
                var txid14 = "de0411a1e97484a2804ff1dbde260ac19de841bebad1880c782941aca883b4e9";
                var txid15 = "f0a130a84912d03c1d284974f563c5949ac13f8342b8112edff52971599e6a45";
                var txid16 = "f320832a9d2e2452af63154bc687493484a0e7745ebd3aaf9ca19eb80834ad60";

                var unspentOutput0 = mockUnspentOutput(txid0, 2529937904, 0);
                var unspentOutput1 = mockUnspentOutput(txid1, 2521656792, 1);
                var unspentOutput2 = mockUnspentOutput(txid2, 2509683086, 0);
                var unspentOutput3 = mockUnspentOutput(txid3, 2506060377, 1);
                var unspentOutput4 = mockUnspentOutput(txid4, 2510645247, 0);
                var unspentOutput5 = mockUnspentOutput(txid5, 2502325820, 1);
                var unspentOutput6 = mockUnspentOutput(txid6, 2525953727, 1);
                var unspentOutput7 = mockUnspentOutput(txid7, 2507302856, 0);
                var unspentOutput8 = mockUnspentOutput(txid8, 2534185804, 1);
                var unspentOutput9 = mockUnspentOutput(txid9, 136219905, 0);
                var unspentOutput10 = mockUnspentOutput(txid10, 2502901118, 1);
                var unspentOutput11 = mockUnspentOutput(txid11, 2527569363, 0);
                var unspentOutput12 = mockUnspentOutput(txid12, 2516268302, 0);
                var unspentOutput13 = mockUnspentOutput(txid13, 2521794404, 0);
                var unspentOutput14 = mockUnspentOutput(txid14, 2520533680, 1);
                var unspentOutput15 = mockUnspentOutput(txid15, 2513840095, 0);
                var unspentOutput16 = mockUnspentOutput(txid16, 2513181711, 0);

                var nonce = 123;
                var ephemeralPrivateKeyHex = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

                function testCreateSignedSerializedTransactionHexAndBIP69_4_1() {
                    var toAddressesAndAmounts = [
                        {"address": toAddress, "amount": toAmount},
                        {"address": toAddress2, "amount": toAmount2}
                    ];
                    accountObject.unspentOutputs = [
                        unspentOutput0,
                        unspentOutput1,
                        unspentOutput2,
                        unspentOutput3,
                        unspentOutput4,
                        unspentOutput5,
                        unspentOutput6,
                        unspentOutput7,
                        unspentOutput8,
                        unspentOutput9,
                        unspentOutput10,
                        unspentOutput11,
                        unspentOutput12,
                        unspentOutput13,
                        unspentOutput14,
                        unspentOutput15,
                        unspentOutput16
                    ];
                    var ret = godSend.createSignedSerializedTransactionHexWithStealthData(toAddressesAndAmounts, feeAmount,
                        nonce, ephemeralPrivateKeyHex, function (errorString) {
                            console.log('createSignedSerializedTransactionHex errorString ' + errorString);
                        });

                    var txHex = ret[0]["txHex"];
                    var txHash = ret[0]["txHash"];
                    var realToAddresses = ret[1];
                    expect(txHash).toBe("b982687699c5bbd6ee36b157c3b34b3d3370945e68b63c987cdf880dbe475706");
                    expect(txHex).toBe("0100000011571fb3e02278217852dd5d299947e2b7354a639adc32ec1fa7b82cfb5dec530e000000006b483045022100d9e6a6677e63574fd5216957f0652334acf64343192064c4f19c5c8daad1f796022041cbcc403865f92b2804e2d04cfa165dd42bd75c247055c626901507479f923c0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff2470947216eb81ea0eeeb4fe19362ec05767db01c3aa3006bb499e8b6d6eaa26010000006a47304402204a6451764251502cfdcac44deab397e538e5c33fdf354116bcf3dd8088b47c450220345f69761d82e03e88dce29f37e6bccdffce78e3b640d089a377079950006fba0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffc26f3eb7932f7acddc5ddd26602b77e7516079b03090a16e2c2f5485d1fde028000000006b48304502210080577b722d775c9ab9acba7f90b6ee0187395c65824c52ee96a83d9582b27761022063aafc98452e62ee85d99082c96d9dae4071ed0b5f822a4ab211428336e937440121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff5d8de50362ff33d3526ac3602e9ee25c1a349def086a7fc1d9941aaeb9e91d38010000006b483045022100a2279a85d58b05822dbc1ba9cb4c22a9efaf4e3e2d0aaf4c140f6232b90339cf02202e88942afcc0defc3839e764e7358e5065e9bcc6a437f3a1f9e60a912e5cd0180121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffe28db9462d3004e21e765e03a45ecb147f136a20ba8bca78ba60ebfc8e2f8b3b000000006b483045022100d431504d890b2acdc45f618ddc53c2a7accb01d9273afbaa31d5beb71c9bb4de02200797a199a0783d16397152db1159fc8594946ca876ef3586f06be36afc0915230121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff0abcd77d65cc14363f8262898335f184d6da5ad060ff9e40bf201741022c2b40010000006b4830450221008424d7c4bc369a735b92c0f367f5bead679bc82b77ac3ea527002a795299e5cd02200bd017178c46caf204cd3283daed2539a525051e3a73f10f23175d4a90a6d21e0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff7a1ef65ff1b7b7740c662ab6c9735ace4a16279c23a1db5709ed652918ffff54010000006b483045022100bec61f4a8aa3ed122f02663d162ea8d06b65730a1400bb58586783c4155c4ecc022037ba1f6434685252902ca095317299e9facb634216e94677e444182c15d4b8dc0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffaad553bb1650007e9982a8ac79d227cd8c831e1573b11f25573a37664e5f3e64000000006b483045022100b090ff8248aa3f6ea9026861ecbf91e60859801d04fbc4ad54eb3f7497a482c90220128a6dcb1d2d17033aa3e002fcec7fa54b0f817f56abf14d5d37574f2dcf2d1d0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffb102113fa46ce949616d9cda00f6b10231336b3928eaaac6bfe42d1bf3561d6c010000006b483045022100cb8f6d41cb664bee9fe86417e6b6b61452fdcc7c652fe66c46cddae49a678fcb02201f8c040f0a034602015ad2cbf4e6c058077366633c7d3fd5df626de03a091e7b0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff91c1889c5c24b93b56e643121f7a05a34c10c5495c450504c7b5afcb37e11d7a000000006a47304402200cd323984290d2ef6d7ad01942102ea0cceee9b897103ef385719c6f2b57963702201d9dd8c3ea68ea02b6a3ee4a19c18f899d8b02da549f914dd917489c067e7e8e0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffa43bebbebf07452a893a95bfea1d5db338d23579be172fe803dce02eeb7c037d010000006b483045022100be493ef5d839eea19d68e8a3a037fc2f7eb41655d511169a4a8b653ab9d86ca30220416cb1f8dfc83a322de2617e007521dbd408d5ef776193400351c046cbde3d780121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff8640e312040e476cf6727c60ca3f4a3ad51623500aacdda96e7728dbdd99e8a5000000006a47304402200b746b555bf44674ca15ba71ca751719311244f3ba0a5a492fe685fdf7a95dcf0220357f17f4af7a322ca18fc65ddd87580e75bb9988023a11ab00b2f4243c7b6b150121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffb861fab2cde188499758346be46b5fbec635addfc4e7b0c8a07c0a908f2b11b4000000006b4830450221008c0b600801fed1af9c9400daf9c345f27837670a7acd0f1dcdbbbeb7925bad1f022017ef87eabf09308b2f11e63dcb15c4007a907b78afcad4931f9129355ed57b390121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff850cecf958468ca7ffa6a490afe13b8c271b1326b0ddc1fdfdf9f3c7e365fdba000000006b483045022100bcfe32a695abde4c66996b9d38b6be73a70abfcbe09fcc564f4aa1e0c51fd93b0220579cb2061627efbf9ce1748284f9ecedbe72ccdbc9010cb673e64f2aa58c51d90121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffe9b483a8ac4129780c88d1babe41e89dc10a26dedbf14f80a28474e9a11104de010000006a47304402204eeedb2a870d7c1f9aa74a9edc166eda1d80a63c39c5d964c9c4b92db14c1bdd02207e70e0d5740835419f82c23580fdeed491ab872c2fe8a51b4f03fdb817ebfe850121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff456a9e597129f5df2e11b842833fc19a94c563f57449281d3cd01249a830a1f0000000006b483045022100c3c3a47e694c6e9c1d43ae89bfe97a387c45e17d99f79707a6a4df006f5561240220573c40748cc42c45038ac718963eb6385c75216b70249dfb9f8f9d67ae569b9a0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff60ad3408b89ea19caf3abd5e74e7a084344987c64b1563af52242e9d2a8320f3000000006a47304402202744a81ba331f89bc0f39c2eb241460a279347e070df57c60148dd7c6ae1778102200616c24bf72cd82a49e0419634388bed2516e4b95dc68dd846851742e15f3cec0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff030000000000000000286a26060000007b03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd7064d817000000001976a914d9bbccb1b996061b735b35841d90844c263fbc7388ac00902f50090000001976a9145be32612930b8323add2212a4ec03c1562084f8488ac00000000");

                    var transaction = Bitcoin.Transaction.fromHex(txHex);
                    expect(transaction.ins.length).toBe(17);
                    expect(transaction.ins[0].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid0));
                    expect(transaction.ins[0].index).toBe(0);
                    expect(transaction.ins[1].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid1));
                    expect(transaction.ins[1].index).toBe(1);
                    expect(transaction.ins[2].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid2));
                    expect(transaction.ins[2].index).toBe(0);
                    expect(transaction.ins[3].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid3));
                    expect(transaction.ins[3].index).toBe(1);
                    expect(transaction.ins[4].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid4));
                    expect(transaction.ins[4].index).toBe(0);
                    expect(transaction.ins[5].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid5));
                    expect(transaction.ins[5].index).toBe(1);
                    expect(transaction.ins[6].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid6));
                    expect(transaction.ins[6].index).toBe(1);
                    expect(transaction.ins[7].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid7));
                    expect(transaction.ins[7].index).toBe(0);
                    expect(transaction.ins[8].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid8));
                    expect(transaction.ins[8].index).toBe(1);
                    expect(transaction.ins[9].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid9));
                    expect(transaction.ins[9].index).toBe(0);
                    expect(transaction.ins[10].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid10));
                    expect(transaction.ins[10].index).toBe(1);
                    expect(transaction.ins[11].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid11));
                    expect(transaction.ins[11].index).toBe(0);
                    expect(transaction.ins[12].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid12));
                    expect(transaction.ins[12].index).toBe(0);
                    expect(transaction.ins[13].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid13));
                    expect(transaction.ins[13].index).toBe(0);
                    expect(transaction.ins[14].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid14));
                    expect(transaction.ins[14].index).toBe(1);
                    expect(transaction.ins[15].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid15));
                    expect(transaction.ins[15].index).toBe(0);
                    expect(transaction.ins[16].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid16));
                    expect(transaction.ins[16].index).toBe(0);

                    expect(transaction.outs.length).toBe(3);
                    var script0 = transaction.outs[0].script.buffer.toString('hex');
                    expect(script0).toBe("6a26060000007b03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd");
                    expect(transaction.outs[0].value).toBe(0);
                    var script1 = transaction.outs[1].script.buffer.toString('hex');
                    expect(script1).toBe("76a914d9bbccb1b996061b735b35841d90844c263fbc7388ac");
                    expect(transaction.outs[1].value).toBe(400057456);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script1)).toBe("1LrGcAw6WPFK4re5mt4MQfXj9xLeBYojRm");
                    var script2 = transaction.outs[2].script.buffer.toString('hex');
                    expect(script2).toBe("76a9145be32612930b8323add2212a4ec03c1562084f8488ac");
                    expect(transaction.outs[2].value).toBe(40000000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script2)).toBe("19Nrc2Xm226xmSbeGZ1BVtX7DUm4oCx8Pm");

                    expect(realToAddresses.length).toBe(2);
                    expect(realToAddresses[0]).toBe("1LrGcAw6WPFK4re5mt4MQfXj9xLeBYojRm");
                    expect(realToAddresses[1]).toBe("19Nrc2Xm226xmSbeGZ1BVtX7DUm4oCx8Pm");
                }

                function testCreateSignedSerializedTransactionHexAndBIP69_4_2() {
                    var toAddressesAndAmounts = [
                        {"address": toAddress2, "amount": toAmount2},
                        {"address": toAddress, "amount": toAmount}
                    ];
                    accountObject.unspentOutputs = [
                        unspentOutput5,
                        unspentOutput2,
                        unspentOutput15,
                        unspentOutput0,
                        unspentOutput1,
                        unspentOutput6,
                        unspentOutput4,
                        unspentOutput7,
                        unspentOutput3,
                        unspentOutput13,
                        unspentOutput9,
                        unspentOutput10,
                        unspentOutput8,
                        unspentOutput11,
                        unspentOutput14,
                        unspentOutput12,
                        unspentOutput16
                    ];
                    var ret = godSend.createSignedSerializedTransactionHexWithStealthData(toAddressesAndAmounts, feeAmount,
                        nonce, ephemeralPrivateKeyHex, function (errorString) {
                            console.log('createSignedSerializedTransactionHex errorString ' + errorString);
                        });

                    var txHex = ret[0]["txHex"];
                    var txHash = ret[0]["txHash"];
                    var realToAddresses = ret[1];
                    expect(txHash).toBe("b982687699c5bbd6ee36b157c3b34b3d3370945e68b63c987cdf880dbe475706");
                    expect(txHex).toBe("0100000011571fb3e02278217852dd5d299947e2b7354a639adc32ec1fa7b82cfb5dec530e000000006b483045022100d9e6a6677e63574fd5216957f0652334acf64343192064c4f19c5c8daad1f796022041cbcc403865f92b2804e2d04cfa165dd42bd75c247055c626901507479f923c0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff2470947216eb81ea0eeeb4fe19362ec05767db01c3aa3006bb499e8b6d6eaa26010000006a47304402204a6451764251502cfdcac44deab397e538e5c33fdf354116bcf3dd8088b47c450220345f69761d82e03e88dce29f37e6bccdffce78e3b640d089a377079950006fba0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffc26f3eb7932f7acddc5ddd26602b77e7516079b03090a16e2c2f5485d1fde028000000006b48304502210080577b722d775c9ab9acba7f90b6ee0187395c65824c52ee96a83d9582b27761022063aafc98452e62ee85d99082c96d9dae4071ed0b5f822a4ab211428336e937440121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff5d8de50362ff33d3526ac3602e9ee25c1a349def086a7fc1d9941aaeb9e91d38010000006b483045022100a2279a85d58b05822dbc1ba9cb4c22a9efaf4e3e2d0aaf4c140f6232b90339cf02202e88942afcc0defc3839e764e7358e5065e9bcc6a437f3a1f9e60a912e5cd0180121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffe28db9462d3004e21e765e03a45ecb147f136a20ba8bca78ba60ebfc8e2f8b3b000000006b483045022100d431504d890b2acdc45f618ddc53c2a7accb01d9273afbaa31d5beb71c9bb4de02200797a199a0783d16397152db1159fc8594946ca876ef3586f06be36afc0915230121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff0abcd77d65cc14363f8262898335f184d6da5ad060ff9e40bf201741022c2b40010000006b4830450221008424d7c4bc369a735b92c0f367f5bead679bc82b77ac3ea527002a795299e5cd02200bd017178c46caf204cd3283daed2539a525051e3a73f10f23175d4a90a6d21e0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff7a1ef65ff1b7b7740c662ab6c9735ace4a16279c23a1db5709ed652918ffff54010000006b483045022100bec61f4a8aa3ed122f02663d162ea8d06b65730a1400bb58586783c4155c4ecc022037ba1f6434685252902ca095317299e9facb634216e94677e444182c15d4b8dc0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffaad553bb1650007e9982a8ac79d227cd8c831e1573b11f25573a37664e5f3e64000000006b483045022100b090ff8248aa3f6ea9026861ecbf91e60859801d04fbc4ad54eb3f7497a482c90220128a6dcb1d2d17033aa3e002fcec7fa54b0f817f56abf14d5d37574f2dcf2d1d0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffb102113fa46ce949616d9cda00f6b10231336b3928eaaac6bfe42d1bf3561d6c010000006b483045022100cb8f6d41cb664bee9fe86417e6b6b61452fdcc7c652fe66c46cddae49a678fcb02201f8c040f0a034602015ad2cbf4e6c058077366633c7d3fd5df626de03a091e7b0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff91c1889c5c24b93b56e643121f7a05a34c10c5495c450504c7b5afcb37e11d7a000000006a47304402200cd323984290d2ef6d7ad01942102ea0cceee9b897103ef385719c6f2b57963702201d9dd8c3ea68ea02b6a3ee4a19c18f899d8b02da549f914dd917489c067e7e8e0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffa43bebbebf07452a893a95bfea1d5db338d23579be172fe803dce02eeb7c037d010000006b483045022100be493ef5d839eea19d68e8a3a037fc2f7eb41655d511169a4a8b653ab9d86ca30220416cb1f8dfc83a322de2617e007521dbd408d5ef776193400351c046cbde3d780121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff8640e312040e476cf6727c60ca3f4a3ad51623500aacdda96e7728dbdd99e8a5000000006a47304402200b746b555bf44674ca15ba71ca751719311244f3ba0a5a492fe685fdf7a95dcf0220357f17f4af7a322ca18fc65ddd87580e75bb9988023a11ab00b2f4243c7b6b150121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffb861fab2cde188499758346be46b5fbec635addfc4e7b0c8a07c0a908f2b11b4000000006b4830450221008c0b600801fed1af9c9400daf9c345f27837670a7acd0f1dcdbbbeb7925bad1f022017ef87eabf09308b2f11e63dcb15c4007a907b78afcad4931f9129355ed57b390121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff850cecf958468ca7ffa6a490afe13b8c271b1326b0ddc1fdfdf9f3c7e365fdba000000006b483045022100bcfe32a695abde4c66996b9d38b6be73a70abfcbe09fcc564f4aa1e0c51fd93b0220579cb2061627efbf9ce1748284f9ecedbe72ccdbc9010cb673e64f2aa58c51d90121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffffe9b483a8ac4129780c88d1babe41e89dc10a26dedbf14f80a28474e9a11104de010000006a47304402204eeedb2a870d7c1f9aa74a9edc166eda1d80a63c39c5d964c9c4b92db14c1bdd02207e70e0d5740835419f82c23580fdeed491ab872c2fe8a51b4f03fdb817ebfe850121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff456a9e597129f5df2e11b842833fc19a94c563f57449281d3cd01249a830a1f0000000006b483045022100c3c3a47e694c6e9c1d43ae89bfe97a387c45e17d99f79707a6a4df006f5561240220573c40748cc42c45038ac718963eb6385c75216b70249dfb9f8f9d67ae569b9a0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff60ad3408b89ea19caf3abd5e74e7a084344987c64b1563af52242e9d2a8320f3000000006a47304402202744a81ba331f89bc0f39c2eb241460a279347e070df57c60148dd7c6ae1778102200616c24bf72cd82a49e0419634388bed2516e4b95dc68dd846851742e15f3cec0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff030000000000000000286a26060000007b03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd7064d817000000001976a914d9bbccb1b996061b735b35841d90844c263fbc7388ac00902f50090000001976a9145be32612930b8323add2212a4ec03c1562084f8488ac00000000");

                    var transaction = Bitcoin.Transaction.fromHex(txHex);
                    expect(transaction.ins.length).toBe(17);
                    expect(transaction.ins[0].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid0));
                    expect(transaction.ins[0].index).toBe(0);
                    expect(transaction.ins[1].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid1));
                    expect(transaction.ins[1].index).toBe(1);
                    expect(transaction.ins[2].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid2));
                    expect(transaction.ins[2].index).toBe(0);
                    expect(transaction.ins[3].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid3));
                    expect(transaction.ins[3].index).toBe(1);
                    expect(transaction.ins[4].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid4));
                    expect(transaction.ins[4].index).toBe(0);
                    expect(transaction.ins[5].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid5));
                    expect(transaction.ins[5].index).toBe(1);
                    expect(transaction.ins[6].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid6));
                    expect(transaction.ins[6].index).toBe(1);
                    expect(transaction.ins[7].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid7));
                    expect(transaction.ins[7].index).toBe(0);
                    expect(transaction.ins[8].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid8));
                    expect(transaction.ins[8].index).toBe(1);
                    expect(transaction.ins[9].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid9));
                    expect(transaction.ins[9].index).toBe(0);
                    expect(transaction.ins[10].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid10));
                    expect(transaction.ins[10].index).toBe(1);
                    expect(transaction.ins[11].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid11));
                    expect(transaction.ins[11].index).toBe(0);
                    expect(transaction.ins[12].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid12));
                    expect(transaction.ins[12].index).toBe(0);
                    expect(transaction.ins[13].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid13));
                    expect(transaction.ins[13].index).toBe(0);
                    expect(transaction.ins[14].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid14));
                    expect(transaction.ins[14].index).toBe(1);
                    expect(transaction.ins[15].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid15));
                    expect(transaction.ins[15].index).toBe(0);
                    expect(transaction.ins[16].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid16));
                    expect(transaction.ins[16].index).toBe(0);

                    expect(transaction.outs.length).toBe(3);
                    var script0 = transaction.outs[0].script.buffer.toString('hex');
                    expect(script0).toBe("6a26060000007b03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd");
                    expect(transaction.outs[0].value).toBe(0);
                    var script1 = transaction.outs[1].script.buffer.toString('hex');
                    expect(script1).toBe("76a914d9bbccb1b996061b735b35841d90844c263fbc7388ac");
                    expect(transaction.outs[1].value).toBe(400057456);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script1)).toBe("1LrGcAw6WPFK4re5mt4MQfXj9xLeBYojRm");
                    var script2 = transaction.outs[2].script.buffer.toString('hex');
                    expect(script2).toBe("76a9145be32612930b8323add2212a4ec03c1562084f8488ac");
                    expect(transaction.outs[2].value).toBe(40000000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script2)).toBe("19Nrc2Xm226xmSbeGZ1BVtX7DUm4oCx8Pm");

                    expect(realToAddresses.length).toBe(2);
                    expect(realToAddresses[0]).toBe("19Nrc2Xm226xmSbeGZ1BVtX7DUm4oCx8Pm");
                    expect(realToAddresses[1]).toBe("1LrGcAw6WPFK4re5mt4MQfXj9xLeBYojRm");
                }

                testCreateSignedSerializedTransactionHexAndBIP69_4_1();
                testCreateSignedSerializedTransactionHexAndBIP69_4_2();
            });

            it('test testCreateSignedSerializedTransactionHexAndBIP69_5', function () {
                var feeAmount = TLCoin.fromString("0.00000", TLCoin.TLBitcoinDenomination.BTC);
                var toAddress = "1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv";
                var toAmount = TLCoin.fromString("8", TLCoin.TLBitcoinDenomination.BTC);
                var txid0 = "35288d269cee1941eaebb2ea85e32b42cdb2b04284a56d8b14dcc3f5c65d6055";
                var txid1 = "35288d269cee1941eaebb2ea85e32b42cdb2b04284a56d8b14dcc3f5c65d6055";

                var unspentOutput0 = mockUnspentOutput(txid0, 700000000, 0);
                var unspentOutput1 = mockUnspentOutput(txid1, 1000000000, 1);


                function testCreateSignedSerializedTransactionHexAndBIP69_5_1() {
                    var toAddressesAndAmounts = [
                        {"address": toAddress, "amount": toAmount}
                    ];
                    accountObject.unspentOutputs = [
                        unspentOutput0,
                        unspentOutput1
                    ];
                    var ret = godSend.createSignedSerializedTransactionHex(toAddressesAndAmounts, feeAmount, function (errorString) {
                        console.log('createSignedSerializedTransactionHex errorString ' + errorString);
                    });

                    var txHex = ret[0]["txHex"];
                    var txHash = ret[0]["txHash"];
                    var realToAddresses = ret[1];
                    expect(txHash).toBe("7993558323324a61028e592f8e1421ec131d48ecba09627645d7c2aec49b838e");
                    expect(txHex).toBe("010000000255605dc6f5c3dc148b6da58442b0b2cd422be385eab2ebea4119ee9c268d2835000000006a473044022044fb6ce5ce9ae0ef3d381f749612a993d98bf6c293e1e6bbc73979c0c7d7f88a0220749e495896ca230272d0d6e93a53019e2479b4829f09d574c26e21b5ef614da80121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff55605dc6f5c3dc148b6da58442b0b2cd422be385eab2ebea4119ee9c268d2835010000006a473044022020573f136e62c66ba6130b1fbe7fb87ba8cfbfd9af89227fe10a878a189c3569022043f1fcf6b88cd6befee91899ae92905074fe48ef3f82206638752db6bd90201a0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff020008af2f000000001976a914c73015fa62d972ebb3b241fe8c936657b13fabd788ac00e9a435000000001976a91482d6e3eb4cb25dfd325b4af06948d3a2e064a5f788ac00000000");

                    var transaction = Bitcoin.Transaction.fromHex(txHex);
                    expect(transaction.ins.length).toBe(2);
                    expect(transaction.ins[0].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid0));
                    expect(transaction.ins[0].index).toBe(0);
                    expect(transaction.ins[1].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid1));
                    expect(transaction.ins[1].index).toBe(1);

                    expect(transaction.outs.length).toBe(2);
                    var script0 = transaction.outs[0].script.buffer.toString('hex');
                    expect(script0).toBe("76a914c73015fa62d972ebb3b241fe8c936657b13fabd788ac");
                    expect(transaction.outs[0].value).toBe(800000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script0)).toBe("1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv");
                    var script1 = transaction.outs[1].script.buffer.toString('hex');
                    expect(script1).toBe("76a91482d6e3eb4cb25dfd325b4af06948d3a2e064a5f788ac");
                    expect(transaction.outs[1].value).toBe(900000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script1)).toBe(changeAddress);

                    expect(realToAddresses.length).toBe(1);
                    expect(realToAddresses[0]).toBe("1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv");
                }

                function testCreateSignedSerializedTransactionHexAndBIP69_5_2() {
                    var toAddressesAndAmounts = [
                        {"address": toAddress, "amount": toAmount}
                    ];
                    accountObject.unspentOutputs = [
                        unspentOutput1,
                        unspentOutput0
                    ];
                    var ret = godSend.createSignedSerializedTransactionHex(toAddressesAndAmounts, feeAmount, function (errorString) {
                        console.log('createSignedSerializedTransactionHex errorString ' + errorString);
                    });

                    var txHex = ret[0]["txHex"];
                    var txHash = ret[0]["txHash"];
                    var realToAddresses = ret[1];
                    expect(txHash).toBe("9d332311d0a172ef2f875fc76ac261ddac4debbd86cbf0711d9c86a5024423dd");
                    expect(txHex).toBe("010000000155605dc6f5c3dc148b6da58442b0b2cd422be385eab2ebea4119ee9c268d2835010000006b483045022100b5a727e693ddc88a13e50513252a3d508757a6bfbd2f4b9b369f37fac41c28c00220392dbb2f4d99c4efd1d346513e695163b1e1564399d4cc1a9f5779b04a5f03aa0121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff0200c2eb0b000000001976a91482d6e3eb4cb25dfd325b4af06948d3a2e064a5f788ac0008af2f000000001976a914c73015fa62d972ebb3b241fe8c936657b13fabd788ac00000000");

                    var transaction = Bitcoin.Transaction.fromHex(txHex);
                    expect(transaction.ins.length).toBe(1);
                    expect(transaction.ins[0].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid1));
                    expect(transaction.ins[0].index).toBe(1);

                    expect(transaction.outs.length).toBe(2);
                    var script0 = transaction.outs[0].script.buffer.toString('hex');
                    expect(script0).toBe("76a91482d6e3eb4cb25dfd325b4af06948d3a2e064a5f788ac");
                    expect(transaction.outs[0].value).toBe(200000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script0)).toBe(changeAddress);
                    var script1 = transaction.outs[1].script.buffer.toString('hex');
                    expect(script1).toBe("76a914c73015fa62d972ebb3b241fe8c936657b13fabd788ac");
                    expect(transaction.outs[1].value).toBe(800000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script1)).toBe("1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv");

                    expect(realToAddresses.length).toBe(1);
                    expect(realToAddresses[0]).toBe("1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv");
                }

                testCreateSignedSerializedTransactionHexAndBIP69_5_1();
                testCreateSignedSerializedTransactionHexAndBIP69_5_2();
            });

            it('test testCreateSignedSerializedTransactionHexAndBIP69_6', function () {
                var feeAmount = TLCoin.fromString("0.00000", TLCoin.TLBitcoinDenomination.BTC);
                var toAddress = "1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv";
                var toAddress2 = "1DZTzaBHUDM7T3QvUKBz4qXMRpkg8jsfB5";
                var toAmount = TLCoin.fromString("1", TLCoin.TLBitcoinDenomination.BTC);
                var toAmount2 = TLCoin.fromString("1", TLCoin.TLBitcoinDenomination.BTC);
                var txid0 = "35288d269cee1941eaebb2ea85e32b42cdb2b04284a56d8b14dcc3f5c65d6055";
                var txid1 = "35288d269cee1941eaebb2ea85e32b42cdb2b04284a56d8b14dcc3f5c65d6055";

                var unspentOutput0 = mockUnspentOutput(txid0, 100000000, 0);
                var unspentOutput1 = mockUnspentOutput(txid1, 100000000, 1);


                function testCreateSignedSerializedTransactionHexAndBIP69_6_1() {
                    var toAddressesAndAmounts = [
                        {"address": toAddress, "amount": toAmount},
                        {"address": toAddress2, "amount": toAmount2
                        }];
                    accountObject.unspentOutputs = [
                        unspentOutput0,
                        unspentOutput1
                    ];
                    var ret = godSend.createSignedSerializedTransactionHex(toAddressesAndAmounts, feeAmount, function (errorString) {
                        console.log('createSignedSerializedTransactionHex errorString ' + errorString);
                    });

                    var txHex = ret[0]["txHex"];
                    var txHash = ret[0]["txHash"];
                    var realToAddresses = ret[1];
                    expect(txHash).toBe("1b27e859e51c272c6fa539e8579649cf0ba3d6ac560c38e3d93d83edd85adedc");
                    expect(txHex).toBe("010000000255605dc6f5c3dc148b6da58442b0b2cd422be385eab2ebea4119ee9c268d2835000000006b483045022100a24aec6b79e3907be855490f4e9e4a7c28c67181b707df50599e1b7381f578810220275c84a766f8088e92de8e01de291ce7edc50a7dc8e8afa28741fe80c0ab91860121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff55605dc6f5c3dc148b6da58442b0b2cd422be385eab2ebea4119ee9c268d2835010000006a473044022014ed6ef24ff1048d29ec8b2ed8602299e85b4a39a98df7cc3f0ea02db11a345c022008d955f96e52fc85d2fe0d42c6f3c4b04fc6b43ef87978c4a01c10afb59041a40121027ecba9ebc4699df7f557c4e18192efb5c97b1ff4ecdcebb4e21bb7d1fed2203affffffff0200e1f505000000001976a91489c55a3ca6676c9f7f260a6439c83249b747380288ac00e1f505000000001976a914c73015fa62d972ebb3b241fe8c936657b13fabd788ac00000000");

                    var transaction = Bitcoin.Transaction.fromHex(txHex);
                    expect(transaction.ins.length).toBe(2);
                    expect(transaction.ins[0].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid0));
                    expect(transaction.ins[0].index).toBe(0);
                    expect(transaction.ins[1].hash.toString('hex')).toBe(TLBitcoinJSWrapper.reverseHexString(txid1));
                    expect(transaction.ins[1].index).toBe(1);

                    expect(transaction.outs.length).toBe(2);
                    var script0 = transaction.outs[0].script.buffer.toString('hex');
                    expect(script0).toBe("76a91489c55a3ca6676c9f7f260a6439c83249b747380288ac");
                    expect(transaction.outs[0].value).toBe(100000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script0)).toBe("1DZTzaBHUDM7T3QvUKBz4qXMRpkg8jsfB5");
                    var script1 = transaction.outs[1].script.buffer.toString('hex');
                    expect(script1).toBe("76a914c73015fa62d972ebb3b241fe8c936657b13fabd788ac");
                    expect(transaction.outs[1].value).toBe(100000000);
                    expect(TLBitcoinJSWrapper.getAddressFromOutputScript(script1)).toBe("1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv");

                    expect(realToAddresses.length).toBe(2);
                    expect(realToAddresses[0]).toBe("1KAD5EnzzLtrSo2Da2G4zzD7uZrjk8zRAv");
                    expect(realToAddresses[1]).toBe("1DZTzaBHUDM7T3QvUKBz4qXMRpkg8jsfB5");
                }

                testCreateSignedSerializedTransactionHexAndBIP69_6_1();
            });
        });
//*/
    });
