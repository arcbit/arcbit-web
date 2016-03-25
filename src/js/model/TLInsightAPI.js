'use strict';

define(['model/TLNetworking', 'model/TLBitcoinJSWrapper', 'model/TLCoin'],
    function(TLNetworking, TLBitcoinJSWrapper, TLCoin) {

        function TLInsightAPI(baseURL) {
            this.baseURL = baseURL;
            this.networking = new TLNetworking();
        }

        TLInsightAPI.prototype.getBlockHeight = function(success, failure) {
            var endPoint = 'api/status/';
            var parameters = {"q": "getTxOutSetInfo"};
            var url = this.baseURL + endPoint;
            this.networking.httpGET(url, parameters, function(jsonData) {
                success(jsonData);
            }, function (response) {
                failure(response);
            });
        };

        TLInsightAPI.prototype.getUnspentOutputs = function(addressArray, success, failure) {
            var endPoint = 'api/addrs/' + addressArray.join(',')+'/utxo';
            var parameters = {};
            var url = this.baseURL + endPoint;
            this.networking.httpGET(url, parameters, function(jsonData) {
                if (jsonData.constructor == Object) {
                    success(jsonData);
                } else {
                    var transansformedJsonData = TLInsightAPI.insightUnspentOutputsToBlockchainUnspentOutputs(jsonData);
                    success(transansformedJsonData);
                }
            }, function (response) {
                failure(response);
            });
        };

        TLInsightAPI.prototype.getAddressesInfo = function(addressArray, txCountFrom, allTxs, success, failure) {
            var endPoint = 'api/addrs/' + addressArray.join(',')+'/txs';
            var parameters = {"from":txCountFrom};
            var url = this.baseURL + endPoint;
            var self = this;
            this.networking.httpGET(url, parameters, function(jsonData) {
                var txs = jsonData["items"];
                var to = jsonData["to"];
                var totalItems = jsonData["totalItems"];
                if (to >= totalItems) {
                    if (allTxs.length == 0) {
                        success(TLInsightAPI.insightAddressesTxsToBlockchainMultiaddr(addressArray, txs));
                    } else {
                        allTxs = allTxs.concat(txs);
                        success(TLInsightAPI.insightAddressesTxsToBlockchainMultiaddr(addressArray, allTxs));
                    }
                } else {
                    allTxs = allTxs.concat(txs);
                    self.getAddressesInfo(addressArray, to, allTxs, success, failure);
                }
            }, function (response) {
                failure(response);
            });
        };

        TLInsightAPI.prototype.getTx = function(txHash, success, failure) {
            var endPoint = 'api/tx/' + txHash;
            var parameters = {};
            var url = this.baseURL + endPoint;
            this.networking.httpGET(url, parameters, success, failure);
        };

        TLInsightAPI.prototype.pushTx = function(txHex, success, failure) {
            var endPoint = 'api/tx/send';
            var parameters = {"rawtx": txHex};
            var url = this.baseURL + endPoint;
            this.networking.httpPOST2(url, parameters, success, failure);
        };

        TLInsightAPI.insightToBlockchainUnspentOutput = function(unspentOutputDict) {
            if (unspentOutputDict["scriptPubKey"] == null) {
                return null;
            }
            var blockchainUnspentOutputDict = {};
            var txid = unspentOutputDict["txid"];
            var txHash = TLBitcoinJSWrapper.reverseHexString(txid);
            blockchainUnspentOutputDict["tx_hash"] = txHash;
            blockchainUnspentOutputDict["tx_hash_big_endian"] = txid;
            blockchainUnspentOutputDict["tx_output_n"] = unspentOutputDict["vout"];
            blockchainUnspentOutputDict["script"] = unspentOutputDict["scriptPubKey"];
            var amount = unspentOutputDict["amount"].toFixed(8).toString(); // .toFixed(8) handles things like 1e-8
            blockchainUnspentOutputDict["value"] = TLCoin.fromString(amount, TLCoin.TLBitcoinDenomination.BTC).toNumber();
            var confirmations = unspentOutputDict["confirmations"];
            if (confirmations != null) {
                blockchainUnspentOutputDict["confirmations"] = confirmations;
            } else {
                blockchainUnspentOutputDict["confirmations"] = 0;
            }
            return blockchainUnspentOutputDict;
        };

        TLInsightAPI.insightUnspentOutputsToBlockchainUnspentOutputs = function(unspentOutputs) {
            var transansformedUnspentOutputs = [];
            for (var i = 0; i < unspentOutputs.length; i++) {
                var unspentOutput = unspentOutputs[i];
                var dict = TLInsightAPI.insightToBlockchainUnspentOutput(unspentOutput);
                if (dict != null) {
                    transansformedUnspentOutputs.push(dict);
                }
            }
            return {"unspent_outputs": transansformedUnspentOutputs};
        };

        TLInsightAPI.insightAddressesTxsToBlockchainMultiaddr = function(addressArray, txs) {
            var addressExistDict = {};
            var transansformedAddressesDict = {};
            for (var i = 0; i < addressArray.length; i++) {
                var address = addressArray[i];
                addressExistDict[address] = "";

                var transformedAddress = {
                    n_tx: 0,
                    address: address,
                    final_balance: TLCoin.zero()
                };
                transansformedAddressesDict[address] = transformedAddress;
            }

            var transformedTxs = [];
            var transansformedAddresses = [];
            for (var i = txs.length - 1; i >= 0; i--) {
                if (txs[i] == null) {
                    continue;
                }
                var tx = txs[i];
                var transformedTx = TLInsightAPI.insightTxToBlockchainTx(tx);
                if (transformedTx == null) {
                    continue;
                }
                transformedTxs.push(transformedTx);
                var inputsArray = transformedTx["inputs"];
                if (inputsArray != null) {
                    for (var j = 0; j < inputsArray.length; j++) {
                        var input = inputsArray[j];
                        var prevOut = input["prev_out"];
                        if (prevOut != null) {
                            var addr = prevOut["addr"];
                            if (addr != null && addressExistDict[addr] != null) {
                                var transformedAddress = transansformedAddressesDict[addr];
                                var addressBalance = transformedAddress["final_balance"];

                                var value = prevOut["value"];
                                addressBalance = addressBalance.subtract(new TLCoin(value));
                                transformedAddress["final_balance"] = addressBalance;
                                transformedAddress["n_tx"] = transformedAddress["n_tx"] + 1;
                            }
                        }
                    }
                }
                var outsArray = transformedTx["out"];
                if (outsArray != null) {
                    for (var j = 0; j < outsArray.length; j++) {
                        var output = outsArray[j];
                        var addr = output["addr"];
                        if (addr != null && addressExistDict[addr] != null) {
                            var transformedAddress = transansformedAddressesDict[addr];
                            var addressBalance = transformedAddress["final_balance"];

                            var value = output["value"];
                            addressBalance = addressBalance.add(new TLCoin(value));
                            transformedAddress["final_balance"] = addressBalance;
                            transformedAddress["n_tx"] = transformedAddress["n_tx"] + 1;
                        }
                    }
                }
            }

            function compare(a, b) {
                if (a.time > b.time) {
                    return -1;
                }
                if (a.time < b.time) {
                    return 1;
                }
                return 0;
            }
            transformedTxs.sort(compare);

            for (var key in transansformedAddressesDict) {
                var transformedAddress = transansformedAddressesDict[key];
                var addressBalance = transformedAddress["final_balance"];
                transformedAddress["final_balance"] = addressBalance.toNumber();
                transansformedAddresses.push(transformedAddress);
            }

            return {
                txs: transformedTxs, //should be sorted by above code
                addresses: transansformedAddresses
            };
        };

        TLInsightAPI.insightTxToBlockchainTx = function(txDict) {
            var blockchainTxDict = {};
            var vins = txDict["vin"];
            var vouts = txDict["vout"];
            if (vins == undefined && vouts == undefined && txDict["possibleDoubleSpend"] == true) {
                return null;
            }
            blockchainTxDict["hash"] = txDict["txid"];
            blockchainTxDict["ver"] = txDict["version"];
            blockchainTxDict["size"] = txDict["size"];
            var time = txDict["time"];
            if (time != null) {
                blockchainTxDict["time"] = time;
            } else {
                blockchainTxDict["time"] = Number.MAX_SAFE_INTEGER;
            }
            var confirmations = txDict["confirmations"];
            if (confirmations != null) {
                blockchainTxDict["block_height"] = confirmations;
                blockchainTxDict["confirmations"] = confirmations;
            } else {
                blockchainTxDict["block_height"] = 0;
                blockchainTxDict["confirmations"] = 0;
            }

            var inputs = [];
            if (vins != null) {
                for (var i = 0; i < vins.length; i++) {
                    var vin = vins[i];
                    var input = {};
                    input["size"] = vin["sequence"];
                    var prev_out = {};
                    var addr = vin["addr"];
                    if (addr != null) {
                        prev_out["addr"] = addr;
                    }
                    prev_out["value"] = vin["valueSat"];
                    prev_out["n"] = vin["n"];
                    input["prev_out"] = prev_out;
                    inputs.push(input);
                }
            }
            blockchainTxDict["inputs"] = inputs;

            var outs = [];
            if (vouts != null) {
                for (var i = 0; i < vouts.length; i++) {
                    var vout = vouts[i];
                    var aOut = {};
                    aOut["n"] = vout["n"];
                    if (vout["scriptPubKey"] == null) {
                        return null;
                    }
                    aOut["script"] = vout["scriptPubKey"]["hex"];
                    var addresses = vout["scriptPubKey"]["addresses"];
                    if (addresses != null && addresses.length == 1) {
                        aOut["addr"] = addresses[0];
                    }
                    aOut["value"] = TLCoin.fromString(vout["value"], TLCoin.TLBitcoinDenomination.BTC).toNumber();
                    outs.push(aOut);
                }
            }
            blockchainTxDict["out"] = outs;

            return blockchainTxDict;
        };

        return TLInsightAPI;
    });
