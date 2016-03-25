/*
 * @fileOverview Main object for generic dark wallet api.
 */
'use strict';

define(function() {
// ArcBit object.
    var ArcBit = {

        /**
         * Internal api version. Gets saved by the backend as servicesStatus.apiVersion,
         * so frontend code can see if the backend needs to be restarted.
         * check like:
         *
         *  ArcBit.apiVersion === ArcBit.core.servicesStatus.apiVersion
         */
        apiVersion: 5,

        /**
         * Get the wallet service.
         *
         * @returns {Object}
         */
        get core() {return chrome.extension.getBackgroundPage();},

        /**
         * Get a service from the background script.
         *
         * @returns {Object}
         */
        get service() {return ArcBit.core.getServices();},

        /**
         * Identity key ring. Holds all identities.
         *
         * @returns {Object}
         */
        getKeyRing: function() {return ArcBit.core.getKeyRing();},

        /**
         * Get identity
         *
         * @param {Number} [idx] Index of the identity, default is current.
         * @returns {Object}
         */
        getIdentity: function(idx) {return ArcBit.core.getIdentity(idx);}
    };
    return ArcBit;
});
