/*
 * @fileOverview Background service running for the wallet
 */
'use strict';

requirejs([
    'arcbit',
    'backend/port',
    'backend/services/wallet'],
    function(ArcBit, Port) {

var serviceClasses = [].splice.call(arguments, 2);

function ArcBitService(serviceClasses) {
    var self = this;

    // Backend services
    var services = this.initializeServices(serviceClasses);


    /***************************************
    /* Hook up some utility functions
     */

    this.loadIdentity = function(idx, callback) {
        return services.wallet.loadIdentity(idx, callback);
    };

    // Get an identity from the keyring
    this.getIdentity = function(idx) {
        return services.wallet.getIdentity(idx);
    };
    this.getCurrentIdentity = function() {
        return services.wallet.getCurrentIdentity();
    };

    /***************************************
    /* Global communications
     */

    this.getKeyRing = function() {
        return services.wallet.getKeyRing();
    };

    this.getServices = function() {
        return self.service;
    };
}


ArcBitService.prototype.initializeServices = function(serviceClasses) {
    this.service = {};
    var services = {};
    
    for(var i in serviceClasses) {
        var service = new serviceClasses[i](this);
        if (!service.name) {
          throw Error('Service {0} has no name property|'+ serviceClasses[i].name);
        }
        if (Object.keys(services).indexOf(service.name) !== -1) {
          throw Error('Name of service {0} repeated|'+ service.name);
        }
        services[service.name] = service;
    }
    
    // Public API
    for(var i in services) {
        Object.defineProperty(this.service, i, {
            get: function() {
                var j = services[i];
                return function() {
                    return j;
                };
            }()
        });
    };

    // We save the apiVersion here so we can check what version the backend is running
    this.servicesStatus = {apiVersion: ArcBit.apiVersion };
    return services;
};

/***************************************
/* Communications
 */
var sendInternalMessage = function(msg) {
    chrome.runtime.sendMessage(chrome.runtime.id, msg);
};

var addListener = function(callback) {
    chrome.runtime.onMessage.addListener(callback);
};


/***************************************
/* Service instance that will be running in the background page
 */
var service = new ArcBitService(serviceClasses);


/***************************************
/* Bindings for the page window so we can have easy access
 */

window.connect = function(_server) { return service.connect(_server); };

window.loadIdentity = service.loadIdentity;
window.getIdentity = function(idx) { return service.getIdentity(idx); };
window.getCurrentIdentity = service.getCurrentIdentity;

window.getKeyRing = service.getKeyRing;
window.servicesStatus = service.servicesStatus;

window.getClient = service.getClient;
window.getServices = service.getServices;

window.addListener = addListener;
window.sendInternalMessage = sendInternalMessage;
});
