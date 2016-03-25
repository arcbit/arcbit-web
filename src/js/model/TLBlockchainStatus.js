'use strict';

define([],
    function() {
        function TLBlockchainStatus() {
            this.blockHeight = Number.MAX_VALUE;
        }

        TLBlockchainStatus.prototype.getBlockHeight = function() {
            return this.blockHeight;
        };

        return TLBlockchainStatus;
    });
