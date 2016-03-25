/**
 * @fileOverview HistoryProvider angular provider
 */
'use strict';

define(['./module', 'arcbit', 'model/TLWalletUtils'], function (providers, ArcBit, TLWalletUtils) {
    providers.factory('$tabs', ['$templateCache', '$http', '$location', '$route', 'modals', '_Filter', '$history',
        function($templateCache, $http, $location, $route, modals, _, $history) {

            var tabs = {};

            /**
             * Tabs
             */
            tabs.current = 0;

            tabs.previous = 0;
            //tabs.pocketType = 'all';
            tabs.pocketType = 'hd';
            tabs.pocketId = 0;
//  tabs.isLoggedIn = true;

            tabs.openWallet = function() {
                tabs.pages[tabs.current].select();
                $history.setBalanceView();
            }

            var index = 0;

            var Tab = function(heading, page) {
                this.index = index++;
                this.heading = heading;
                this.page = page;
                this.tplUrl = 'wallet/'+page+'.html';
            }

            Tab.prototype.isActive = function() {
                return tabs.current == this.index;
            };

            Tab.prototype.isVisible = function() {
                return tabs.visible.indexOf(this.index) > -1;
            };

            tabs.open = function(pocketType, pocketId) {
                tabs.pocketType = pocketType;
                tabs.pocketId = pocketId;
                tabs.pages[tabs.current].select();
            }

            Tab.prototype.select = function() {
                var dest = 'wallet/'+this.page;
                if (tabs.pocketType) {
                    dest += '/'+tabs.pocketType;
                }
                if (tabs.pocketId !== undefined) {
                    dest += '/'+tabs.pocketId;
                }

                $location.path(dest);

            };

            Tab.prototype.load = function(callback) {
                var self = this;
                var tplUrl = this.tplUrl;
                // Finish setting the tab
                var finish = function() {
                    tabs.previous = tabs.current;
                    tabs.current = self.index;
                    callback ? callback() : undefined;
                }
                // Load straight away or preload the template
                if ($templateCache.get(tplUrl)) {
                    finish();
                } else {
                    $http.get(tplUrl, {cache:$templateCache}).success(function() {finish();});
                }
            };


            tabs.pages = [
                new Tab('Send', 'dashboard'),
                new Tab('Receive', 'receiving_addresses'),
                new Tab('History', 'history'),
                new Tab('Addresses', 'addresses'),
                new Tab('Actions', 'actions')
            ];

            tabs.loadRoute = function(section, pocketType, pocketId, callback) {
                tabs.pocketType = pocketType;
                tabs.pocketId = pocketId;
                for(var i=0; i<tabs.pages.length; i++) {
                    if (tabs.pages[i].page == section) {
                        tabs.pages[i].load(callback);
                    }
                }
            };

            tabs.updateTabs = function() {
                var identity = ArcBit.getIdentity();
                if (identity == null) {
                    tabs.visible = [0, 1, 2, 4];
                } else {
                    if (!identity.isLocalWalletDataReady()) { return; }
                    if (tabs.pocketType == TLWalletUtils.TLSelectedAccountType.HD_WALLET ||
                        tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT ||
                        tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT) {
                        if (identity.appDelegate.preferences.enabledAdvancedMode()) {
                            tabs.visible = [0, 1, 2, 3, 4];
                        } else {
                            tabs.visible = [0, 1, 2, 4];
                        }
                    } else if (tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_ADDRESS ||
                        tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ADDRESS) {
                        tabs.visible = [0, 1, 2, 4];
                    } else if (tabs.pocketType == TLWalletUtils.TLSelectedAccountType.ARCHIVED_HD_WALLET ||
                        tabs.pocketType == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ACCOUNT ||
                        tabs.pocketType == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ACCOUNT) {
                        if (identity.appDelegate.preferences.enabledAdvancedMode()) {
                            tabs.visible = [3, 4];
                        } else {
                            tabs.visible = [4];
                        }
                    } else if (tabs.pocketType == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ADDRESS ||
                        tabs.pocketType == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ADDRESS) {
                        tabs.visible = [4];
                    }
                }
                //switch tab if new selected account does not have that tab
                if (!tabs.pages[tabs.current].isVisible()) {
                    tabs.current = tabs.visible[0];
                }
            };

            tabs.updateTabs();


            return tabs;
        }]);
});
