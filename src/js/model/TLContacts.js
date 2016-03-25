'use strict';

define(['bitcoinjs-lib', 'crypto-js'], function(Bitcoin, CryptoJS) {

    function TLContacts(appDelegate) {
        this.appDelegate = appDelegate;
        var addressBook = this.appDelegate.appWallet.getAddressBook();
        var contacts = [];
        var self = this;
        addressBook.forEach(function(contact) {
            contacts.push({
                name: contact.name,
                address: contact.addr,
                hash: self.generateAddressHash(contact.addr)});
        });
        this.contacts = contacts;
    }

    TLContacts.prototype.generateAddressHash = function(address) {
        return CryptoJS.SHA256(address).toString();
    };

    TLContacts.prototype.addContact = function (contact) {
        this.appDelegate.appWallet.addAddressBookEntry(contact.address, contact.name);
        var newContact = {
            name: contact.name,
            address: contact.address,
            hash: this.generateAddressHash(contact.address)};
        this.contacts.push(newContact);
        return newContact;
    };

    TLContacts.prototype.deleteContact = function (contact) {
        var i = this.contacts.indexOf(contact);
        if (i === -1) {
            throw new Error('Contact does not exist!');
        }
        this.appDelegate.appWallet.deleteAddressBookEntry(i);
        this.contacts.splice(i, 1);
    };

    TLContacts.prototype.editName = function (contact, name) {
        var i = this.contacts.indexOf(contact);
        if (i === -1) {
            throw new Error('Contact does not exist!');
        }
        this.appDelegate.appWallet.editAddressBookEntry(i, name);
    };

    return TLContacts;
});
