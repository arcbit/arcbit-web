'use strict';

define(['angular'],
    function(angular) {

        var MAX_CONSECUTIVE_FAILED_CONNECTIONS = 5;
        var CLOSE_SOCKET_AFTER_SOME_SECONDS = 900000; // 15 minutes
        var $interval = angular.injector(['ng']).get('$interval');
        var $timeout = angular.injector(['ng']).get('$timeout');

        function TLStealthWebSocket(appDelegate) {
            this.consecutiveFailedConnections = 0;
            this.appDelegate = appDelegate;
            this.challenge = '0';
            this.connected = false;
            this.sendEmptyPacket = null;
            this.keepClose = false;
            this.dontReopen = false;
        }

        TLStealthWebSocket.prototype.reconnectWithDelay = function() {
            var self = this;
            $timeout(function(){
                self.reconnect();
            }, 2000, false);
        }

        TLStealthWebSocket.prototype.reconnect = function() {
            var stealthServerConfig = this.appDelegate.stealthServerConfig;
            var urlString = stealthServerConfig.getWebSocketProtocol()+'://'+this.appDelegate.preferences.getStealthExplorerURL()+
                ':'+this.appDelegate.preferences.getStealthWebSocketPort()+stealthServerConfig.getWebSocketEndpoint();
            try {
                this.webSocket = new WebSocket(urlString);
            } catch (e) {
                console.log("TLStealthWebSocket error: " + e);
            }

            var self = this;
            this.webSocket.onopen = function(evt) {
                console.log("TLStealthWebSocket onopen");
                self.connected = true;
                //self.webSocket.send('{"op":"unconfirmed_sub"}');
                //self.webSocket.send('{"op":"ping_block"}');
                self.sendMessageGetChallenge();
                self.keepAlive();
                self.closeSocketAfterTime();
            };
            this.webSocket.onclose = function(evt) {
                console.log("TLStealthWebSocket onclose");
                self.connected = false;
                if (self.webSocket != null) {
                    self.webSocket.close();
                    self.webSocket = null;
                }
                self.appDelegate.setAccountsListeningToStealthPaymentsToFalse();
                if (self.consecutiveFailedConnections++ < MAX_CONSECUTIVE_FAILED_CONNECTIONS && !self.keepClose) {
                    if (self.dontReopen) {
                        self.dontReopen = false;
                    } else {
                        self.reconnect();
                    }
                }
            };
            this.webSocket.onerror = function(evt) {
                console.log("TLStealthWebSocket onerror");
                self.webSocket.close();
                self.webSocket = null;
                if (self.consecutiveFailedConnections++ < MAX_CONSECUTIVE_FAILED_CONNECTIONS && !self.keepClose) {
                    self.reconnectWithDelay();
                }
            };
            this.webSocket.onmessage = function(evt) {
                self.consecutiveFailedConnections = 0;
                var obj = JSON.parse(evt.data);
                //console.log("TLStealthWebSocket onmessage " + JSON.stringify(obj));
                //console.log("TLStealthWebSocket onmessage " + obj.op);
                if (obj.op == 'challenge') {
                    //console.log("TLStealthWebSocket_challenge " + JSON.stringify(obj));
                    self.appDelegate.respondToStealthChallenge(obj.x);
                } else if (obj.op == 'addr_sub') {
                    //console.log("TLStealthWebSocket_addr_sub " + JSON.stringify(obj));
                    self.appDelegate.respondToStealthAddressSubscription(obj.x);
                } else if (obj.op == 'tx') {
                    //console.log("TLStealthWebSocket_tx " + JSON.stringify(obj));
                    self.appDelegate.respondToStealthPayment(obj.x);

                }
            };
        };

        TLStealthWebSocket.prototype.isWebSocketOpen = function() {
            return this.connected;
        };

        TLStealthWebSocket.prototype.sendWebSocketMessage = function(msg) {
            //console.log("TLStealthWebSocket webSocketsend " + msg);
            this.webSocket.send(msg);
            return true;
        };

        TLStealthWebSocket.prototype.sendMessagePing = function() {
            //console.log("sendMessagePing " + " " + this.connected + ' ' + this.webSocket);
            if (this.connected && this.webSocket != null) {
                return this.sendWebSocketMessage('{"op":"ping"}');
            }
        };

        TLStealthWebSocket.prototype.sendMessageGetChallenge = function() {
            //console.log("sendMessageGetChallenge " + " " + this.connected + ' ' + this.webSocket);
            if (this.connected && this.webSocket != null) {
                return this.sendWebSocketMessage('{"op":"challenge"}');
            }
        };

        TLStealthWebSocket.prototype.sendMessageSubscribeToStealthAddress = function(stealthAddress, signature) {
            //console.log("sendMessageSubscribeToStealthAddress " + stealthAddress + " " + this.connected + ' ' + this.webSocket);
            if (this.connected && this.webSocket != null) {
                return this.sendWebSocketMessage('{"op":"addr_sub", "x":{"addr":"'+ stealthAddress +'","sig":"'+signature+'"}}');
            }
        };

        TLStealthWebSocket.prototype.close = function() {
            if (this.webSocket != null) {
                this.webSocket.close();
                this.webSocket = null;
            }
        };

        TLStealthWebSocket.prototype.closeDontReopen = function() {
            this.dontReopen = true;
            this.close();
        };

        TLStealthWebSocket.prototype.closePermanently = function() {
            this.keepClose = true;
            $interval.cancel(this.sendEmptyPacket);
            this.sendEmptyPacket = null;
            this.close();
        };

        TLStealthWebSocket.prototype.closeSocketAfterTime = function() {
            // close socket after wallet been open for 20 minutes
            var self = this;
            $timeout(function(){
                self.closePermanently();
            }, CLOSE_SOCKET_AFTER_SOME_SECONDS, false);
        };


        TLStealthWebSocket.prototype.keepAlive = function() {
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

        return TLStealthWebSocket;
    });
