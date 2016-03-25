'use strict';

define([],
    function() {

        function TLStealthServerConfig() {
            this.stealthServerUrl = "www.arcbit.net";
            this.stealthServerPort = 443;
            this.webSocketServerPort = 443;
            this.webServerProtocol = "https";
            this.webSocketProtocol = "wss";
            this.webSocketEndpoint = "/inv";
        }

        TLStealthServerConfig.prototype.getWebServerProtocol = function() {
            return this.webServerProtocol;
        };

        TLStealthServerConfig.prototype.getWebSocketProtocol = function() {
            return this.webSocketProtocol;
        };

        TLStealthServerConfig.prototype.getWebSocketEndpoint = function() {
            return this.webSocketEndpoint;
        };

        TLStealthServerConfig.prototype.getStealthServerUrl = function() {
            return this.stealthServerUrl;
        };

        TLStealthServerConfig.prototype.getStealthServerPort = function() {
            return this.stealthServerPort;
        };

        TLStealthServerConfig.prototype.getWebSocketServerPort = function() {
            return this.webSocketServerPort;
        };

        return TLStealthServerConfig;
    });
