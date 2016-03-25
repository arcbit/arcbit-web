ArcBit
===========
Bitcoin web wallet for Chrome. Visit http://www.arcbit.io/ for more information.


ArcBit Web is a port of ArcBit iOS project found here https://github.com/arcbit/arcbit-ios
You may notice similarities of the UI to the DarkWallet project (https://github.com/darkwallet/darkwallet). This is because a lot of the frontend code was taken from there and used in ArcBit. However, from a functional standpoint, ArcBit is very different then DarkWallet. ArcBit uses Insight or blockchain.info (depending on what the user picked in settings) to fetch blockchain data and an ArcBit server to keep track of reusable address transactions. ArcBit also gives the user the 2 different options to manage their wallet security.
1. You can have the ArcBit Wallet always encrypted in the browsers local storage. This means that you will always require to enter your login/decryption password (by default it is the 12 word seed that is generated for you when you create a wallet) when you close the ArcBit wallet tab or Chrome.
2. Alternatively you can have your ArcBit Wallet encrypted only if you explicitly click logout. This means that if you just close the ArcBit Wallet browser tab or even if you exit Chrome without clicking logout, you can reopen ArcBit without having to login.

#####Chrome store link:
https://chrome.google.com/webstore/detail/arcbit-bitcoin-wallet/dkceiphcnbfahjbomhpdgjmphnpgogfk

#####Other ArcBit services:
https://itunes.apple.com/app/arcbit-bitcoin-wallet/id999487888
https://arcbitbrainwallet.com

#####Features:
- No signup required
- Single recovery passphrase that works forever
- Private keys never leave your device
- Send and receive bitcoin payments
- View transactions and wallet balance
- HD wallet support
- Reusable/stealth address support
- Over 150 local currencies support
- Bitcoin, millibits and bits denomination support
- Automatic cycling of addresses to prevent address reuse
- Open source
- Strong encryption
- xpub keys stored client side unlike many other wallets, which offers better privacy
- Can access private keys without an internet connection
- Advance mode for Bitcoin experts


#####Features only available on web, but not on mobile:
- Multiple wallets(identities) instead of one per device.
- Ability to backup/restore from a encrypted file, that includes all wallet metadata, not just bitcoins
- Multiple outputs in transaction
- A brain wallet tool that allow for the creation of wallets and transactions from cold storage
- Sign/Verify signatures

##### Advance features:
- Pick Your Preferred block explorer API, currently we support Bitpay’s Insight and blockchain.info. You can also point ArcBit to your own Insight Server.
- Import private keys support
- Import BIP38 encrypted private keys support
- Import watch only addresses support
- Import HD wallet account keys support
- Import HD wallet watch only account keys support
