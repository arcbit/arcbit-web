'use strict';

define(['model/TLBlockExplorerAPI', 'angular', 'socket-io'],
    function(TLBlockExplorerAPI, angular, io) {

        var MAX_CONSECUTIVE_FAILED_CONNECTIONS = 5;
        var CLOSE_SOCKET_AFTER_SOME_SECONDS = 900000; // 15 minutes
        var $interval = angular.injector(['ng']).get('$interval');
        var $timeout = angular.injector(['ng']).get('$timeout');

        function TLBitcoinListener(appDelegate) {
            this.consecutiveFailedConnections = 0;
            this.appDelegate = appDelegate;
            this.connected = false;
            this.blockExplorerAPI = appDelegate.preferences.getSelectedBlockExplorerAPI();
            this.sendEmptyPacket = null;
            this.keepClose = false;
            this.dontReopen = false;
        }

        TLBitcoinListener.prototype.reconnect = function() {
            var self = this;
            if (this.blockExplorerAPI == TLBlockExplorerAPI.TLBlockExplorer.BLOCKCHAIN) {
                try {
                    this.webSocket = new WebSocket('wss://ws.blockchain.info/inv');
                } catch (e) {
                    console.log("TLBitcoinListener error: " + e);
                }

                this.webSocket.onopen = function(evt) {
                    console.log("TLBitcoinListener onopen");
                    self.connected = true;
                    self.consecutiveFailedConnections = 0;
                    //self.webSocket.send('{"op":"unconfirmed_sub"}');
                    //self.webSocket.send('{"op":"ping_block"}');
                    self.webSocket.send('{"op":"blocks_sub"}');
                    self.appDelegate.listenToIncomingTransactionForWallet();

                    self.keepAlive();
                    self.closeSocketAfterTime();
                };
                this.webSocket.onclose = function(evt) {
                    console.log("TLBitcoinListener onclose");
                    self.connected = false;
                    if (self.webSocket != null) {
                        self.webSocket.close();
                        self.webSocket = null;
                    }
                    self.appDelegate.setWalletTransactionListenerClosed();
                    if (self.consecutiveFailedConnections++ < MAX_CONSECUTIVE_FAILED_CONNECTIONS && !self.keepClose) {
                        if (self.dontReopen) {
                            self.dontReopen = false;
                        } else {
                            self.reconnect();
                        }
                    }
                };
                this.webSocket.onerror = function(evt) {
                    console.log("TLBitcoinListener onerror");
                    self.webSocket.close();
                    self.webSocket = null;
                    if (self.consecutiveFailedConnections++ < MAX_CONSECUTIVE_FAILED_CONNECTIONS && !self.keepClose) {
                        self.reconnect();
                    }
                };
                this.webSocket.onmessage = function(evt) {
                    var obj = JSON.parse(evt.data);
                    //console.log("TLBitcoinListener onmessage " + JSON.stringify(obj));
                    //console.log("TLBitcoinListener onmessage " + obj.op);
                    if (obj.op == 'utx') {
                        self.appDelegate.updateModelWithNewTransaction(obj.x);
                    } else if (obj.op == 'block') {
                        self.appDelegate.updateModelWithNewBlock(obj.x);

                    }
                };
            } else {
                this.blockExplorerURL = this.appDelegate.preferences.getSelectedBlockExplorerURL(this.blockExplorerAPI,
                    this.appDelegate.preferences.getSelectedBlockExplorerURLIdx());

                this.socket = io.connect(this.blockExplorerURL);
                this.socket.on('connect', function(){
                    console.log("socketio connect");
                    self.connected = true;
                    self.consecutiveFailedConnections = 0;
                    self.appDelegate.listenToIncomingTransactionForWallet();

                    self.closeSocketAfterTime();
                    self.socket.emit('subscribe', 'inv');

                    self.socket.on('block', function(data) {
                        console.log("socketio block hash: " + data);
                    });
                    // self.socket.on('tx', function(data) {
                    //     console.log("TLBitcoinListener socketio tx: " + JSON.stringify(data));
                    // });
                });

                this.socket.on('disconnect', function(data){
                    console.log("socketio disconnect " + data);
                    self.connected = false;
                    if (self.socket != null) {
                        self.socket.disconnect();
                        self.socket = null;
                    }
                    self.appDelegate.setWalletTransactionListenerClosed();
                    if (self.consecutiveFailedConnections++ < MAX_CONSECUTIVE_FAILED_CONNECTIONS && !self.keepClose) {
                        if (self.dontReopen) {
                            self.dontReopen = false;
                        } else {
                            self.reconnect();
                        }
                    }
                });

                this.socket.on('error', function() {
                    console.log("socketio error");
                    self.socket.disconnect();
                    self.socket = null;
                    if (self.consecutiveFailedConnections++ < MAX_CONSECUTIVE_FAILED_CONNECTIONS && !self.keepClose) {
                        self.reconnect();
                    }
                });
            }
        };

        TLBitcoinListener.prototype.isWebSocketOpen = function() {
            return this.connected;
        };

        TLBitcoinListener.prototype.sendWebSocketMessage = function(msg) {
            //console.log("TLBitcoinListener sendWebSocketMessage " + msg);
            this.webSocket.send(msg);
            return true;
        };

        TLBitcoinListener.prototype.listenForAddress = function(address) {
            if (this.blockExplorerAPI == TLBlockExplorerAPI.TLBlockExplorer.BLOCKCHAIN) {
                if (this.connected && this.webSocket != null) {
                    //console.log("listenFor Address BLOCKCHAIN " + address);
                    return this.sendWebSocketMessage('{"op":"addr_sub", "addr":"' + address + '"}');
                }
                return false;
            } else {
                if (!this.socket) {
                    return false;
                }
                //console.log("listenFor Address " + address);
                this.socket.emit('subscribe', address);
                var self = this;
                this.socket.on(address, function (data) {
                    //console.log("address: " + address + ' : ' + data);
                    self.appDelegate.blockExplorerAPI.getTx(data, function (jsonData) {
                        self.appDelegate.updateModelWithNewTransaction(jsonData);
                    }, function (err) {
                    });
                });
                return true;
            }
        };

        TLBitcoinListener.prototype.close = function() {
            if (this.blockExplorerAPI == TLBlockExplorerAPI.TLBlockExplorer.BLOCKCHAIN) {
                if (this.webSocket != null) {
                    this.webSocket.close();
                    this.webSocket = null;
                }
            } else {
                if (this.socket) {
                    this.socket.disconnect();
                }
            }
        };

        TLBitcoinListener.prototype.closeDontReopen = function() {
            this.dontReopen = true;
            this.close();
        };

        TLBitcoinListener.prototype.closePermanently = function() {
            this.keepClose = true;
            if (this.sendEmptyPacket) {
                $interval.cancel(this.sendEmptyPacket);
            }
            this.sendEmptyPacket = null;
            this.close();
        };

        TLBitcoinListener.prototype.closeSocketAfterTime = function() {
            // close socket after wallet been open for 20 minutes
            var self = this;
            $timeout(function(){
                self.closePermanently();
            }, CLOSE_SOCKET_AFTER_SOME_SECONDS, false);
        };

        TLBitcoinListener.prototype.keepAlive = function() {
            if (this.sendEmptyPacket) {
                $interval.cancel(this.sendEmptyPacket);
                this.sendEmptyPacket = null;
            }
            var self = this;
            this.sendEmptyPacket = $interval(function() {
                if (self.connected && self.webSocket != null) {
                    self.sendWebSocketMessage("");
                } else {
                    $interval.cancel(self.sendEmptyPacket);
                }
            }, 55000);
        };

        return TLBitcoinListener;
    });
