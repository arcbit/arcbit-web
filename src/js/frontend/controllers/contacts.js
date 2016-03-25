/**
 * @fileOverview ContactsCtrl angular controller
 */
'use strict';

define(['./module', 'arcbit', 'model/TLBitcoinJSWrapper'], function (controllers, ArcBit, TLBitcoinJSWrapper) {
    controllers.controller('ContactsCtrl', ['$scope', '$routeParams', '$location', '$route', 'modals', 'sounds', 'notify', '_Filter',
        function($scope, $routeParams, $location, $route, modals, sounds, notify, _) {

            $scope.newContact = {};
            $scope.contactToEdit = {};
            $scope.contactFormShown = false;
            $scope.editingContact = false;
            $scope.contactSection = $routeParams.section || 'overview';

            // Check the route to see if we have to connect some contact
            var initRouteContact = function(identity) {
                if ($routeParams.contactId) {
                    var id = parseInt($routeParams.contactId);
                    if (identity.appDelegate.contacts.contacts[id]) {
                        $scope.vars = { contact: identity.appDelegate.contacts.contacts[id] };
                    } else {
                        $location.path('/contacts');
                    }
                }
            };

            // Don't reload the controller if coming from this tab
            // (only on contact.html template)
            var lastRoute = $route.current;
            if ($route.current.templateUrl.indexOf('contact.html') > 0) {
                $scope.$on('$locationChangeSuccess', function(event) {
                    if ($route.current.templateUrl.indexOf('contact.html') > 0) {
                        $scope.contactSection = $route.current.pathParams.section;
                        // Overwrite the route so the template doesn't reload
                        $route.current = lastRoute;
                    }
                });
            }

            // Set the contact section
            $scope.setContactSection = function(section) {
                var dest = '/contact/';
                if (section !== 'overview') {
                    dest += section + '/';
                }
                $location.path(dest+$routeParams.contactId);
            };

            var identity = ArcBit.getIdentity();
            if (identity) {
                initRouteContact(identity);
            }
            $scope.contacts = identity.appDelegate.contacts.contacts.slice(0);
            $scope.allContacts = identity.appDelegate.contacts.contacts;
            $scope.contactSearch = '';

            $scope.pickContact = function(contact) {
                $scope.ok(contact.address);
            };

            $scope.createContact = function(contactData) {
                var identity = ArcBit.getIdentity();
                if (contactData.address && TLBitcoinJSWrapper.isValidAddress(contactData.address, identity.appDelegate.appWallet.isTestnet())) {
                    var newContact = identity.appDelegate.contacts.addContact(contactData);
                    // add to scope
                    $scope.contacts.push(newContact);
                    $scope.newContact = {};
                    $scope.contactFormShown = false;
                } else {
                    notify.warning(_('Invalid address'));
                }
                return newContact;
            };

            $scope.openEditForm = function(contact, index) {
                $scope.contactToEdit = {name: contact.name, address: contact.address};
                $scope.editingContact = index;
            };

            $scope.openContact = function(contact) {
                var identity = ArcBit.getIdentity();
                var contactIndex = identity.appDelegate.contacts.contacts.indexOf(contact);
                $location.path('/contact/'+contactIndex);
            };

            $scope.saveName = function(contact, name) {
                if (name !== contact.name) {
                    identity.appDelegate.contacts.editName(contact, name);
                    contact.name = name;
                }
                $scope.editingContact = false;
            };

            $scope.deleteContact = function(contact) {
                var contactIndex = $scope.contacts.indexOf(contact);
                if (contactIndex > -1) {
                    $scope.contacts.splice(contactIndex, 1);
                    var identity = ArcBit.getIdentity();
                    identity.appDelegate.contacts.deleteContact(contact, name);
                }
                $location.path('/contacts');
            };

            $scope.getAddressFromQRCode = function(newContact) {
                modals.scanQr(function(data) {
                    var pars = TLWalletUtils.parseURI(data);
                    if (!pars || !pars.address) {
                        notify.warning(_('URI not supported'));
                        return;
                    }
                    newContact.address = pars.address;
                    sounds.play('keygenEnd');
                });
            };

        }]);
});
