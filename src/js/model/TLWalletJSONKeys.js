'use strict';

define([],
    function() {
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LOGIN_PASSWORD = "login_pw";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ENCRYPTION_VERSION = "version";
            TLWalletJSONKeys.WALLET_PAYLOAD_VERSION = "1";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_VERSION = "version";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYLOAD = "payload";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_WALLETS = "wallets";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_HDWALLETS = "hd_wallets";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ACCOUNTS = "accounts";
            TLWalletJSONKeys.WALLET_PAYLOAD_CURRENT_ACCOUNT_ID = "current_account_id";
            TLWalletJSONKeys.WALLET_PAYLOAD_IMPORTS = "imports";
            TLWalletJSONKeys.WALLET_PAYLOAD_IMPORTED_ACCOUNTS = "imported_accounts";
            TLWalletJSONKeys.WALLET_PAYLOAD_WATCH_ONLY_ACCOUNTS = "watch_only_accounts";
            TLWalletJSONKeys.WALLET_PAYLOAD_IMPORTED_PRIVATE_KEYS = "imported_private_keys";
            TLWalletJSONKeys.WALLET_PAYLOAD_WATCH_ONLY_ADDRESSES = "watch_only_addrs"; //CHANGE from watch_only_addresses
            TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX = "account_idx";
            TLWalletJSONKeys.WALLET_PAYLOAD_EXTENDED_PRIVATE_KEY = "xprv";
            TLWalletJSONKeys.WALLET_PAYLOAD_EXTENDED_PUBLIC_KEY = "xpub";
            TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_NEEDS_RECOVERING = "needs_recovering";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MAIN_ADDRESSES = "main_addrs"; //CHANGE from main_addresses
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_CHANGE_ADDRESSES = "change_addrs"; //CHANGE from change_addresses
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESSES = "stealth_addrs"; //CHANGE from stealth_addresses
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESS = "stealth_addr"; //CHANGE from stealth_address
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESS_SCAN_KEY = "scan_key";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESS_SPEND_KEY = "spend_key";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYMENTS = "payments";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_SERVERS = "servers";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_WATCHING = "watching";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_TXID = "txid";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_MAIN_ADDRESS_IDX = "min_main_addr_idx"; //CHANGE from min_main_address_idx
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_CHANGE_ADDRESS_IDX = "min_change_addr_idx"; //CHANGE from min_change_address_idx
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_TIME = "time";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_CHECK_TIME = "check_time";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LAST_TX_TIME = "last_tx_time";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_KEY = "key";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS = "addr"; //CHANGE from address
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS = "stat"; //CHANGE from status
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_INDEX = "idx"; //CHANGE from idx
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LABEL = "name"; //CHANGE from label
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_NAME = "name";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MAX_ACCOUNTS_CREATED = "max_account_id"; //CHANGE from max_account_id_created
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MASTER_HEX = "master_hex";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PASSPHRASE = "passphrase";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS_BOOK = "addr_book";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_TRANSACTION_TAGS = "tx_tags";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PREFERENCES = "preferences";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PASSWORD = "password";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_IS_TESTNET = "testnet";

            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ENCRYPTED = "encrypted";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_DATE = "date";
            TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PASSWORD_HASH = "password_hash";

            TLWalletJSONKeys.TLAccount = {
                    NORMAL: 0,
                    MULTISIG: 1
            };

            TLWalletJSONKeys.TLAddressStatus = {
                    ARCHIVED: 0,
                    ACTIVE: 1
            };

            TLWalletJSONKeys.TLAddressType = {
                    MAIN: 0,
                    CHANGE: 1,
                    STEALTH: 2
            };

            TLWalletJSONKeys.TLStealthPaymentStatus = {
                    UNSPENT: 0, // >=0 confirmations for payment tx
                    CLAIMED: 1, // 0-5 confirmations for payment tx and >=0 confirm for claimed tx
                    SPENT: 2 // > 6 confirmations for payment tx and >=0 confirm for claimed tx
            };

            function TLWalletJSONKeys() {
            }


            return TLWalletJSONKeys;
    });
